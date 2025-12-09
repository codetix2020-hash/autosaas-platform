'use client';

import { orpcClient } from "@shared/lib/orpc-client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ContentPlatform, ContentStatus } from "@/types/contentflow-ai";

interface UseContentCalendarOptions {
  clientId?: string;
}

export function useContentCalendar(options: UseContentCalendarOptions = {}) {
  const { clientId } = options;
  const queryClient = useQueryClient();

  // List content
  const { data, isLoading, error } = useQuery({
    queryKey: ["contentflow", "content", clientId],
    queryFn: async () => {
      if (!clientId) return [];
      const result = await orpcClient.contentflow.content.list({ client_id: clientId });
      return result.data || [];
    },
    enabled: !!clientId,
  });

  // Create content
  const createMutation = useMutation({
    mutationFn: async (input: {
      client_id: string;
      scheduled_date: string;
      platform: ContentPlatform;
      content_text: string;
      status?: ContentStatus;
    }) => {
      return await orpcClient.contentflow.content.create(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contentflow", "content"] });
    },
  });

  // Bulk create content
  const bulkCreateMutation = useMutation({
    mutationFn: async (items: Array<{
      client_id: string;
      scheduled_date: Date;
      platform: ContentPlatform;
      content_text: string;
      status?: ContentStatus;
    }>) => {
      const results = await Promise.all(
        items.map((item) =>
          orpcClient.contentflow.content.create({
            client_id: item.client_id,
            scheduled_date: item.scheduled_date.toISOString().split('T')[0],
            platform: item.platform,
            content_text: item.content_text,
            status: item.status || "draft",
          })
        )
      );
      return results;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contentflow", "content"] });
    },
  });

  // Update content
  const updateMutation = useMutation({
    mutationFn: async (input: {
      id: string;
      scheduled_date?: string;
      platform?: ContentPlatform;
      content_text?: string;
      status?: ContentStatus;
    }) => {
      return await orpcClient.contentflow.content.update(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contentflow", "content"] });
    },
  });

  // Update status shorthand
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: ContentStatus }) => {
      return await orpcClient.contentflow.content.update({ id, status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contentflow", "content"] });
    },
  });

  // Delete content
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await orpcClient.contentflow.content.delete({ id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contentflow", "content"] });
    },
  });

  return {
    content: data || [],
    isLoading,
    isError: !!error,
    error,
    create: createMutation.mutateAsync,
    bulkCreate: bulkCreateMutation.mutateAsync,
    update: updateMutation.mutateAsync,
    updateStatus: updateStatusMutation.mutateAsync,
    remove: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isBulkCreating: bulkCreateMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}

// Hook for calendar view (by month)
export function useCalendarView(clientId: string, month: Date) {
  const startDate = new Date(month.getFullYear(), month.getMonth(), 1)
    .toISOString()
    .split('T')[0];
  const endDate = new Date(month.getFullYear(), month.getMonth() + 1, 0)
    .toISOString()
    .split('T')[0];

  return useContentCalendar({
    clientId,
  });
}
