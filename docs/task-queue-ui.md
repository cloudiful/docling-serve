# Tasks tab

The web UI (`/ui`) has a **Tasks** tab between **Convert** and **Server**. It
shows the active task queue for the current tenant: the tasks that are still
pending or running. Finished tasks (success, failure, cancelled) are never
listed, and there is no status filter because only those two states can appear.

## What it shows

Each row carries only identity-level data returned by the active task list:

- **Task ID** — selectable, with the full value available as a tooltip.
- **Type** — for example `convert` or `chunk`.
- **Status** — a Pending or Started badge.
- **Created** — the creation time in the local time zone.

The server returns no total count, so pagination is offset-based: 20 tasks per
page with **Previous** and **Next**, where **Next** is enabled only while the
server reports more. The range line shows the visible slice (for example
`Showing 1–20`) and never invents a total. If a later page becomes empty because
tasks finished, the view returns to the first page instead of showing a false
empty state.

## Task details

Selecting a task ID loads the status of that single task and shows it inline
below the table. Only safe, explicitly listed fields are rendered: status, queue
position when queued, and the numeric document counts (documents, processed,
succeeded, partially succeeded, failed). No raw response, backend error text,
source filename, URL, or configuration is displayed. A task that finished and
disappeared from the queue shows a fixed "no longer available" message, which
does not affect the list. Closing the details clears the selection; paging or
changing the API key clears it as well.

## Refresh

The list fetches on open. **Auto-refresh** is on by default and reloads the list
every 5 seconds, but only while the Tasks tab is open and the browser window is
visible and focused; a background tab or window does not poll. The **Refresh**
button reloads manually and returns to the first page. If a request fails, the
interval backs off (5, 10, 20, 40, then 60 seconds) until a successful reload
restores the 5-second cadence, and no new request starts while one is in flight.

## Authentication

The tab uses the same API key and reverse-proxy base URL as the rest of the UI,
sent as the `X-Api-Key` header; the server derives the tenant. No extra tenant
header or credential storage is added. Changing the API key clears any task data
fetched with the previous key and cancels its in-flight requests, so stale rows
can never be shown under a new credential. A rejected key is reported as fixed,
user-safe text (missing or invalid key, not permitted), never as the raw server
message.

## Older servers

Servers without the active task endpoint reply `404`, and the tab shows
"Active task listing is not available on this server" instead of failing. Other
errors (network, 5xx) show a generic message with a **Retry** button.
