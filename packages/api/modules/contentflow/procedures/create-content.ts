import { ORPCError } from "@orpc/client";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { protectedProcedure } from "../../../orpc/procedures";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey =
	process.env.SUPABASE_SERVICE_ROLE_KEY ||
	process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

export const createContent = protectedProcedure
	.route({
		method: "POST",
		path: "/contentflow/content",
		tags: ["ContentFlow"],
		summary: "Create content",
		description: "Create a new content calendar entry",
	})
	.input(
		z.object({
			client_id: z.string(),
			scheduled_date: z.string(),
			platform: z.enum(["instagram", "facebook", "twitter", "linkedin", "tiktok", "blog"]),
			content_text: z.string().min(1).max(5000),
			status: z.enum(["draft", "pending_approval", "approved", "scheduled", "published", "rejected"]).optional().default("draft"),
		}),
	)
	.handler(async ({ input, context }) => {
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

		const { data, error } = await supabase
			.from("content_calendar")
			.insert({
				client_id: input.client_id,
				scheduled_date: input.scheduled_date,
				platform: input.platform,
				content_text: input.content_text,
				status: input.status || "draft",
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

