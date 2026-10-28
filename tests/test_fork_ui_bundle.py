"""Fork-only UI bundle tests (LOCAL_ISSUE 92, unittest only).

Covers helper wheel verification plus workflow guard text and disposable
local-Git safety logic. Fixtures use tempfile so the mandated
TMPDIR=$PWD/.cache/ai/92/tmp keeps them under scratch.
"""

import re
import subprocess
import sys
import tempfile
import unittest
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from scripts.fork_ui_bundle import (  # noqa: E402
    OUTPUT_DIR_POSIX,
    StagedCheckError,
    WheelVerificationError,
    assert_staged_only_output,
    find_wheels,
    has_staged_changes,
    is_within_output,
    main as helper_main,
    staged_files,
    verify_wheel,
)

WORKFLOW = ROOT / ".github" / "workflows" / "fork-ui-bundle.yml"
DOCS = ROOT / "docs" / "fork-ui-bundle.md"


def make_wheel(
    path: Path,
    *,
    with_index=True,
    with_assets=True,
    empty_index=False,
    empty_assets=False,
):
    with zipfile.ZipFile(path, "w", zipfile.ZIP_DEFLATED) as zf:
        zf.writestr("docling_serve/__init__.py", "# pkg\n")
        if with_index:
            zf.writestr(
                "docling_serve/ui_static/index.html",
                "" if empty_index else '<html><div id="root"></div></html>\n',
            )
        if with_assets:
            body = "" if empty_assets else "console.log(1);\n"
            zf.writestr("docling_serve/ui_static/assets/app.js", body)
            if not empty_assets:
                zf.writestr("docling_serve/ui_static/assets/style.css", "body{}\n")


def git_run(repo: Path, *args: str):
    proc = subprocess.run(
        ["git", "-C", str(repo), *args],
        text=True,
        capture_output=True,
        check=False,
    )
    return proc


_REPO_GUARDS: list[tempfile.TemporaryDirectory] = []


def init_repo() -> Path:
    tmp = tempfile.TemporaryDirectory(prefix="fork-ui-bundle-")
    _REPO_GUARDS.append(tmp)
    repo = Path(tmp.name)
    assert git_run(repo, "init", "-q").returncode == 0
    assert git_run(repo, "config", "user.email", "test@example.com").returncode == 0
    assert git_run(repo, "config", "user.name", "test").returncode == 0
    (repo / "docling_serve").mkdir(parents=True, exist_ok=True)
    (repo / "docling_serve" / "keep.txt").write_text("x\n")
    assert git_run(repo, "add", ".").returncode == 0
    assert git_run(repo, "commit", "-qm", "init").returncode == 0
    return repo


class WheelVerificationTests(unittest.TestCase):
    def test_ok_wheel_lists_ui_files(self):
        with tempfile.TemporaryDirectory(prefix="wheel-ok-") as d:
            wheel = Path(d) / "pkg-1.0-py3-none-any.whl"
            make_wheel(wheel)
            ui_files = verify_wheel(wheel)
            self.assertIn("docling_serve/ui_static/index.html", ui_files)
            self.assertTrue(
                any(f.startswith("docling_serve/ui_static/assets/") for f in ui_files)
            )

    def test_missing_index_rejected(self):
        with tempfile.TemporaryDirectory(prefix="wheel-noindex-") as d:
            wheel = Path(d) / "pkg-1.0-py3-none-any.whl"
            make_wheel(wheel, with_index=False)
            with self.assertRaises(WheelVerificationError):
                verify_wheel(wheel)

    def test_empty_index_rejected(self):
        with tempfile.TemporaryDirectory(prefix="wheel-emptyindex-") as d:
            wheel = Path(d) / "pkg-1.0-py3-none-any.whl"
            make_wheel(wheel, empty_index=True)
            with self.assertRaises(WheelVerificationError):
                verify_wheel(wheel)

    def test_missing_assets_rejected(self):
        with tempfile.TemporaryDirectory(prefix="wheel-noassets-") as d:
            wheel = Path(d) / "pkg-1.0-py3-none-any.whl"
            make_wheel(wheel, with_assets=False)
            with self.assertRaises(WheelVerificationError):
                verify_wheel(wheel)

    def test_empty_assets_rejected(self):
        with tempfile.TemporaryDirectory(prefix="wheel-emptyassets-") as d:
            wheel = Path(d) / "pkg-1.0-py3-none-any.whl"
            make_wheel(wheel, empty_assets=True)
            with self.assertRaises(WheelVerificationError):
                verify_wheel(wheel)

    def test_bad_zip_rejected(self):
        with tempfile.TemporaryDirectory(prefix="wheel-badzip-") as d:
            wheel = Path(d) / "pkg-1.0-py3-none-any.whl"
            wheel.write_text("not a zip\n")
            with self.assertRaises(WheelVerificationError):
                verify_wheel(wheel)

    def test_cli_verify_wheel_dist_dir(self):
        with tempfile.TemporaryDirectory(prefix="wheel-dist-") as d:
            dist = Path(d) / "dist"
            dist.mkdir()
            make_wheel(dist / "pkg-1.0-py3-none-any.whl")
            self.assertEqual(helper_main(["verify-wheel", "--dist-dir", str(dist)]), 0)
            self.assertEqual(helper_main(["verify", "--dist-dir", str(dist)]), 0)

    def test_cli_verify_wheel_failure(self):
        with tempfile.TemporaryDirectory(prefix="wheel-distbad-") as d:
            dist = Path(d) / "dist"
            dist.mkdir()
            make_wheel(dist / "pkg-1.0-py3-none-any.whl", with_index=False)
            self.assertEqual(helper_main(["verify-wheel", "--dist-dir", str(dist)]), 1)

    def test_find_wheels_missing_dir(self):
        self.assertEqual(find_wheels(Path("/nonexistent-fork-ui-bundle-dist")), [])


class OutputPathTests(unittest.TestCase):
    def test_within_output(self):
        self.assertTrue(
            is_within_output(OUTPUT_DIR_POSIX, "docling_serve/ui_static/index.html")
        )
        self.assertTrue(
            is_within_output(OUTPUT_DIR_POSIX, "docling_serve/ui_static/assets/app.js")
        )
        self.assertTrue(is_within_output(OUTPUT_DIR_POSIX, "docling_serve/ui_static"))

    def test_outside_output(self):
        self.assertFalse(is_within_output(OUTPUT_DIR_POSIX, "pyproject.toml"))
        self.assertFalse(
            is_within_output(OUTPUT_DIR_POSIX, "scripts/fork_ui_bundle.py")
        )
        self.assertFalse(
            is_within_output(OUTPUT_DIR_POSIX, ".github/workflows/fork-ui-bundle.yml")
        )
        self.assertFalse(is_within_output(OUTPUT_DIR_POSIX, "docling_serve/app.py"))
        self.assertFalse(
            is_within_output(OUTPUT_DIR_POSIX, "/docling_serve/ui_static/index.html")
        )
        self.assertFalse(is_within_output(OUTPUT_DIR_POSIX, "../outside.txt"))
        self.assertFalse(
            is_within_output(OUTPUT_DIR_POSIX, "docling_serve/ui_static/../app.py")
        )

    def test_noop_has_no_staged_changes(self):
        repo = init_repo()
        self.addCleanup(_REPO_GUARDS.pop().cleanup)
        self.assertFalse(has_staged_changes(repo))
        self.assertEqual(staged_files(repo), [])
        self.assertEqual(assert_staged_only_output(repo), [])
        self.assertEqual(helper_main(["check-staged", "--repo", str(repo)]), 0)

    def test_staged_output_only_passes(self):
        repo = init_repo()
        self.addCleanup(_REPO_GUARDS.pop().cleanup)
        out = repo / OUTPUT_DIR_POSIX
        out.mkdir(parents=True, exist_ok=True)
        (out / "index.html").write_text("<html></html>\n")
        self.assertEqual(
            git_run(repo, "add", "--force", "--", OUTPUT_DIR_POSIX).returncode, 0
        )
        self.assertTrue(has_staged_changes(repo))
        files = assert_staged_only_output(repo)
        self.assertTrue(files)
        self.assertTrue(all(f.startswith(OUTPUT_DIR_POSIX + "/") for f in files))
        self.assertEqual(helper_main(["check-staged", "--repo", str(repo)]), 0)

    def test_staged_outside_output_rejected(self):
        repo = init_repo()
        self.addCleanup(_REPO_GUARDS.pop().cleanup)
        out = repo / OUTPUT_DIR_POSIX
        out.mkdir(parents=True, exist_ok=True)
        (out / "index.html").write_text("<html></html>\n")
        (repo / "pyproject.toml").write_text("[project]\n")
        self.assertEqual(
            git_run(repo, "add", "--force", "--", OUTPUT_DIR_POSIX).returncode, 0
        )
        self.assertEqual(git_run(repo, "add", "--", "pyproject.toml").returncode, 0)
        with self.assertRaises(StagedCheckError):
            assert_staged_only_output(repo)
        self.assertEqual(helper_main(["check-staged", "--repo", str(repo)]), 1)


class WorkflowGuardTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.text = WORKFLOW.read_text()

    def test_workflow_exists(self):
        self.assertTrue(WORKFLOW.is_file())

    def test_fork_main_hardguard(self):
        self.assertIn("cloudiful/docling-serve", self.text)
        self.assertIn("refs/heads/main", self.text)
        self.assertIn("github.repository", self.text)
        self.assertIn("github.ref", self.text)

    def test_trusted_triggers_only(self):
        self.assertIn("branches: [main]", self.text)
        self.assertIn("workflow_dispatch", self.text)
        self.assertIsNone(re.search(r"(?m)^\s*pull_request(_target)?:\s*$", self.text))

    def test_no_self_loop_paths(self):
        for needle in (
            "ui/**",
            "pyproject.toml",
            "fork-ui-bundle.yml",
            "scripts/fork_ui_bundle.py",
        ):
            self.assertIn(needle, self.text)
        # Positive paths allowlist only: generated output is not listed, so bot
        # commits touching only ui_static never retrigger the workflow.
        trigger = self.text.split("workflow_dispatch")[0]
        self.assertNotIn("docling_serve/ui_static", trigger)

    def test_push_trigger_rejects_paths_ignore_combo(self):
        # Actions forbids combining paths with paths-ignore on the same push
        # event; the positive allowlist above is already sufficient.
        self.assertNotIn("paths-ignore", self.text)

    def test_build_verify_before_write_order(self):
        for needle in (
            "npm --prefix ui ci",
            "npm --prefix ui run build",
            "uv build --wheel",
            "verify-wheel",
        ):
            self.assertIn(needle, self.text)
        self.assertLess(
            self.text.index("verify-wheel"), self.text.index("git add --force")
        )
        self.assertNotIn("uv sync", self.text)

    def test_noop_and_generated_only_commit(self):
        self.assertIn("git diff --cached --quiet", self.text)
        self.assertIn("git add --force -- docling_serve/ui_static", self.text)
        self.assertIn("check-staged", self.text)
        self.assertIn('user.name "github-actions[bot]"', self.text)
        self.assertNotIn("git add -A", self.text)
        self.assertIsNone(re.search(r"(?m)^\s*git add \.\s*$", self.text))

    def test_concurrency_and_race_guard(self):
        self.assertIn("fork-ui-bundle-main", self.text)
        self.assertIn("cancel-in-progress: false", self.text)
        self.assertIn("TRIGGER_SHA", self.text)
        self.assertIn("git fetch origin main", self.text)
        self.assertIn("git rev-parse origin/main", self.text)
        self.assertIn("HEAD:refs/heads/main", self.text)

    def test_nonforce_fork_only_push(self):
        self.assertIn("git push origin HEAD:refs/heads/main", self.text)
        self.assertIsNone(re.search(r"git push[^\n]*--force", self.text))
        self.assertIsNone(re.search(r"git push[^\n]* -f(\s|$)", self.text))
        self.assertNotIn("--mirror", self.text)

    def test_token_branch_policy_guidance(self):
        self.assertIn("Read and write permissions", self.text)
        self.assertIn("branch protection", self.text)

    def test_permissions_and_secrets(self):
        self.assertIn("contents: read", self.text)
        self.assertEqual(self.text.count("contents: write"), 1)
        self.assertNotIn("secrets.", self.text)

    def test_no_shell_interpolation(self):
        lines = self.text.splitlines()
        in_run = False
        run_indent = 0
        for line in lines:
            if not in_run:
                m = re.match(r"^(\s*)run:\s*(\|.*)?$", line)
                if m:
                    if "${{" in line:
                        self.fail(f"github expression inside run: {line}")
                    in_run = True
                    run_indent = len(m.group(1))
                continue
            # Inside a run: block; blank lines and deeper-indented lines belong to it.
            if line.strip() == "" or len(line) - len(line.lstrip(" ")) > run_indent:
                if "${{" in line:
                    self.fail(f"github expression inside run block: {line}")
                continue
            in_run = False
            m = re.match(r"^(\s*)run:\s*(\|.*)?$", line)
            if m:
                if "${{" in line:
                    self.fail(f"github expression inside run: {line}")
                in_run = True
                run_indent = len(m.group(1))

    def test_action_pins(self):
        for needle in (
            "actions/checkout@v5",
            "actions/setup-node@v4",
            "astral-sh/setup-uv@v6",
            'version: "0.12.13"',
            "node-version: 24",
            'python-version: "3.12"',
            "persist-credentials: true",
        ):
            self.assertIn(needle, self.text)

    def test_no_destructive_git_outside_output(self):
        self.assertNotIn("git rm ", self.text)
        self.assertNotIn("git reset --hard", self.text)
        self.assertNotIn("git clean", self.text)

    def test_docs_cover_operations(self):
        self.assertTrue(DOCS.is_file())
        docs = DOCS.read_text()
        for needle in (
            "cloudiful/docling-serve",
            "Read and write permissions",
            "cherry-pick",
            "workflow_dispatch",
            "ca16d6a",
        ):
            self.assertIn(needle, docs)


if __name__ == "__main__":
    unittest.main()
