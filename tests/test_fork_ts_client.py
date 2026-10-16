"""Tests for the fork TypeScript client helper (no network access).

The helper is exercised through its command orchestration with a fake runner:
these tests cover the build/install sequence, the fresh-clone refresh
behaviour, fail-fast error mapping and disposable-artifact cleanup.
"""

import sys
from collections.abc import Sequence
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parent.parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from scripts import fork_ts_client as helper  # noqa: E402

TARBALL_NAME = "docling-docling-client-2.139.0.tgz"
UI_PACKAGE_JSON = '{"name": "docling-serve-ui"}\n'


def make_root(tmp_path: Path) -> Path:
    root = tmp_path / "serve"
    (root / "ui").mkdir(parents=True)
    (root / "ui" / "package.json").write_text(UI_PACKAGE_JSON)
    return root


class FakeRunner:
    """Records commands and fabricates the npm pack output."""

    def __init__(self, *, fail_on: Sequence[str] | None = None) -> None:
        self.commands: list[list[str]] = []
        self.cwds: list[Path] = []
        self.envs: list[dict[str, str]] = []
        self.fail_on = list(fail_on) if fail_on is not None else None

    def __call__(self, command, cwd, env) -> None:  # type: ignore[no-untyped-def]
        recorded = list(command)
        self.commands.append(recorded)
        self.cwds.append(Path(cwd))
        self.envs.append(dict(env))
        if self.fail_on is not None and recorded[: len(self.fail_on)] == self.fail_on:
            raise helper.ForkTsClientError(
                f"command failed with exit code 1: {' '.join(recorded)}"
            )
        if recorded[:2] == ["npm", "pack"]:
            dist = Path(recorded[recorded.index("--pack-destination") + 1])
            (dist / TARBALL_NAME).write_text("fake tarball\n")

    def step_index(self, *prefix: str) -> int:
        for index, command in enumerate(self.commands):
            if command[: len(prefix)] == list(prefix):
                return index
        raise AssertionError(f"command not run: {' '.join(prefix)}")


def test_builds_fork_client_from_main_and_installs_without_saving(
    tmp_path, monkeypatch
):
    root = make_root(tmp_path)
    cache = tmp_path / "cache"
    runner = FakeRunner()
    monkeypatch.setattr(helper, "_run", runner)

    tarball = helper.sync_fork_ts_client(root, cache)

    clone_dir = cache / "clone"
    client_dir = clone_dir / helper.CLIENT_SUBDIR
    assert runner.commands[0] == [
        "git",
        "clone",
        "--depth",
        "1",
        "--branch",
        helper.FORK_BRANCH,
        helper.FORK_URL,
        str(clone_dir),
    ]

    ci_index = runner.step_index("npm", "ci")
    assert runner.cwds[ci_index] == client_dir
    assert runner.envs[ci_index]["TMPDIR"] == str(cache / "tmp")
    assert runner.envs[ci_index]["TMP"] == str(cache / "tmp")
    assert runner.cwds[runner.step_index("npm", "run", "build")] == client_dir

    pack_index = runner.step_index("npm", "pack")
    assert runner.cwds[pack_index] == client_dir
    pack_command = runner.commands[pack_index]
    assert pack_command[pack_command.index("--pack-destination") + 1] == str(
        cache / "dist"
    )

    install_index = runner.step_index("npm", "--prefix")
    assert runner.cwds[install_index] == root
    assert runner.commands[install_index][1:6] == [
        "--prefix",
        str(root / "ui"),
        "install",
        "--no-save",
        "--package-lock=false",
    ]
    assert runner.commands[install_index][-1] == str(tarball)

    assert tarball == cache / "dist" / TARBALL_NAME
    assert tarball.is_file()
    assert not clone_dir.exists()
    assert (root / "ui" / "package.json").read_text() == UI_PACKAGE_JSON


def test_repeat_runs_clone_fresh_and_drop_previous_output(tmp_path, monkeypatch):
    root = make_root(tmp_path)
    cache = tmp_path / "cache"
    clone_dir = cache / "clone"
    clone_destinations_existed: list[bool] = []
    clone_commands: list[list[str]] = []

    def runner(command, cwd, env):  # type: ignore[no-untyped-def]
        command = list(command)
        if command[:2] == ["git", "clone"]:
            clone_commands.append(command)
            clone_destinations_existed.append(Path(command[-1]).exists())
        elif command[:2] == ["npm", "pack"]:
            dist = Path(command[command.index("--pack-destination") + 1])
            (dist / TARBALL_NAME).write_text("fake tarball\n")

    monkeypatch.setattr(helper, "_run", runner)

    stale_dist = cache / "dist"
    stale_dist.mkdir(parents=True)
    (stale_dist / "docling-docling-client-1.0.0.tgz").write_text("stale\n")

    first = helper.sync_fork_ts_client(root, cache)
    second = helper.sync_fork_ts_client(root, cache)

    # Each run clones into an absent directory, so no stale checkout survives.
    assert clone_destinations_existed == [False, False]
    assert (
        clone_commands
        == [
            [
                "git",
                "clone",
                "--depth",
                "1",
                "--branch",
                helper.FORK_BRANCH,
                helper.FORK_URL,
                str(clone_dir),
            ]
        ]
        * 2
    )
    assert first == second == cache / "dist" / TARBALL_NAME
    assert not (cache / "dist" / "docling-docling-client-1.0.0.tgz").exists()
    assert not clone_dir.exists()


def test_failure_fails_fast_and_removes_disposable_artifacts(tmp_path, monkeypatch):
    root = make_root(tmp_path)
    cache = tmp_path / "cache"
    runner = FakeRunner(fail_on=("npm", "run", "build"))
    monkeypatch.setattr(helper, "_run", runner)

    with pytest.raises(helper.ForkTsClientError):
        helper.sync_fork_ts_client(root, cache)

    assert runner.step_index("npm", "run", "build") == len(runner.commands) - 1
    assert not any(command[:2] == ["npm", "--prefix"] for command in runner.commands)
    assert not (cache / "clone").exists()
    assert not (cache / "dist").exists()


def test_missing_packed_tarball_is_an_error(tmp_path, monkeypatch):
    root = make_root(tmp_path)
    cache = tmp_path / "cache"

    def runner(command, cwd, env):  # type: ignore[no-untyped-def]
        if list(command)[:2] == ["npm", "pack"]:
            pass  # a pack that produced no tarball

    monkeypatch.setattr(helper, "_run", runner)

    with pytest.raises(
        helper.ForkTsClientError, match="expected one packed client tarball"
    ):
        helper.sync_fork_ts_client(root, cache)
    assert not (cache / "clone").exists()
    assert not (cache / "dist").exists()


def test_missing_ui_package_is_rejected(tmp_path):
    with pytest.raises(helper.ForkTsClientError, match="UI package not found"):
        helper.sync_fork_ts_client(tmp_path, tmp_path / "cache")


def test_run_maps_missing_executable_and_nonzero_exit():
    with pytest.raises(helper.ForkTsClientError, match="required executable not found"):
        helper._run(["definitely-not-a-real-binary-xyz"], Path.cwd(), {})

    with pytest.raises(helper.ForkTsClientError, match="exit code 3"):
        helper._run([sys.executable, "-c", "raise SystemExit(3)"], Path.cwd(), {})


def test_main_reports_success_and_failure(tmp_path, monkeypatch, capsys):
    root = make_root(tmp_path)
    cache = tmp_path / "cache"
    runner = FakeRunner()
    monkeypatch.setattr(helper, "_run", runner)
    monkeypatch.setattr(helper, "repo_root", lambda: root)

    assert helper.main(["--cache-dir", str(cache)]) == 0
    assert TARBALL_NAME in capsys.readouterr().out

    def failing(command, cwd, env):  # type: ignore[no-untyped-def]
        raise helper.ForkTsClientError("boom")

    monkeypatch.setattr(helper, "_run", failing)
    assert helper.main(["--cache-dir", str(cache)]) == 1
    assert "error: boom" in capsys.readouterr().err
