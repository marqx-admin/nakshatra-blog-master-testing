import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AdminOperationId } from "@bp/api-client-admin";
import { useAdminTransport } from "./AdminApiProvider";
import { requireSuccess } from "./apiState";
import { withMutationHeaders, type AdminRequestInput } from "./adminTransport";

function scopedQueryKey(operationId: AdminOperationId, input: AdminRequestInput): readonly unknown[] {
  const siteKey = typeof input.path?.site_key === "string" ? input.path.site_key : undefined;
  return siteKey ? ["SITE", siteKey, operationId, input] : ["GLOBAL_OR_AUTH", operationId, input];
}

export function useAdminQuery<T>(operationId: AdminOperationId, input: AdminRequestInput, enabled = true) {
  const transport = useAdminTransport();
  return useQuery({
    queryKey: scopedQueryKey(operationId, input),
    enabled,
    queryFn: async ({ signal }) => requireSuccess(await transport.request<T>(operationId, input, signal)),
  });
}

export function useAdminMutation<TData = unknown, TVariables extends AdminRequestInput = AdminRequestInput>(
  operationId: AdminOperationId,
  options: { invalidate?: readonly unknown[] } = {},
) {
  const transport = useAdminTransport();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: TVariables) => requireSuccess(await transport.request<TData>(operationId, withMutationHeaders(input))),
    onSuccess: async () => {
      if (!options.invalidate?.length) return;
      const targets = new Set(options.invalidate.map((value) => String(value)));
      await queryClient.invalidateQueries({
        predicate: (query) => query.queryKey.some((part) => targets.has(String(part))),
      });
    },
  });
}
