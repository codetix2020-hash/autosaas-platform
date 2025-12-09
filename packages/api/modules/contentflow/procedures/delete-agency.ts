import { ORPCError } from "@orpc/client";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { protectedProcedure } from "../../../orpc/procedures";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey =
	process.env.SUPABASE_SERVICE_ROLE_KEY ||
	process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

export const deleteAgency = protectedProcedure
	.route({
		method: "DELETE",
		path: "/contentflow/agencies/:id",
		tags: ["ContentFlow"],
		summary: "Delete agency",
		description: "Delete an agency",
	})
	.input(
		z.object({
			id: z.string(),
		}),
	)
	.handler(async ({ input, context }) => {
		// Verify ownership
		const { data: existing } = await supabase
			.from("agencies")
			.select("id")
			.eq("id", input.id)
			.eq("user_id", context.user.id)
			.single();

		if (!existing) {
			throw new ORPCError("NOT_FOUND", {
				message: "Agency not found",
			});
		}

		const { error } = await supabase
			.from("agencies")
			.delete()
			.eq("id", input.id);

		if (error) {
			throw new ORPCError("INTERNAL_SERVER_ERROR", {
				message: error.message,
			});
		}

		return { deleted: true };
	});

