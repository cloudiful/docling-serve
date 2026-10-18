import {
  DoclingTaskCancelledError,
  type PublicFailureInfo,
  type TaskStatusResponse,
} from "@docling/docling-client";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ConvertView } from "@/components/ConvertView";

const mocks = vi.hoisted(() => ({ createClient: vi.fn() }));

vi.mock("@/lib/api", () => ({ createClient: mocks.createClient }));

function status(
  taskStatus: TaskStatusResponse["task_status"],
  failure?: PublicFailureInfo,
): TaskStatusResponse {
  return {
    task_id: "task-1",
    task_type: "convert",
    task_status: taskStatus,
    ...(failure ? { failure } : {}),
  };
}

function fakeClient(
  watch: () => AsyncGenerator<TaskStatusResponse>,
  getRawResult?: () => Promise<unknown>,
) {
  const result = vi.fn(getRawResult ?? (() => Promise.resolve({})));
  const client = {
    submitSource: vi.fn(async () => ({
      taskId: "task-1",
      status: status("pending"),
      watch,
    })),
    getResult: result,
    getRawResult: result,
    getBinaryResult: result,
  };
  mocks.createClient.mockReturnValue(client);
  return client;
}

async function submitUrl() {
  const user = userEvent.setup();
  render(<ConvertView capabilities={null} fields={[]} />);
  await user.click(screen.getByRole("tab", { name: /URL/ }));
  await user.type(
    screen.getByPlaceholderText("https://arxiv.org/pdf/2408.09869"),
    "https://example.test/report.pdf",
  );
  await user.click(screen.getByRole("button", { name: /Convert/ }));
}

function expectConvertButtonEnabled() {
  expect(screen.getByRole("button", { name: /Convert/ }).hasAttribute("disabled")).toBe(false);
}

beforeEach(() => {
  mocks.createClient.mockReset();
});

afterEach(() => {
  cleanup();
});

describe("ConvertView cancellation", () => {
  it("shows the terminal cancelled watch status without fetching a result", async () => {
    async function* watch() {
      yield status("started");
      yield status("cancelled");
    }
    const client = fakeClient(watch);

    await submitUrl();

    expect(await screen.findByText("Task cancelled")).toBeTruthy();
    expect(screen.queryByText("Conversion failed")).toBeNull();
    expect(screen.queryByText(/conversion was cancelled/i)).toBeNull();
    expect(client.getResult).not.toHaveBeenCalled();
    expect(client.getRawResult).not.toHaveBeenCalled();
    expect(client.getBinaryResult).not.toHaveBeenCalled();
    expectConvertButtonEnabled();
    expect(screen.queryByRole("button", { name: /Stop waiting/ })).toBeNull();
  });

  it("renders the dedicated cancellation error without a failure alert", async () => {
    async function* watch() {
      yield status("started");
    }
    const client = fakeClient(watch, () =>
      Promise.reject(new DoclingTaskCancelledError("task-1")),
    );

    await submitUrl();

    expect(await screen.findByText("Task cancelled")).toBeTruthy();
    expect(screen.queryByText("Conversion failed")).toBeNull();
    await waitFor(() => expect(client.getRawResult).toHaveBeenCalledTimes(1));
    expectConvertButtonEnabled();
  });

  it("keeps unrelated conversion failures distinct from cancellation", async () => {
    async function* watch() {
      yield status("started");
      yield status("failure", {
        category: "internal",
        message: "conversion broke",
        retryable: false,
        phase: "execution",
        details: {},
      });
    }
    fakeClient(watch);

    await submitUrl();

    expect(await screen.findByText("Conversion failed")).toBeTruthy();
    expect(screen.getByText("conversion broke")).toBeTruthy();
    expect(screen.queryByText("Task cancelled")).toBeNull();
  });
});
