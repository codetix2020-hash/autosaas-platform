import { ORPCError } from "@orpc/client";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { protectedProcedure } from "../../../orpc/procedures";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey =
	process.env.SUPABASE_SERVICE_ROLE_KEY ||
	process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

export const listClients = protectedProcedure
	.route({
		method: "GET",
		path: "/contentflow/clients",
		tags: ["ContentFlow"],
		summary: "List clients",
		description: "Get all clients for a specific agency",
	})
	.input(
		z
			.object({
				agency_id: z.string(),
			})
			.optional(),
	)
	.handler(async ({ input, context }) => {
		if (!input?.agency_id) {
			throw new ORPCError("BAD_REQUEST", {
				message: "agency_id is required",
			});
		}

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

		// Get clients (explicitly select fields including approval_token for public brief links)
		const { data, error } = await supabase
			.from("agency_clients")
			.select("id, name, industry, brief, approval_token, email, created_at, agency_id")
			.eq("agency_id", input.agency_id)
			.order("created_at", { ascending: false });

		if (error) {
			throw new ORPCError("INTERNAL_SERVER_ERROR", {
				message: error.message,
			});
		}

		return { data: data || [] };
	});

