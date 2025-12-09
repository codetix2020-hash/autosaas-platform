// ═══════════════════════════════════════════════════════════════
// AUTO-SAAS BUILDER - API Procedures
// Blueprint: TaskFlow (taskflow)
// Generated: 2025-12-08
// ═══════════════════════════════════════════════════════════════

import { z } from "zod";
import { protectedProcedure } from "../../../orpc/procedures";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// ═══════════════════════════════════════════════════════════════
// TASKS CRUD
// ═══════════════════════════════════════════════════════════════

export const listTasks = protectedProcedure
    .route({ method: "GET", path: "/taskflow/tasks" })
    .input(z.object({
        page: z.number().int().min(1).default(1),
        limit: z.number().int().min(1).max(100).default(20),
        sortBy: z.string().default('created_at'),
        sortOrder: z.enum(['asc', 'desc']).default('desc'),
        search: z.string().optional(),
        status: z.string().optional(),
    }).optional())
    .handler(async ({ input, context }) => {
        const organizationId = context.session?.activeOrganizationId;
        if (!organizationId) {
            throw new Error("No active organization");
        }
        const { page = 1, limit = 20, sortBy = 'created_at', sortOrder = 'desc', search, status } = input || {};
        const offset = (page - 1) * limit;
        
        let query = supabase
            .from("tasks")
            .select("*", { count: 'exact' })
            .eq("organization_id", organizationId);
        
        // Apply search filter
        if (search) {
            query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,status.ilike.%${search}%,priority.ilike.%${search}%,assigned_to.ilike.%${search}%`);
        }
        
        // Apply status filter
        if (status) {
            query = query.eq("status", status);
        }
        
        // Get total count with filters
        const countQuery = supabase
            .from("tasks")
            .select("*", { count: 'exact', head: true })
            .eq("organization_id", organizationId);
        if (search) {
            countQuery.or(`title.ilike.%${search}%,description.ilike.%${search}%,status.ilike.%${search}%,priority.ilike.%${search}%,assigned_to.ilike.%${search}%`);
        }
        if (status) {
            countQuery.eq("status", status);
        }
        const { count } = await countQuery;
        
        // Get paginated data
        const { data, error } = await query
            .order(sortBy, { ascending: sortOrder === 'asc' })
            .range(offset, offset + limit - 1);
        
        if (error) {
            console.error("Error fetching tasks:", error);
            throw new Error(error.message);
        }
        
        return {
            data: data || [],
            pagination: {
                page,
                limit,
                total: count || 0,
                totalPages: Math.ceil((count || 0) / limit),
            },
        };
    });

export const getTasks = protectedProcedure
    .route({ method: "GET", path: "/taskflow/tasks/:id" })
    .input(z.object({ id: z.string().uuid() }))
    .handler(async ({ input, context }) => {
        const organizationId = context.session?.activeOrganizationId;
        if (!organizationId) {
            throw new Error("No active organization");
        }
        const { data, error } = await supabase
            .from("tasks")
            .select("*")
            .eq("id", input.id)
            .eq("organization_id", organizationId)
            .single();
        if (error) {
            console.error("Error fetching tasks:", error);
            throw new Error(error.message);
        }
        return { data };
    });

export const createTasks = protectedProcedure
    .route({ method: "POST", path: "/taskflow/tasks" })
    .input(z.object({
        title: z.string().min(1),
        description: z.string().nullable().optional(),
        status: z.string().min(1),
        priority: z.string().nullable().optional(),
        due_date: z.string().optional(),
        assigned_to: z.string().nullable().optional(),
    }))
    .handler(async ({ input, context }) => {
        const organizationId = context.session?.activeOrganizationId;
        if (!organizationId) {
            throw new Error("No active organization");
        }
        const { data, error } = await supabase
            .from("tasks")
            .insert({ ...input, organization_id: organizationId })
            .select()
            .single();
        if (error) {
            console.error("Error creating tasks:", error);
            throw new Error(error.message);
        }
        return { data };
    });

export const updateTasks = protectedProcedure
    .route({ method: "PUT", path: "/taskflow/tasks/:id" })
    .input(z.object({
        id: z.string().uuid(),
        title: z.string().nullable().optional(),
        description: z.string().nullable().optional(),
        status: z.string().nullable().optional(),
        priority: z.string().nullable().optional(),
        due_date: z.string().optional(),
        assigned_to: z.string().nullable().optional(),
    }))
    .handler(async ({ input, context }) => {
        const { id, ...updateData } = input;
        const organizationId = context.session?.activeOrganizationId;
        if (!organizationId) {
            throw new Error("No active organization");
        }
        const { data, error } = await supabase
            .from("tasks")
            .update(updateData)
            .eq("id", id)
            .eq("organization_id", organizationId)
            .select()
            .single();
        if (error) {
            console.error("Error updating tasks:", error);
            throw new Error(error.message);
        }
        return { data };
    });

export const deleteTasks = protectedProcedure
    .route({ method: "DELETE", path: "/taskflow/tasks/:id" })
    .input(z.object({ id: z.string().uuid() }))
    .handler(async ({ input, context }) => {
        const organizationId = context.session?.activeOrganizationId;
        if (!organizationId) {
            throw new Error("No active organization");
        }
        const { error } = await supabase
            .from("tasks")
            .delete()
            .eq("id", input.id)
            .eq("organization_id", organizationId);
        if (error) {
            console.error("Error deleting tasks:", error);
            throw new Error(error.message);
        }
        return { success: true };
    });

