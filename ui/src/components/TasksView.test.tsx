import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { TasksView } from "@/components/TasksView";
import { TASK_PAGE_SIZE } from "@/lib/tasks";

type Handler = (url: string, init?: RequestInit) => Response | Promise<Response>;

let handler: Handler | null = null;
let fetchCalls: string[] = [];
let restoreFetch: (() => void) | null = null;

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

function task(id: string, status = "pending", type = "convert") {
  return { task_id: id, task_type: type, task_status: status, created_at: "2024-01-02T03:04:05Z" };
}

function listOffset(url: string): number {
  const match = /offset=(\d+)/.exec(url);
  return match ? Number(match[1]) : -1;
}

function listCalls(): string[] {
  return fetchCalls.filter((url) => url.includes("/v1/tasks?"));
}

function detailCalls(): string[] {
  return fetchCalls.filter((url) => url.includes("/v1/status/poll/"));
}

beforeEach(() => {
  fetchCalls = [];
  handler = null;
  const original = globalThis.fetch;
  globalThis.fetch = ((input: string | URL | Request, init?: RequestInit) => {
    const url = String(typeof input === "string" ? input : input instanceof URL ? input.href : input.url);
    fetchCalls.push(url);
    if (!handler) throw new Error(`unexpected fetch: ${url}`);
    return Promise.resolve(handler(url, init));
  }) as typeof globalThis.fetch;
  restoreFetch = () => {
    globalThis.fetch = original;
  };
});

afterEach(() => {
  cleanup();
  restoreFetch?.();
  restoreFetch = null;
  handler = null;
  vi.useRealTimers();
  Reflect.deleteProperty(document, "visibilityState");
});

function setVisibility(state: "visible" | "hidden") {
  Object.defineProperty(document, "visibilityState", { configurable: true, get: () => state });
  document.dispatchEvent(new Event("visibilitychange"));
}

function renderTasks(authGeneration = 0) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <TasksView authGeneration={authGeneration} />
    </QueryClientProvider>,
  );
}

describe("TasksView list", () => {
  it("renders only the identity columns with pending and started badges", async () => {
    handler = () =>
      json({ items: [task("task-abc"), task("task-def", "started", "chunk")], has_more: false });
    renderTasks();

    expect(await screen.findByText("task-abc")).toBeTruthy();
    expect(screen.getByText("Pending")).toBeTruthy();
    expect(screen.getByText("Started")).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Active tasks" })).toBeTruthy();
    expect(screen.getByText(/Finished tasks are not listed/)).toBeTruthy();

    const table = screen.getByRole("table", { name: "Active tasks" });
    const headers = within(table).getAllByRole("columnheader").map((cell) => cell.textContent);
    expect(headers).toEqual(["Task ID", "Type", "Status", "Created"]);
    expect(screen.queryByText(/Elapsed/i)).toBeNull();
    expect(screen.queryByText(/Progress/i)).toBeNull();
    expect(screen.queryByText(/Phase/i)).toBeNull();
    // Range is offset-based; no invented total ("1-2 of N").
    expect(screen.getByText((text) => text.startsWith("Showing 1"))).toBeTruthy();
    expect(screen.queryByText(/of \d+/)).toBeNull();
  });

  it("shows a real empty state on the first page only", async () => {
    handler = () => json({ items: [], has_more: false });
    renderTasks();

    expect(await screen.findByText("No active tasks")).toBeTruthy();
    expect(screen.queryByText((text) => text.startsWith("Showing"))).toBeNull();
    // Nothing to page through on an empty queue.
    expect(screen.queryByRole("button", { name: "Next" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Previous" })).toBeNull();
    expect(screen.queryByRole("table")).toBeNull();
  });
});

describe("TasksView pagination", () => {
  it("pages forward only while has_more and back only past the first page", async () => {
    handler = (url) =>
      listOffset(url) === 0
        ? json({ items: [task("task-1")], has_more: true })
        : json({ items: [task("task-2")], has_more: false });
    renderTasks();

    await screen.findByText("task-1");
    expect(screen.getByRole("button", { name: "Previous" }).hasAttribute("disabled")).toBe(true);
    expect(screen.getByRole("button", { name: "Next" }).hasAttribute("disabled")).toBe(false);

    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(await screen.findByText("task-2")).toBeTruthy();
    await waitFor(() => expect(listCalls().some((url) => listOffset(url) === TASK_PAGE_SIZE)).toBe(true));
    expect(screen.getByRole("button", { name: "Next" }).hasAttribute("disabled")).toBe(true);
    expect(screen.getByRole("button", { name: "Previous" }).hasAttribute("disabled")).toBe(false);

    fireEvent.click(screen.getByRole("button", { name: "Previous" }));
    expect(await screen.findByText("task-1")).toBeTruthy();
  });

  it("resets to the first page when a later page becomes empty", async () => {
    handler = (url) =>
      listOffset(url) === 0
        ? json({ items: [task("task-1")], has_more: true })
        : json({ items: [], has_more: false });
    renderTasks();

    await screen.findByText("task-1");
    fireEvent.click(screen.getByRole("button", { name: "Next" }));

    // The empty page 2 is replaced by a reload of page 1 rather than a false
    // "No active tasks" screen.
    expect(await screen.findByText("task-1")).toBeTruthy();
    await waitFor(() =>
      expect(listCalls().filter((url) => listOffset(url) === 0).length).toBeGreaterThanOrEqual(2),
    );
    expect(screen.queryByText("No active tasks")).toBeNull();
  });

  it("clears the selected task when paging", async () => {
    handler = (url) => {
      if (url.includes("/v1/status/poll/")) return json({ task_id: "task-1", task_type: "convert", task_status: "started" });
      return listOffset(url) === 0
        ? json({ items: [task("task-1")], has_more: true })
        : json({ items: [task("task-2")], has_more: false });
    };
    renderTasks();

    fireEvent.click(await screen.findByText("task-1"));
    expect(await screen.findByText("Task details")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    await screen.findByText("task-2");
    expect(screen.queryByText("Task details")).toBeNull();
    expect(detailCalls()).toHaveLength(1);
  });
});

describe("TasksView errors", () => {
  it.each([
    [401, "An API key is required to list active tasks."],
    [403, "This API key is not permitted to list active tasks."],
    [404, "Active task listing is not available on this server."],
    [500, "Unable to load active tasks. The server returned an error."],
  ])("maps HTTP %i to fixed text", async (status, message) => {
    handler = () => json({ detail: "raw backend text" }, status);
    renderTasks();

    expect(await screen.findByText(message)).toBeTruthy();
    expect(screen.queryByText(/raw backend text/)).toBeNull();
  });

  it("maps a network failure to fixed text", async () => {
    handler = () => {
      throw new Error("connection reset by peer");
    };
    renderTasks();

    expect(await screen.findByText("Unable to load active tasks. Check the connection and try again.")).toBeTruthy();
    expect(screen.queryByText(/connection reset/)).toBeNull();
  });
});

describe("TasksView detail", () => {
  it("fetches only the selected id and renders only allowlisted fields", async () => {
    handler = (url) => {
      if (url.includes("/v1/status/poll/")) {
        return json({
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
          error_message: "raw backend secret",
          failure: { category: "internal", message: "stack trace", retryable: false, phase: "execution", details: { url: "http://secret" } },
        });
      }
      return json({ items: [task("task-1"), task("task-2")], has_more: false });
    };
    renderTasks();

    fireEvent.click(await screen.findByTitle("task-1"));
    expect(await screen.findByText("Task details")).toBeTruthy();

    await waitFor(() => expect(detailCalls()).toHaveLength(1));
    expect(detailCalls()[0]).toContain(encodeURIComponent("task-1"));
    expect(detailCalls()[0]).toContain("wait=0");
    expect(screen.getByText("Queue position")).toBeTruthy();
    expect(screen.getByText("Documents")).toBeTruthy();
    expect(screen.getByText("Partially succeeded")).toBeTruthy();
    expect(screen.queryByText(/raw backend secret/)).toBeNull();
    expect(screen.queryByText(/stack trace/)).toBeNull();
    expect(screen.queryByText(/http:\/\/secret/)).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Close task details" }));
    expect(screen.queryByText("Task details")).toBeNull();
  });

  it("shows a task-specific message when the selected task disappeared", async () => {
    handler = (url) => {
      if (url.includes("/v1/status/poll/")) return json({ detail: "gone" }, 404);
      return json({ items: [task("task-1")], has_more: false });
    };
    renderTasks();

    fireEvent.click(await screen.findByTitle("task-1"));
    expect(await screen.findByText("This task is no longer available.")).toBeTruthy();
    // The list itself is unaffected.
    expect(screen.getByText("task-1")).toBeTruthy();
  });

  it("ignores a late response for a page the user has left", async () => {
    let resolveSlow: ((response: Response) => void) | null = null;
    handler = (url) => {
      if (listOffset(url) === 0) return json({ items: [task("task-1")], has_more: true });
      return new Promise<Response>((resolve) => {
        resolveSlow = resolve;
      });
    };
    renderTasks();

    await screen.findByText("task-1");
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    await waitFor(() => expect(resolveSlow).not.toBeNull());

    fireEvent.click(screen.getByRole("button", { name: "Previous" }));
    await screen.findByText("task-1");

    await act(async () => {
      resolveSlow?.(json({ items: [task("task-late")], has_more: false }));
      await Promise.resolve();
    });

    expect(screen.queryByText("task-late")).toBeNull();
    expect(screen.getByText("task-1")).toBeTruthy();
  });
});

describe("TasksView auto-refresh", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(document, "hasFocus").mockReturnValue(true);
  });

  it("stops polling when the window is not focused and resumes when it is", async () => {
    handler = () => json({ items: [], has_more: false });
    renderTasks();
    const flush = () => act(async () => void (await vi.advanceTimersByTimeAsync(0)));
    const advance = (ms: number) => act(async () => void (await vi.advanceTimersByTimeAsync(ms)));

    await flush();
    expect(listCalls()).toHaveLength(1);

    const focus = vi.spyOn(document, "hasFocus").mockReturnValue(false);
    await act(async () => {
      window.dispatchEvent(new Event("blur"));
    });
    await advance(15_000);
    expect(listCalls()).toHaveLength(1);

    focus.mockReturnValue(true);
    await act(async () => {
      window.dispatchEvent(new Event("focus"));
    });
    await advance(5000);
    expect(listCalls()).toHaveLength(2);
  });

  it("stops polling while the document is hidden", async () => {
    handler = () => json({ items: [], has_more: false });
    renderTasks();
    const advance = (ms: number) => act(async () => void (await vi.advanceTimersByTimeAsync(ms)));
    await act(async () => void (await vi.advanceTimersByTimeAsync(0)));
    expect(listCalls()).toHaveLength(1);

    await act(async () => {
      setVisibility("hidden");
    });
    await advance(15_000);
    expect(listCalls()).toHaveLength(1);

    await act(async () => {
      setVisibility("visible");
    });
    await advance(5000);
    expect(listCalls()).toHaveLength(2);
  });

  it("backs off exponentially on repeated failures and caps at 60s", async () => {
    handler = () => json({}, 500);
    renderTasks();
    const advance = (ms: number) => act(async () => void (await vi.advanceTimersByTimeAsync(ms)));

    await advance(0);
    expect(listCalls()).toHaveLength(1);

    await advance(5000);
    expect(listCalls()).toHaveLength(2);

    await advance(9999);
    expect(listCalls()).toHaveLength(2);
    await advance(1);
    expect(listCalls()).toHaveLength(3);

    await advance(19999);
    expect(listCalls()).toHaveLength(3);
    await advance(1);
    expect(listCalls()).toHaveLength(4);
  });

  it("does not poll after the switch is turned off", async () => {
    handler = () => json({ items: [], has_more: false });
    renderTasks();
    const advance = (ms: number) => act(async () => void (await vi.advanceTimersByTimeAsync(ms)));
    await advance(0);
    expect(listCalls()).toHaveLength(1);

    fireEvent.click(screen.getByRole("switch", { name: "Auto-refresh active tasks" }));
    await advance(20_000);
    expect(listCalls()).toHaveLength(1);
  });

  it("keeps at most one list request in flight per cycle", async () => {
    let inFlight = 0;
    let maxInFlight = 0;
    handler = () =>
      new Promise<Response>((resolve) => {
        inFlight += 1;
        maxInFlight = Math.max(maxInFlight, inFlight);
        setTimeout(() => {
          inFlight -= 1;
          resolve(json({ items: [], has_more: false }));
        }, 1000);
      });
    renderTasks();
    const advance = (ms: number) => act(async () => void (await vi.advanceTimersByTimeAsync(ms)));

    await advance(20_000);
    expect(maxInFlight).toBe(1);
  });
});
