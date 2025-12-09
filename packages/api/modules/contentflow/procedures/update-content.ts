import { ORPCError } from "@orpc/client";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { protectedProcedure } from "../../../orpc/procedures";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey =
	process.env.SUPABASE_SERVICE_ROLE_KEY ||
	process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

export const updateContent = protectedProcedure
	.route({
		method: "PUT",
		path: "/contentflow/content/:id",
		tags: ["ContentFlow"],
		summary: "Update content",
		description: "Update a content calendar entry",
	})
	.input(
		z.object({
			id: z.string(),
			scheduled_date: z.string().optional(),
			platform: z.enum(["instagram", "facebook", "twitter", "linkedin", "tiktok", "blog"]).optional(),
			content_text: z.string().min(1).max(5000).optional(),
			status: z.enum(["draft", "pending_approval", "approved", "scheduled", "published", "rejected"]).optional(),
		}),
	)
	.handler(async ({ input, context }) => {
		// Verify ownership: content belongs to client that belongs to agency owned by user
		const { data: content } = await supabase
			.from("content_calendar")
			.select("client_id, agency_clients!inner(agency_id, agencies!inner(user_id))")
			.eq("id", input.id)
			.single();

		if (!content || (content.agency_clients as any)?.agencies?.user_id !== context.user.id) {
			throw new ORPCError("FORBIDDEN", {
				message: "Content not found or access denied",
			});
		}

		const { id, ...updateData } = input;

		const { data, error } = await supabase
			.from("content_calendar")
			.update(updateData)
			.eq("id", id)
			.select()
			.single();

		if (error) {
			throw new ORPCError("INTERNAL_SERVER_ERROR", {
				message: error.message,
			});
		}

		return { data };
	});

