import { createContext, useContext, useMemo, type PropsWithChildren } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRc7AdminTransport, type AdminTransport } from "./adminTransport";

const TransportContext = createContext<AdminTransport | null>(null);

export function AdminApiProvider({ children, transport }: PropsWithChildren<{ transport?: AdminTransport }>) {
  const resolvedTransport = useMemo(() => transport ?? createRc7AdminTransport(), [transport]);
  const queryClient = useMemo(
    () => new QueryClient({ defaultOptions: { queries: { retry: false, staleTime: 10_000, refetchOnWindowFocus: false }, mutations: { retry: false } } }),
    [],
  );
  return (
    <TransportContext.Provider value={resolvedTransport}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </TransportContext.Provider>
  );
}

export function useAdminTransport(): AdminTransport {
  const value = useContext(TransportContext);
  if (!value) throw new Error("AdminApiProvider is required");
  return value;
}
