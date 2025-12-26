import { ORPCError } from "@orpc/client";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { protectedProcedure } from "../../../orpc/procedures";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey =
	process.env.SUPABASE_SERVICE_ROLE_KEY ||
	process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

export const listAgencies = protectedProcedure
	.route({
		method: "GET",
		path: "/contentflow/agencies",
		tags: ["ContentFlow"],
		summary: "List agencies",
		description: "Get all agencies for the current user",
	})
	.input(
		z
			.object({
				page: z.number().optional().default(1),
				pageSize: z.number().optional().default(20),
			})
			.optional(),
	)
	.handler(async ({ input, context }) => {
		const page = input?.page ?? 1;
		const pageSize = input?.pageSize ?? 20;
		const offset = (page - 1) * pageSize;

		// Get total count
		const { count } = await supabase
			.from("agencies")
			.select("*", { count: "exact", head: true })
			.eq("user_id", context.user.id);

		// Get paginated data
		const { data, error } = await supabase
			.from("agencies")
			.select("*")
			.eq("user_id", context.user.id)
			.order("created_at", { ascending: false })
			.range(offset, offset + pageSize - 1);

		if (error) {
			throw new ORPCError("INTERNAL_SERVER_ERROR", {
				message: error.message,
			});
		}

		return {
			data: data || [],
			pagination: {
				page,
				pageSize,
				total: count || 0,
				totalPages: Math.ceil((count || 0) / pageSize),
			},
		};
	});



