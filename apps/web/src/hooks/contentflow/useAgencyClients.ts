'use client';

import { orpcClient } from "@shared/lib/orpc-client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

interface UseAgencyClientsOptions {
  agencyId?: string;
}

export function useAgencyClients(options: UseAgencyClientsOptions = {}) {
  const { agencyId } = options;
  const queryClient = useQueryClient();

  // List clients
  const { data, isLoading, error } = useQuery({
    queryKey: ["contentflow", "clients", agencyId],
    queryFn: async () => {
      if (!agencyId) return [];
      const result = await orpcClient.contentflow.clients.list({ agency_id: agencyId });
      return result.data || [];
    },
    enabled: !!agencyId,
  });

  // Create client
  const createMutation = useMutation({
    mutationFn: async (input: { agency_id: string; name: string; industry?: string | null }) => {
      return await orpcClient.contentflow.clients.create(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contentflow", "clients"] });
    },
  });

  // Update client
  const updateMutation = useMutation({
    mutationFn: async (input: { id: string; name?: string; industry?: string | null; brief?: Record<string, any> }) => {
      return await orpcClient.contentflow.clients.update(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contentflow", "clients"] });
    },
  });

  // Delete client
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await orpcClient.contentflow.clients.delete({ id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contentflow", "clients"] });
    },
  });

  return {
    clients: data || [],
    isLoading,
    isError: !!error,
    error,
    create: createMutation.mutateAsync,
    update: updateMutation.mutateAsync,
    remove: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}

// Hook for single client
export function useAgencyClient(id: string | undefined) {
  const { clients, isLoading } = useAgencyClients({});
  const client = clients.find((c: any) => c.id === id);

  return {
    client,
    isLoading,
  };
}
