"""Fork-only packaged UI helper (LOCAL_ISSUE 92).

Verifies that a built wheel contains the generated web UI and guards that
only the generated output directory is ever staged. Stdlib only so the
workflow and local validation never pull ML dependencies.
"""

from __future__ import annotations

import argparse
import posixpath
import subprocess
import sys
import zipfile
from pathlib import Path, PurePosixPath

OUTPUT_DIR_POSIX = "docling_serve/ui_static"
WHEEL_UI_PREFIX = OUTPUT_DIR_POSIX + "/"
WHEEL_INDEX = OUTPUT_DIR_POSIX + "/index.html"
WHEEL_ASSETS_PREFIX = OUTPUT_DIR_POSIX + "/assets/"


class WheelVerificationError(ValueError):
    """Raised when a wheel does not contain a usable UI bundle."""


class StagedCheckError(ValueError):
    """Raised when staged Git paths escape the generated output directory."""


def list_wheel_ui_files(wheel: Path) -> list[str]:
    """Return sorted wheel entries under the generated UI prefix."""
    with zipfile.ZipFile(wheel) as zf:
        return sorted(n for n in zf.namelist() if n.startswith(WHEEL_UI_PREFIX))


def verify_wheel(
    wheel: Path,
    output_prefix: str = WHEEL_UI_PREFIX,
    index_name: str = WHEEL_INDEX,
    assets_prefix: str = WHEEL_ASSETS_PREFIX,
) -> list[str]:
    """Verify a wheel bundles index.html plus at least one nonempty asset.

    Returns the sorted UI entries on success; raises WheelVerificationError
    otherwise. Only stdlib zipfile is used.
    """
    if not wheel.is_file():
        raise WheelVerificationError(f"wheel not found: {wheel}")
    if wheel.suffix != ".whl":
        raise WheelVerificationError(f"not a .whl file: {wheel}")
    try:
        with zipfile.ZipFile(wheel) as zf:
            names = zf.namelist()
            infos = {info.filename: info for info in zf.infolist()}
    except zipfile.BadZipFile as exc:
        raise WheelVerificationError(f"invalid wheel zip: {wheel}: {exc}") from exc

    if index_name not in names:
        raise WheelVerificationError(
            f"wheel {wheel.name} missing {index_name}; "
            "rebuild the UI with `npm --prefix ui run build` before `uv build`"
        )
    index_size = infos[index_name].file_size
    if index_size == 0:
        raise WheelVerificationError(
            f"wheel {wheel.name} has empty {index_name}; rebuild the UI"
        )
    asset_files = [
        n
        for n in names
        if n.startswith(assets_prefix)
        and not n.endswith("/")
        and infos.get(n) is not None
        and infos[n].file_size > 0
    ]
    if not asset_files:
        raise WheelVerificationError(
            f"wheel {wheel.name} has no nonempty files under {assets_prefix}; "
            "the UI bundle is missing compiled assets"
        )
    ui_files = sorted(n for n in names if n.startswith(output_prefix))
    return ui_files


def is_within_output(output_dir: str, candidate: str) -> bool:
    """Return True iff repo-relative candidate stays inside output_dir."""
    out = posixpath.normpath(output_dir)
    if PurePosixPath(candidate).is_absolute():
        return False
    normed = posixpath.normpath(candidate)
    if normed == "." or normed == ".." or normed.startswith("../"):
        return False
    return normed == out or normed.startswith(out + "/")


def _git(repo: Path, *args: str) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        ["git", "-C", str(repo), *args],
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        check=False,
    )


def staged_files(repo: Path) -> list[str]:
    """List staged repo-relative paths (empty when nothing staged)."""
    proc = _git(repo, "diff", "--cached", "--name-only", "-z")
    if proc.returncode != 0:
        raise StagedCheckError(f"git diff --cached failed: {proc.stderr.strip()}")
    if not proc.stdout:
        return []
    return [p for p in proc.stdout.split("\0") if p]


def has_staged_changes(repo: Path) -> bool:
    """Return True when the index contains staged changes."""
    proc = _git(repo, "diff", "--cached", "--quiet")
    if proc.returncode == 0:
        return False
    if proc.returncode == 1:
        return True
    raise StagedCheckError(f"git diff --cached --quiet failed: {proc.stderr.strip()}")


def assert_staged_only_output(
    repo: Path, output_dir: str = OUTPUT_DIR_POSIX
) -> list[str]:
    """Verify every staged path lives under output_dir.

    Returns the staged list (possibly empty for the no-op case); raises
    StagedCheckError when any staged path escapes the generated output.
    Never stages, unstages, or deletes anything itself.
    """
    files = staged_files(repo)
    bad = [f for f in files if not is_within_output(output_dir, f)]
    if bad:
        raise StagedCheckError(
            "refusing generated-only commit: staged paths escape "
            f"{output_dir}/: {', '.join(sorted(bad))}"
        )
    return files


def find_wheels(dist_dir: Path) -> list[Path]:
    """Return sorted .whl files directly under dist_dir."""
    if not dist_dir.is_dir():
        return []
    return sorted(dist_dir.glob("*.whl"))


def cmd_verify_wheel(args: argparse.Namespace) -> int:
    wheels: list[Path] = []
    for raw in args.wheel or []:
        wheels.append(Path(raw))
    if args.dist_dir:
        wheels.extend(find_wheels(Path(args.dist_dir)))
    if not wheels:
        print("error: no wheels given; pass --wheel PATH or --dist-dir DIR", file=sys.stderr)
        return 2
    prefix = getattr(args, "output_prefix", WHEEL_UI_PREFIX) or WHEEL_UI_PREFIX
    if not prefix.endswith("/"):
        prefix += "/"
    index_name = prefix + "index.html"
    assets_prefix = prefix + "assets/"
    failures = 0
    for wheel in wheels:
        try:
            ui_files = verify_wheel(
                wheel,
                output_prefix=prefix,
                index_name=index_name,
                assets_prefix=assets_prefix,
            )
            print(f"ok: {wheel} bundles {len(ui_files)} UI files")
        except WheelVerificationError as exc:
            print(f"error: {exc}", file=sys.stderr)
            failures += 1
    return 1 if failures else 0


def cmd_check_staged(args: argparse.Namespace) -> int:
    repo = Path(args.repo or ".")
    output_dir = args.output_dir or OUTPUT_DIR_POSIX
    try:
        files = assert_staged_only_output(repo, output_dir)
    except StagedCheckError as exc:
        print(f"error: {exc}", file=sys.stderr)
        return 1
    if not files:
        print(f"ok: no staged changes under {output_dir}/ (no-op)")
    else:
        print(f"ok: {len(files)} staged file(s) confined to {output_dir}/")
    return 0


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="fork_ui_bundle",
        description="Verify fork UI wheels and generated-only staging (stdlib only).",
    )
    sub = parser.add_subparsers(dest="command", required=True)

    verify = sub.add_parser(
        "verify-wheel",
        help="Fail unless each wheel bundles index.html plus nonempty assets.",
    )
    verify.add_argument("--wheel", action="append", default=[], help="Wheel file to verify (repeatable).")
    verify.add_argument("--dist-dir", default=None, help="Directory to scan for *.whl (e.g. dist).")
    verify.add_argument("--output-prefix", default=WHEEL_UI_PREFIX, help="Wheel UI prefix (advanced).")
    verify.set_defaults(func=cmd_verify_wheel)

    # `verify` stays as a short alias for the documented wheel check.
    alias = sub.add_parser("verify", help="Alias for verify-wheel.")
    alias.add_argument("--wheel", action="append", default=[], help="Wheel file to verify (repeatable).")
    alias.add_argument("--dist-dir", default=None, help="Directory to scan for *.whl (e.g. dist).")
    alias.add_argument("--output-prefix", default=WHEEL_UI_PREFIX, help="Wheel UI prefix (advanced).")
    alias.set_defaults(func=cmd_verify_wheel)

    check = sub.add_parser(
        "check-staged",
        help="Fail when staged Git paths escape the generated output directory.",
    )
    check.add_argument("--repo", default=".", help="Repository root (default: .).")
    check.add_argument("--output-dir", default=OUTPUT_DIR_POSIX, help="Generated output dir.")
    check.set_defaults(func=cmd_check_staged)
    return parser


def main(argv: list[str] | None = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)
    return int(args.func(args))


if __name__ == "__main__":
    raise SystemExit(main())
