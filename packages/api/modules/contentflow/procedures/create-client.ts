import { ORPCError } from "@orpc/client";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { protectedProcedure } from "../../../orpc/procedures";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey =
	process.env.SUPABASE_SERVICE_ROLE_KEY ||
	process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createSupabaseClient(supabaseUrl, supabaseKey);

export const createClient = protectedProcedure
	.route({
		method: "POST",
		path: "/contentflow/clients",
		tags: ["ContentFlow"],
		summary: "Create client",
		description: "Create a new client for an agency",
	})
	.input(
		z.object({
			agency_id: z.string(),
			name: z.string().min(1).max(255),
			industry: z.string().max(100).nullable().optional(),
			email: z.string().email().nullable().optional(),
		}),
	)
	.handler(async ({ input, context }) => {
		// Verify user owns the agency
		const { data: agency } = await supabase
			.from("agencies")
			.select("id")
			.eq("id", input.agency_id)
			.eq("user_id", context.user.id)
			.single();

		if (!agency) {
			throw new ORPCError("FORBIDDEN", {
				message: "Agency not found or access denied",
			});
		}

		// Generate unique approval token for public brief access
		const approval_token = randomUUID();

		const { data, error } = await supabase
			.from("agency_clients")
			.insert({
				agency_id: input.agency_id,
				name: input.name,
				industry: input.industry || null,
				email: input.email || null,
				approval_token,
			})
			.select()
			.single();

		if (error) {
			throw new ORPCError("INTERNAL_SERVER_ERROR", {
				message: error.message,
			});
		}

		return { data };
	});

