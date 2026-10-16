import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import App from "@/App";
import { TooltipProvider } from "@/components/ui/tooltip";

const hoisted = vi.hoisted(() => ({
  client: {
    submitSource: vi.fn(),
    getResult: vi.fn(),
    getRawResult: vi.fn(),
    getBinaryResult: vi.fn(),
  },
  poll: vi.fn(),
}));

vi.mock("@/lib/api", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/api")>();
  return { ...actual, createClient: () => hoisted.client } as unknown as typeof actual;
});

vi.mock("@/lib/taskPoll", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/taskPoll")>();
  return {
    ...actual,
    pollTaskStatus: (...args: unknown[]) => hoisted.poll(...args),
  } as unknown as typeof actual;
});

type Handler = (url: string, init?: RequestInit) => Response | Promise<Response>;

let handler: Handler = () => {
  throw new Error("no handler installed");
};
let fetchCalls: string[] = [];
let restoreFetch: (() => void) | null = null;

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

function baseCapabilities(apiKeyRequired = false) {
  return {
    versions: { "docling-serve": "1.2.3" },
    stages: {},
    sources: ["file", "http"],
    targets: { allowed: ["inbody"], default: "inbody" },
    output_formats: ["md"],
    image_export_modes: ["embedded"],
    limits: {
      max_document_timeout: 600,
      max_images_scale: 2,
      max_sources_per_request: 1,
      max_num_pages: null,
      max_file_size: null,
    },
    features: { api_key_required: apiKeyRequired, artifact_storage: false, websocket: false },
  };
}

function baseRouter(overrides: { apiKeyRequired?: boolean; tasks?: Handler } = {}): Handler {
  return (url, init) => {
    if (url.includes("/v1/capabilities")) return json(baseCapabilities(overrides.apiKeyRequired));
    if (url.includes("/openapi.json")) return json({ openapi: "3.0.0", paths: {} });
    if (url.endsWith("/ready")) return new Response("", { status: 200 });
    if (url.includes("/v1/tasks")) {
      return overrides.tasks ? overrides.tasks(url, init) : json({ items: [], has_more: false });
    }
    throw new Error(`unexpected fetch: ${url}`);
  };
}

function taskItem(id: string) {
  return { task_id: id, task_type: "convert", task_status: "pending", created_at: "2024-01-02T03:04:05Z" };
}

beforeEach(() => {
  sessionStorage.clear();
  fetchCalls = [];
  handler = baseRouter();
  const original = globalThis.fetch;
  globalThis.fetch = ((input: string | URL | Request, init?: RequestInit) => {
    const url = String(typeof input === "string" ? input : input instanceof URL ? input.href : input.url);
    fetchCalls.push(url);
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
  sessionStorage.clear();
});

function renderApp() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, refetchOnWindowFocus: false } } });
  return render(
    <QueryClientProvider client={client}>
      <TooltipProvider delayDuration={0}>
        <App />
      </TooltipProvider>
    </QueryClientProvider>,
  );
}

async function setSourceUrl(user: ReturnType<typeof userEvent.setup>, url: string) {
  await user.click(screen.getByRole("tab", { name: "URL" }));
  await user.type(screen.getByPlaceholderText("https://arxiv.org/pdf/2408.09869"), url);
}

describe("App tabs", () => {
  it("places Tasks between Convert and Server and keeps Convert mounted but hidden", async () => {
    const user = userEvent.setup();
    renderApp();

    await screen.findByRole("tab", { name: "Tasks" });
    const tablist = screen.getAllByRole("tablist")[0];
    expect(within(tablist).getAllByRole("tab").map((tab) => tab.textContent)).toEqual([
      "Convert",
      "Tasks",
      "Server",
    ]);
    // Tasks is not mounted until selected.
    expect(fetchCalls.some((url) => url.includes("/v1/tasks"))).toBe(false);

    const convertPanel = screen.getByRole("tabpanel", { name: "Convert" });
    expect(convertPanel.className).not.toContain("hidden");

    await user.click(screen.getByRole("tab", { name: "Server" }));
    expect(screen.getByText("Limits and features")).toBeTruthy();
    // The Convert panel stays mounted to preserve its state, but is hidden.
    expect(convertPanel.className).toContain("hidden");
    expect(convertPanel.isConnected).toBe(true);

    await user.click(screen.getByRole("tab", { name: "Convert" }));
    expect(convertPanel.className).not.toContain("hidden");
  });

  it("preserves the conversion form across tab switches", async () => {
    const user = userEvent.setup();
    renderApp();
    await screen.findByRole("tab", { name: "Tasks" });

    await setSourceUrl(user, "https://example.test/report.pdf");
    await user.click(screen.getByRole("tab", { name: "Server" }));
    await user.click(screen.getByRole("tab", { name: "Convert" }));

    const input = screen.getByPlaceholderText("https://arxiv.org/pdf/2408.09869") as HTMLInputElement;
    expect(input.value).toBe("https://example.test/report.pdf");
  });

  it("keeps an in-flight conversion running across tabs and submits once", async () => {
    const user = userEvent.setup();
    hoisted.client.submitSource.mockImplementation(
      (_input: unknown, options?: { signal?: AbortSignal }) =>
        new Promise((_resolve, reject) => {
          options?.signal?.addEventListener("abort", () => reject(new DOMException("Aborted", "AbortError")));
        }),
    );
    renderApp();
    await screen.findByRole("tab", { name: "Tasks" });

    await setSourceUrl(user, "https://example.test/report.pdf");
    await user.click(screen.getByRole("button", { name: "Convert" }));
    await screen.findByText("Stop waiting");

    await user.click(screen.getByRole("tab", { name: "Tasks" }));
    await user.click(screen.getByRole("tab", { name: "Convert" }));

    expect(screen.getByText("Stop waiting")).toBeTruthy();
    expect(hoisted.client.submitSource).toHaveBeenCalledTimes(1);
  });

  it("keeps a finished conversion result across tabs", async () => {
    const user = userEvent.setup();
    hoisted.client.submitSource.mockResolvedValue({
      taskId: "task-1",
      status: { task_id: "task-1", task_type: "convert", task_status: "pending" },
    });
    hoisted.poll.mockResolvedValue({ task_id: "task-1", task_type: "convert", task_status: "failure" });
    renderApp();
    await screen.findByRole("tab", { name: "Tasks" });

    await setSourceUrl(user, "https://example.test/report.pdf");
    await user.click(screen.getByRole("button", { name: "Convert" }));
    await screen.findByText("Conversion failed");

    await user.click(screen.getByRole("tab", { name: "Server" }));
    await user.click(screen.getByRole("tab", { name: "Convert" }));
    expect(screen.getByText("Conversion failed")).toBeTruthy();
  });
});

describe("App credential change", () => {
  it("cancels in-flight task requests and clears old rows when the key changes", async () => {
    const user = userEvent.setup();
    let refreshSignal: AbortSignal | undefined;
    let hangRefresh = false;
    handler = baseRouter({
      apiKeyRequired: true,
      tasks: (_url, init) => {
        const headers = new Headers(init?.headers as HeadersInit | undefined);
        if (headers.get("X-Api-Key") === "new-key") return json({ detail: "denied" }, 401);
        if (hangRefresh) {
          refreshSignal = init?.signal ?? undefined;
          return new Promise<Response>((_resolve, reject) => {
            init?.signal?.addEventListener("abort", () => reject(new DOMException("Aborted", "AbortError")));
          });
        }
        return json({ items: [taskItem("task-old")], has_more: false });
      },
    });
    renderApp();
    await screen.findByRole("tab", { name: "Tasks" });

    await user.click(screen.getByRole("tab", { name: "Tasks" }));
    await screen.findByText("task-old");

    // Start a list refresh that never settles under the old credential.
    hangRefresh = true;
    await user.click(screen.getByRole("button", { name: "Refresh" }));
    await waitFor(() => expect(refreshSignal).toBeDefined());

    // Change the credential.
    await user.click(screen.getByRole("button", { name: "Set API key" }));
    await user.type(screen.getByPlaceholderText("API key"), "new-key");
    await user.click(screen.getByRole("button", { name: "Save" }));

    // The old in-flight request is aborted and its rows can never reappear,
    // even though the new credential is rejected.
    await waitFor(() => expect(refreshSignal?.aborted).toBe(true));
    expect(screen.queryByText("task-old")).toBeNull();
    expect(await screen.findByText("An API key is required to list active tasks.")).toBeTruthy();
  });
});
