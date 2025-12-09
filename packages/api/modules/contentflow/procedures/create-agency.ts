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
	language: z.string(),
});

export const createAgency = protectedProcedure
	.route({
		method: "POST",
		path: "/contentflow/agencies",
		tags: ["ContentFlow"],
		summary: "Create agency",
		description: "Create a new agency for the current user",
	})
	.input(
		z.object({
			name: z.string().min(1).max(255),
			brand_voice: BrandVoiceSchema.nullable().optional(),
		}),
	)
	.handler(async ({ input, context }) => {
		console.log("[create-agency] Input received:", JSON.stringify(input, null, 2));
		console.log("[create-agency] User ID:", context.user.id);

		const { data, error } = await supabase
			.from("agencies")
			.insert({
				user_id: context.user.id,
				name: input.name,
				brand_voice: input.brand_voice || null,
			})
			.select()
			.single();

		if (error) {
			console.error("[create-agency] Supabase error:", error);
			throw new ORPCError("INTERNAL_SERVER_ERROR", {
				message: error.message,
			});
		}

		console.log("[create-agency] Success:", data);
		return { data };
	});

