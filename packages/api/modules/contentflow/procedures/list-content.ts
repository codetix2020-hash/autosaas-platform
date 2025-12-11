import { ORPCError } from "@orpc/client";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { protectedProcedure } from "../../../orpc/procedures";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey =
	process.env.SUPABASE_SERVICE_ROLE_KEY ||
	process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

export const listContent = protectedProcedure
	.route({
		method: "GET",
		path: "/contentflow/content",
		tags: ["ContentFlow"],
		summary: "List content",
		description: "Get all content calendar entries for a client",
	})
	.input(
		z
			.object({
				client_id: z.string(),
			})
			.optional(),
	)
	.handler(async ({ input, context }) => {
		if (!input?.client_id) {
			throw new ORPCError("BAD_REQUEST", {
				message: "client_id is required",
			});
		}

		// Verify user owns the client (via agency)
		const { data: client } = await supabase
			.from("agency_clients")
			.select("id, agency_id, agencies!inner(user_id)")
			.eq("id", input.client_id)
			.single();

		if (!client || (client.agencies as any)?.user_id !== context.user.id) {
			throw new ORPCError("FORBIDDEN", {
				message: "Client not found or access denied",
			});
		}

		// Get content calendar
		const { data, error } = await supabase
			.from("content_calendar")
			.select("*")
			.eq("client_id", input.client_id)
			.order("scheduled_date", { ascending: true });

		if (error) {
			throw new ORPCError("INTERNAL_SERVER_ERROR", {
				message: error.message,
			});
		}

		return { data: data || [] };
	});


