'use client';

import { orpcClient } from "@shared/lib/orpc-client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useAgencies() {
  const queryClient = useQueryClient();

  // List agencies
  const { data, isLoading, error } = useQuery({
    queryKey: ["contentflow", "agencies"],
    queryFn: async () => {
      const result = await orpcClient.contentflow.agencies.list();
      return result.data || [];
    },
  });

  // Create agency
  const createMutation = useMutation({
    mutationFn: async (input: { name: string; brand_voice?: any }) => {
      return await orpcClient.contentflow.agencies.create(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contentflow", "agencies"] });
    },
  });

  // Update agency
  const updateMutation = useMutation({
    mutationFn: async (input: { id: string; name?: string; brand_voice?: any }) => {
      return await orpcClient.contentflow.agencies.update(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contentflow", "agencies"] });
    },
  });

  // Delete agency
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await orpcClient.contentflow.agencies.delete({ id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contentflow", "agencies"] });
    },
  });

  return {
    agencies: data || [],
    isLoading,
    isError: !!error,
    error,
    create: createMutation.mutateAsync,
    update: updateMutation.mutateAsync,
    delete: deleteMutation.mutateAsync,
    remove: deleteMutation.mutateAsync, // Alias para compatibilidad
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}

// Hook to get single agency
export function useAgency(id: string) {
  const { agencies, isLoading } = useAgencies();
  const agency = agencies.find((a: any) => a.id === id);

  return {
    agency,
    isLoading,
  };
}
