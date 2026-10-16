import { afterEach, describe, expect, it } from "vitest";

import { HttpError, apiBaseUrl, setApiKey } from "@/lib/api";
import type { WatchedTaskStatus } from "@/lib/taskPoll";
import {
  AUTO_REFRESH_MS,
  activeTasksErrorMessage,
  detailStatusSummary,
  errorBackoffMs,
  fetchActiveTasks,
  fetchTaskDetail,
  formatCreatedAt,
  projectTaskDetail,
  TASK_PAGE_SIZE,
  taskDetailErrorMessage,
} from "@/lib/tasks";

interface Recorded {
  url: string;
  init?: RequestInit;
  apiKey: string | null;
}

function mockFetch(payloads: unknown[], status = 200) {
  const calls: Recorded[] = [];
  const original = globalThis.fetch;
  let i = 0;
  globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
    const url = String(typeof input === "string" ? input : input instanceof URL ? input.href : input.url);
    const headers = new Headers(init?.headers as HeadersInit | undefined);
    calls.push({ url, init, apiKey: headers.get("X-Api-Key") });
    const payload = payloads[Math.min(i, payloads.length - 1)];
    i += 1;
    return new Response(JSON.stringify(payload), {
      status,
      headers: { "Content-Type": "application/json" },
    });
  }) as typeof globalThis.fetch;
  return { calls, restore: () => { globalThis.fetch = original; } };
}

let restore: (() => void) | null = null;
afterEach(() => {
  restore?.();
  restore = null;
  sessionStorage.clear();
});

describe("fetchActiveTasks", () => {
  it("requests the fixed page size and offset with the session API key", async () => {
    setApiKey("secret-key");
    const h = mockFetch([{ items: [], has_more: false }]);
    restore = h.restore;
    const controller = new AbortController();

    const page = await fetchActiveTasks(40, controller.signal);

    expect(page).toEqual({ items: [], has_more: false });
    expect(h.calls).toHaveLength(1);
    expect(h.calls[0].url).toBe(`${apiBaseUrl()}/v1/tasks?limit=${TASK_PAGE_SIZE}&offset=40`);
    expect(h.calls[0].apiKey).toBe("secret-key");
    expect(h.calls[0].init?.signal).toBe(controller.signal);
  });

  it("omits the API key header when no key is set and clamps a negative offset", async () => {
    const h = mockFetch([{ items: [], has_more: false }]);
    restore = h.restore;

    await fetchActiveTasks(-5);

    expect(h.calls[0].url).toBe(`${apiBaseUrl()}/v1/tasks?limit=${TASK_PAGE_SIZE}&offset=0`);
    expect(h.calls[0].apiKey).toBeNull();
  });

  it("keeps the reverse-proxy root path in the request URL", async () => {
    const h = mockFetch([{ items: [], has_more: false }]);
    restore = h.restore;
    window.history.pushState({}, "", "/root/ui/");
    try {
      expect(apiBaseUrl()).toBe(`${window.location.origin}/root`);
      await fetchActiveTasks(0);
      expect(h.calls[0].url).toBe(`${window.location.origin}/root/v1/tasks?limit=${TASK_PAGE_SIZE}&offset=0`);
    } finally {
      window.history.pushState({}, "", "/");
    }
  });

  it("surfaces the HTTP status through HttpError without backend text", async () => {
    const h = mockFetch([{}], 404);
    restore = h.restore;
    await expect(fetchActiveTasks(0)).rejects.toBeInstanceOf(HttpError);
  });
});

describe("fetchTaskDetail", () => {
  it("encodes the task id and asks for an immediate status", async () => {
    const h = mockFetch([{ task_id: "a/b +c", task_status: "started" }]);
    restore = h.restore;

    const detail = await fetchTaskDetail("a/b +c");

    expect(detail.task_status).toBe("started");
    expect(h.calls[0].url).toBe(`${apiBaseUrl()}/v1/status/poll/${encodeURIComponent("a/b +c")}?wait=0`);
  });
});

describe("projectTaskDetail", () => {
  const raw = {
    task_id: "task-1",
    task_type: "convert",
    task_status: "started",
    task_position: 3,
    task_meta: {
      num_docs: 4,
      num_processed: 2,
      num_succeeded: 1,
      num_partially_succeeded: 0,
      num_failed: 1,
    },
    error_message: "backend secret leaked value",
    failure: { category: "internal", message: "stack trace", retryable: false, phase: "execution", details: { url: "http://secret" } },
    options: { to_formats: ["md"] },
    source_filename: "/home/user/private.pdf",
  } as unknown as WatchedTaskStatus;

  it("projects only the allowlisted identity and numeric fields", () => {
    const detail = projectTaskDetail(raw);
    expect(detail).toEqual({
      taskId: "task-1",
      taskType: "convert",
      taskStatus: "started",
      taskPosition: 3,
      meta: {
        num_docs: 4,
        num_processed: 2,
        num_succeeded: 1,
        num_partially_succeeded: 0,
        num_failed: 1,
      },
    });
    const serialized = JSON.stringify(detail);
    expect(serialized).not.toContain("backend secret leaked value");
    expect(serialized).not.toContain("stack trace");
    expect(serialized).not.toContain("private.pdf");
    expect(serialized).not.toContain("http://secret");
  });

  it("maps absent position and meta to null", () => {
    const detail = projectTaskDetail({ task_id: "t", task_type: "chunk", task_status: "pending" } as WatchedTaskStatus);
    expect(detail.taskPosition).toBeNull();
    expect(detail.meta).toBeNull();
  });
});

describe("error messages", () => {
  it("maps list statuses to fixed text", () => {
    expect(activeTasksErrorMessage(new HttpError(401, "x"))).toContain("API key is required");
    expect(activeTasksErrorMessage(new HttpError(403, "x"))).toContain("not permitted");
    expect(activeTasksErrorMessage(new HttpError(404, "x"))).toBe(
      "Active task listing is not available on this server.",
    );
    expect(activeTasksErrorMessage(new HttpError(500, "x"))).toContain("Unable to load active tasks");
    expect(activeTasksErrorMessage(new Error("boom"))).toContain("Unable to load active tasks");
    expect(activeTasksErrorMessage(new Error("boom"))).not.toContain("boom");
  });

  it("maps detail 404 to a task-specific, not server-wide, message", () => {
    expect(taskDetailErrorMessage(new HttpError(404, "x"))).toBe("This task is no longer available.");
    expect(taskDetailErrorMessage(new HttpError(401, "x"))).toContain("API key is required");
    expect(taskDetailErrorMessage(new HttpError(403, "x"))).toContain("not permitted");
    expect(taskDetailErrorMessage(new Error("network down"))).not.toContain("network down");
  });
});

describe("formatCreatedAt", () => {
  it("formats a timestamp and falls back safely on invalid input", () => {
    expect(formatCreatedAt("not-a-date")).toBe("Unknown time");
    const formatted = formatCreatedAt("2024-01-02T03:04:05Z");
    expect(formatted).not.toBe("Unknown time");
    expect(formatted.length).toBeGreaterThan(0);
  });
});

describe("refresh timing", () => {
  it("backs off on consecutive failures and caps at 60s", () => {
    expect(errorBackoffMs(1)).toBe(5000);
    expect(errorBackoffMs(2)).toBe(10000);
    expect(errorBackoffMs(3)).toBe(20000);
    expect(errorBackoffMs(4)).toBe(40000);
    expect(errorBackoffMs(5)).toBe(60000);
    expect(errorBackoffMs(50)).toBe(60000);
    expect(AUTO_REFRESH_MS).toBe(5000);
  });

  it("only summarizes terminal statuses with fixed text", () => {
    expect(detailStatusSummary("started")).toBeNull();
    expect(detailStatusSummary("pending")).toBeNull();
    expect(detailStatusSummary("failure")).toBe("The task failed.");
    expect(detailStatusSummary("success")).toContain("completed");
  });
});
