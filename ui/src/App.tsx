import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, Loader2 } from "lucide-react";
import { useState } from "react";

import { ConvertView } from "@/components/ConvertView";
import { Header } from "@/components/Header";
import { ServerPanel } from "@/components/ServerPanel";
import { TasksView } from "@/components/TasksView";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fetchCapabilities, fetchOpenApi } from "@/lib/api";
import { optionFields } from "@/lib/schema";
import { useTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";

export default function App() {
  const [theme, toggleTheme] = useTheme();
  const [tab, setTab] = useState("convert");
  // Non-secret counter bumped on every credential change. Task queries are keyed
  // by it, so data fetched with an old key can never be shown again.
  const [authGeneration, setAuthGeneration] = useState(0);
  const queryClient = useQueryClient();
  const capabilities = useQuery({ queryKey: ["capabilities"], queryFn: fetchCapabilities });
  const openapi = useQuery({ queryKey: ["openapi"], queryFn: fetchOpenApi });

  const loading = capabilities.isPending || openapi.isPending;
  const error = capabilities.error ?? openapi.error;
  const fields = optionFields(openapi.data ?? null);

  const onApiKeyChange = () => {
    // Cancel and drop the task namespace before the new key applies: the raw
    // API key is never a query key, and stale rows/detail must not survive.
    void queryClient.cancelQueries({ queryKey: ["tasks"] });
    queryClient.removeQueries({ queryKey: ["tasks"] });
    setAuthGeneration((generation) => generation + 1);
    void queryClient.invalidateQueries();
  };

  return (
    <div className="min-h-screen">
      <Header
        version={capabilities.data?.versions?.["docling-serve"]}
        theme={theme}
        onToggleTheme={toggleTheme}
        apiKeyRequired={capabilities.data?.features.api_key_required ?? false}
        onApiKeyChange={onApiKeyChange}
      />
      <main className="mx-auto max-w-[1600px] px-4 py-6">
        {loading ? (
          <div className="flex min-h-[50vh] items-center justify-center text-muted-foreground">
            <Loader2 className="size-6 animate-spin" />
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertTriangle className="size-4" />
            <AlertTitle>Cannot reach the docling-serve API</AlertTitle>
            <AlertDescription>{error.message}</AlertDescription>
          </Alert>
        ) : (
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="convert">Convert</TabsTrigger>
              <TabsTrigger value="tasks">Tasks</TabsTrigger>
              <TabsTrigger value="server">Server</TabsTrigger>
            </TabsList>
            <TabsContent
              value="convert"
              forceMount
              className={cn(tab !== "convert" && "hidden")}
            >
              {fields.length === 0 && (
                <Alert className="mb-4">
                  <AlertTriangle className="size-4" />
                  <AlertTitle>API schema unavailable</AlertTitle>
                  <AlertDescription>
                    The server does not publish <code>/openapi.json</code>, so only the source and the output
                    delivery can be chosen. Conversions run with the server defaults.
                  </AlertDescription>
                </Alert>
              )}
              <ConvertView capabilities={capabilities.data ?? null} fields={fields} />
            </TabsContent>
            <TabsContent value="tasks">
              {tab === "tasks" && <TasksView key={authGeneration} authGeneration={authGeneration} />}
            </TabsContent>
            <TabsContent value="server">
              <ServerPanel capabilities={capabilities.data ?? null} />
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  );
}
