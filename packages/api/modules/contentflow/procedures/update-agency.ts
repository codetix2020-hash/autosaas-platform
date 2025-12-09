import { ORPCError } from "@orpc/client";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { protectedProcedure } from "../../../orpc/procedures";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey =
	process.env.SUPABASE_SERVICE_ROLE_KEY ||
	process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

const BrandVoiceSchema = z.object({
	tone: z.enum(["professional", "casual", "friendly", "formal", "playful"]),
	keywords: z.array(z.string()),
	avoid_words: z.array(z.string()),
	language: z.string().default("es"),
});

export const updateAgency = protectedProcedure
	.route({
		method: "PUT",
		path: "/contentflow/agencies/:id",
		tags: ["ContentFlow"],
		summary: "Update agency",
		description: "Update an agency",
	})
	.input(
		z.object({
			id: z.string(),
			name: z.string().min(1).max(255).optional(),
			brand_voice: BrandVoiceSchema.nullable().optional(),
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

		const { id, ...updateData } = input;

		const { data, error } = await supabase
			.from("agencies")
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

