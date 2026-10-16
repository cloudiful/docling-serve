import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { AlertTriangle, Loader2, RefreshCw, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import {
  AUTO_REFRESH_MS,
  activeTasksErrorMessage,
  type ActiveTaskItem,
  detailStatusSummary,
  errorBackoffMs,
  fetchActiveTasks,
  fetchTaskDetail,
  formatCreatedAt,
  projectTaskDetail,
  TASK_PAGE_SIZE,
  type TaskDetail,
  taskDetailErrorMessage,
} from "@/lib/tasks";

interface Props {
  /**
   * Bumped by the app whenever the credential changes. It is part of every
   * query key so data fetched under an old key can never be shown again.
   */
  authGeneration: number;
}

export function TasksView({ authGeneration }: Props) {
  const [page, setPage] = useState(0);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const windowActive = useWindowActive();
  // Consecutive failed list fetches, driving the exponential error backoff.
  const failuresRef = useRef(0);

  const listQuery = useQuery({
    queryKey: ["tasks", "list", authGeneration, page],
    queryFn: async ({ signal }) => {
      try {
        const data = await fetchActiveTasks(page * TASK_PAGE_SIZE, signal);
        failuresRef.current = 0;
        return data;
      } catch (error) {
        if (!signal.aborted) failuresRef.current += 1;
        throw error;
      }
    },
    retry: false,
    placeholderData: keepPreviousData,
    refetchIntervalInBackground: false,
    refetchInterval: () => {
      if (!autoRefresh || !windowActive) return false;
      return failuresRef.current > 0 ? errorBackoffMs(failuresRef.current) : AUTO_REFRESH_MS;
    },
  });

  const detailQuery = useQuery({
    queryKey: ["tasks", "detail", authGeneration, selectedTaskId],
    queryFn: ({ signal }) => fetchTaskDetail(selectedTaskId as string, signal),
    enabled: selectedTaskId !== null,
    retry: false,
  });

  const items = listQuery.data?.items ?? [];
  const hasMore = listQuery.data?.has_more ?? false;
  const offset = page * TASK_PAGE_SIZE;

  // A non-zero page can become empty while tasks finish. Reset to the first
  // page instead of showing an empty state that contradicts the queue.
  useEffect(() => {
    if (page > 0 && listQuery.data && items.length === 0 && !listQuery.isFetching) {
      setPage(0);
      setSelectedTaskId(null);
    }
  }, [page, listQuery.data, items.length, listQuery.isFetching]);

  const goToPage = (next: number) => {
    setSelectedTaskId(null);
    setPage(Math.max(0, next));
  };

  const refresh = () => {
    setSelectedTaskId(null);
    if (page !== 0) setPage(0);
    else void listQuery.refetch();
  };

  const initialLoading = listQuery.isPending;
  const listError = listQuery.isError ? activeTasksErrorMessage(listQuery.error) : null;
  const showEmpty = !initialLoading && !listError && page === 0 && items.length === 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1">
          <h2 className="text-base font-semibold">Active tasks</h2>
          <p className="text-xs text-muted-foreground">
            Tasks that are pending or running. Finished tasks are not listed.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Switch
              id="tasks-auto-refresh"
              checked={autoRefresh}
              onCheckedChange={setAutoRefresh}
              aria-label="Auto-refresh active tasks"
            />
            <Label htmlFor="tasks-auto-refresh" className="text-sm font-normal">
              Auto-refresh
            </Label>
          </div>
          <Button variant="outline" size="sm" disabled={listQuery.isFetching} onClick={refresh}>
            <RefreshCw className={cn("size-4", listQuery.isFetching && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </div>

      {listQuery.isFetching && !initialLoading && (
        <p className="flex items-center gap-2 text-xs text-muted-foreground" aria-live="polite">
          <Loader2 className="size-3 animate-spin" /> Refreshing…
        </p>
      )}

      {initialLoading ? (
        <div className="flex min-h-[8rem] items-center justify-center text-muted-foreground">
          <Loader2 className="size-5 animate-spin" />
        </div>
      ) : listError ? (
        <Alert variant="destructive">
          <AlertTriangle className="size-4" />
          <AlertTitle>Cannot load active tasks</AlertTitle>
          <AlertDescription className="space-y-3">
            <p>{listError}</p>
            <Button variant="outline" size="sm" disabled={listQuery.isFetching} onClick={() => void listQuery.refetch()}>
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      ) : showEmpty ? (
        <div className="flex min-h-[8rem] flex-col items-center justify-center gap-1 rounded-md border text-center text-muted-foreground">
          <p className="text-sm font-medium text-foreground">No active tasks</p>
          <p className="text-xs">Queued and running tasks will appear here.</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-md border">
            <table className="w-full min-w-[36rem] border-collapse text-sm">
              <caption className="sr-only">Active tasks</caption>
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th scope="col" className="px-3 py-2 font-medium">
                    Task ID
                  </th>
                  <th scope="col" className="px-3 py-2 font-medium">
                    Type
                  </th>
                  <th scope="col" className="px-3 py-2 font-medium">
                    Status
                  </th>
                  <th scope="col" className="px-3 py-2 font-medium">
                    Created
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((task) => (
                  <TaskRow
                    key={task.task_id}
                    task={task}
                    selected={task.task_id === selectedTaskId}
                    onSelect={() => setSelectedTaskId(task.task_id)}
                  />
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">
              {items.length > 0 ? `Showing ${offset + 1}–${offset + items.length}` : null}
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page === 0} onClick={() => goToPage(page - 1)}>
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={!hasMore || listQuery.isFetching}
                onClick={() => goToPage(page + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </>
      )}

      {selectedTaskId && (
        <section aria-label="Task details" className="rounded-md border p-4">
          <div className="mb-3 flex items-start justify-between gap-3">
            <h3 className="text-sm font-semibold">Task details</h3>
            <Button variant="ghost" size="icon-sm" aria-label="Close task details" onClick={() => setSelectedTaskId(null)}>
              <X className="size-4" />
            </Button>
          </div>
          {detailQuery.isPending ? (
            <div className="flex min-h-[4rem] items-center justify-center text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
            </div>
          ) : detailQuery.isError ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">{taskDetailErrorMessage(detailQuery.error)}</p>
              <Button variant="outline" size="sm" disabled={detailQuery.isFetching} onClick={() => void detailQuery.refetch()}>
                Retry
              </Button>
            </div>
          ) : detailQuery.data ? (
            <DetailFields detail={projectTaskDetail(detailQuery.data)} />
          ) : null}
        </section>
      )}
    </div>
  );
}

function TaskRow({
  task,
  selected,
  onSelect,
}: {
  task: ActiveTaskItem;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <tr className="border-b last:border-b-0" data-selected={selected ? "true" : undefined}>
      <td className="px-3 py-2">
        <button
          type="button"
          title={task.task_id}
          aria-pressed={selected}
          onClick={onSelect}
          className={cn(
            "block max-w-[18rem] truncate rounded-sm font-mono text-xs hover:underline focus-visible:underline focus-visible:outline-none",
            selected && "font-semibold",
          )}
        >
          {task.task_id}
        </button>
      </td>
      <td className="px-3 py-2">{task.task_type}</td>
      <td className="px-3 py-2">
        <StatusBadge status={task.task_status} />
      </td>
      <td className="px-3 py-2 text-muted-foreground">{formatCreatedAt(task.created_at)}</td>
    </tr>
  );
}

function StatusBadge({ status }: { status: string }) {
  const label = status === "pending" ? "Pending" : status === "started" ? "Started" : status;
  return <Badge variant={status === "started" ? "default" : "secondary"}>{label}</Badge>;
}

function DetailFields({ detail }: { detail: TaskDetail }) {
  const rows: [string, string][] = [
    ["Task ID", detail.taskId],
    ["Type", detail.taskType],
    ["Status", detail.taskStatus],
    ["Queue position", detail.taskPosition === null ? "–" : String(detail.taskPosition)],
  ];
  const metaRows: [string, string][] = detail.meta
    ? [
        ["Documents", String(detail.meta.num_docs)],
        ["Processed", String(detail.meta.num_processed)],
        ["Succeeded", String(detail.meta.num_succeeded)],
        ["Partially succeeded", String(detail.meta.num_partially_succeeded)],
        ["Failed", String(detail.meta.num_failed)],
      ]
    : [];
  const summary = detailStatusSummary(detail.taskStatus);

  return (
    <div className="space-y-3">
      <dl className="grid gap-x-8 gap-y-1.5 text-sm sm:grid-cols-2">
        {[...rows, ...metaRows].map(([label, value]) => (
          <div key={label} className="flex justify-between gap-4">
            <dt className="text-muted-foreground">{label}</dt>
            <dd className="truncate text-right font-medium" title={value}>
              {value}
            </dd>
          </div>
        ))}
      </dl>
      {detail.meta === null && (
        <p className="text-xs text-muted-foreground">No processing counts are available yet.</p>
      )}
      {summary && <p className="text-sm text-muted-foreground">{summary}</p>}
    </div>
  );
}

function isWindowActive(): boolean {
  if (typeof document === "undefined") return true;
  const visible = document.visibilityState ? document.visibilityState === "visible" : true;
  const focused = typeof document.hasFocus === "function" ? document.hasFocus() : true;
  return visible && focused;
}

/** Tracks whether the document is both visible and focused. */
function useWindowActive(): boolean {
  const [active, setActive] = useState(isWindowActive);

  useEffect(() => {
    const update = () => setActive(isWindowActive());
    update();
    document.addEventListener("visibilitychange", update);
    window.addEventListener("focus", update);
    window.addEventListener("blur", update);
    return () => {
      document.removeEventListener("visibilitychange", update);
      window.removeEventListener("focus", update);
      window.removeEventListener("blur", update);
    };
  }, []);

  return active;
}
