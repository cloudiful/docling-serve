import type { TaskStatus, TaskStatusResponse, TaskType } from "@docling/docling-client";

import { HttpError, getJson } from "@/lib/api";
import type { WatchedTaskStatus } from "@/lib/taskPoll";

/** Mirrors `docling_jobkit.datamodel.task_listing.ActiveTaskItem`. */
export interface ActiveTaskItem {
  task_id: string;
  task_type: TaskType;
  task_status: TaskStatus;
  created_at: string;
}

/**
 * Mirrors `ActiveTaskPage`. The endpoint carries no total count, only a
 * `has_more` flag, so pagination is "load the next 20" rather than a page
 * count against a known total.
 */
export interface ActiveTaskPage {
  items: ActiveTaskItem[];
  has_more: boolean;
}

/** Server-side page size. The list endpoint accepts 1..100. */
export const TASK_PAGE_SIZE = 20;

/** Delay before the next automatic list fetch while the queue is healthy. */
export const AUTO_REFRESH_MS = 5000;

/** Exponential error backoff steps for transient list failures (5s..60s). */
const ERROR_BACKOFF_STEPS_MS = [5000, 10000, 20000, 40000, 60000];

export function errorBackoffMs(failures: number): number {
  const index = Math.min(Math.max(failures, 1), ERROR_BACKOFF_STEPS_MS.length) - 1;
  return ERROR_BACKOFF_STEPS_MS[index] ?? 60000;
}

export async function fetchActiveTasks(offset: number, signal?: AbortSignal): Promise<ActiveTaskPage> {
  const params = new URLSearchParams({
    limit: String(TASK_PAGE_SIZE),
    offset: String(Math.max(0, Math.floor(offset))),
  });
  return getJson<ActiveTaskPage>(`/v1/tasks?${params.toString()}`, signal);
}

export async function fetchTaskDetail(taskId: string, signal?: AbortSignal): Promise<WatchedTaskStatus> {
  return getJson<WatchedTaskStatus>(`/v1/status/poll/${encodeURIComponent(taskId)}?wait=0`, signal);
}

/**
 * The only task-detail fields the UI is allowed to render. Everything else in
 * the poll response (raw status text, failure payloads, options) is dropped by
 * {@link projectTaskDetail} rather than forwarded to the DOM.
 */
export interface TaskDetail {
  taskId: string;
  taskType: TaskType;
  taskStatus: TaskStatusResponse["task_status"] | "cancelled";
  taskPosition: number | null;
  meta: {
    num_docs: number;
    num_processed: number;
    num_succeeded: number;
    num_partially_succeeded: number;
    num_failed: number;
  } | null;
}

export function projectTaskDetail(status: WatchedTaskStatus): TaskDetail {
  const meta = status.task_meta;
  return {
    taskId: status.task_id,
    taskType: status.task_type,
    taskStatus: status.task_status,
    taskPosition: typeof status.task_position === "number" ? status.task_position : null,
    meta: meta
      ? {
          num_docs: meta.num_docs,
          num_processed: meta.num_processed,
          num_succeeded: meta.num_succeeded,
          num_partially_succeeded: meta.num_partially_succeeded,
          num_failed: meta.num_failed,
        }
      : null,
  };
}

/** Fixed summary text for a terminal detail status; never the server message. */
export function detailStatusSummary(status: TaskDetail["taskStatus"]): string | null {
  switch (status) {
    case "failure":
      return "The task failed.";
    case "success":
      return "The task completed successfully.";
    case "partial_success":
      return "The task completed with partial results.";
    case "cancelled":
      return "The task was cancelled.";
    case "skipped":
      return "The task was skipped.";
    default:
      return null;
  }
}

/** Fixed, user-safe list error text; the server message is never rendered. */
export function activeTasksErrorMessage(error: unknown): string {
  if (error instanceof HttpError) {
    switch (error.status) {
      case 401:
        return "An API key is required to list active tasks.";
      case 403:
        return "This API key is not permitted to list active tasks.";
      case 404:
        return "Active task listing is not available on this server.";
      default:
        return "Unable to load active tasks. The server returned an error.";
    }
  }
  return "Unable to load active tasks. Check the connection and try again.";
}

/** Fixed, user-safe detail error text; the server message is never rendered. */
export function taskDetailErrorMessage(error: unknown): string {
  if (error instanceof HttpError) {
    switch (error.status) {
      case 401:
        return "An API key is required to load task details.";
      case 403:
        return "This API key is not permitted to load task details.";
      case 404:
        return "This task is no longer available.";
      default:
        return "Unable to load task details. The server returned an error.";
    }
  }
  return "Unable to load task details. Check the connection and try again.";
}

/** Localized creation time with a safe fallback for unparseable values. */
export function formatCreatedAt(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown time";
  return date.toLocaleString();
}
