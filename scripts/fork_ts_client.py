#!/usr/bin/env python3
"""Build and install the fork TypeScript client used by the packaged web UI.

The Serve UI depends on ``@docling/docling-client``. This fork builds that
package from ``cloudiful/docling-ts`` main instead of the published tarball, so
the UI can use the cancellation-aware client before a release. The helper
clones the fork into its own cache (never the developer's primary checkout),
builds ``docling-client``, packs it, and installs the tarball into ``ui/``
without touching ``ui/package.json`` or ``ui/package-lock.json``.

Every run clones fresh, so repeated calls pick up the latest fork main; a new
client commit needs an explicit re-run, never an automatic upgrade. All
scratch/caches live under ``.cache/fork-ts-client``. Stdlib only, Python 3.10+.
"""

from __future__ import annotations

import argparse
import os
import shutil
import subprocess
import sys
from collections.abc import Sequence
from pathlib import Path

FORK_URL = "https://github.com/cloudiful/docling-ts.git"
FORK_BRANCH = "main"
CLIENT_SUBDIR = "docling-client"
CACHE_DIRNAME = Path(".cache") / "fork-ts-client"


class ForkTsClientError(RuntimeError):
    """Raised when the fork client cannot be built or installed."""


def repo_root() -> Path:
    """The docling-serve checkout that contains this script."""
    return Path(__file__).resolve().parents[1]


def _child_env(tmp_dir: Path) -> dict[str, str]:
    tmp_dir.mkdir(parents=True, exist_ok=True)
    env = dict(os.environ)
    for name in ("TMPDIR", "TMP", "TEMP"):
        env[name] = str(tmp_dir)
    return env


def _run(command: Sequence[str], cwd: Path, env: dict[str, str]) -> None:
    """Run one build step, failing fast on a non-zero exit."""
    try:
        subprocess.run(command, cwd=str(cwd), env=env, check=True)
    except FileNotFoundError as exc:
        raise ForkTsClientError(f"required executable not found: {command[0]}") from exc
    except subprocess.CalledProcessError as exc:
        raise ForkTsClientError(
            f"command failed with exit code {exc.returncode}: {' '.join(command)}"
        ) from exc


def _fresh_clone(clone_dir: Path, env: dict[str, str]) -> None:
    """Clone the fork branch from scratch so no stale checkout is reused."""
    shutil.rmtree(clone_dir, ignore_errors=True)
    clone_dir.parent.mkdir(parents=True, exist_ok=True)
    _run(
        [
            "git",
            "clone",
            "--depth",
            "1",
            "--branch",
            FORK_BRANCH,
            FORK_URL,
            str(clone_dir),
        ],
        cwd=clone_dir.parent,
        env=env,
    )


def _packed_tarball(dist_dir: Path) -> Path:
    tarballs = sorted(dist_dir.glob("docling-docling-client-*.tgz"))
    if len(tarballs) != 1:
        raise ForkTsClientError(
            f"expected one packed client tarball in {dist_dir}, found {len(tarballs)}"
        )
    return tarballs[0]


def sync_fork_ts_client(root: Path, cache_dir: Path) -> Path:
    """Build the fork client from fresh main and install it into ``ui/``.

    Returns the retained tarball path. The clone is disposable and always
    removed; the packed tarball is the artifact kept for reuse and inspection.
    """
    clone_dir = cache_dir / "clone"
    dist_dir = cache_dir / "dist"
    client_dir = clone_dir / CLIENT_SUBDIR
    ui_dir = root / "ui"
    if not (ui_dir / "package.json").is_file():
        raise ForkTsClientError(f"UI package not found under {ui_dir}")

    env = _child_env(cache_dir / "tmp")
    shutil.rmtree(dist_dir, ignore_errors=True)
    dist_dir.mkdir(parents=True, exist_ok=True)
    npm_cache = cache_dir / "npm"

    try:
        _fresh_clone(clone_dir, env)
        _run(["npm", "ci", "--cache", str(npm_cache)], cwd=client_dir, env=env)
        _run(["npm", "run", "build"], cwd=client_dir, env=env)
        _run(
            ["npm", "pack", "--pack-destination", str(dist_dir)],
            cwd=client_dir,
            env=env,
        )
        tarball = _packed_tarball(dist_dir)
        _run(
            [
                "npm",
                "--prefix",
                str(ui_dir),
                "install",
                "--no-save",
                "--package-lock=false",
                str(tarball),
            ],
            cwd=root,
            env=env,
        )
    except BaseException:
        shutil.rmtree(dist_dir, ignore_errors=True)
        raise
    finally:
        shutil.rmtree(clone_dir, ignore_errors=True)
    return tarball


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="fork_ts_client",
        description="Build the fork @docling/docling-client and install it into ui/.",
    )
    parser.add_argument(
        "--cache-dir",
        default=None,
        help="Scratch/cache directory (default: <repo>/.cache/fork-ts-client).",
    )
    return parser


def main(argv: Sequence[str] | None = None) -> int:
    args = build_parser().parse_args(argv)
    root = repo_root()
    cache_dir = (
        Path(args.cache_dir).resolve() if args.cache_dir else root / CACHE_DIRNAME
    )
    try:
        tarball = sync_fork_ts_client(root, cache_dir)
    except ForkTsClientError as exc:
        print(f"error: {exc}", file=sys.stderr)
        return 1
    print(f"installed fork @docling/docling-client from {tarball}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
