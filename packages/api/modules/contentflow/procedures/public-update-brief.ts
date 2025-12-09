import { ORPCError } from "@orpc/client";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { publicProcedure } from "../../../orpc/procedures";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey =
	process.env.SUPABASE_SERVICE_ROLE_KEY ||
	process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

export const publicUpdateBrief = publicProcedure
	.route({
		method: "POST",
		path: "/contentflow/public/brief/:token",
		tags: ["ContentFlow", "Public"],
		summary: "Update client brief (public)",
		description:
			"Allow clients to fill their brief without authentication using a unique token",
	})
	.input(
		z.object({
			token: z.string().uuid(),
			brief: z.any(), // JSONB field - accepts any object
		}),
	)
	.handler(async ({ input }) => {
		const { token, brief } = input;

		// Find client by approval_token
		const { data: client, error: findError } = await supabase
			.from("agency_clients")
			.select("id, name, agency_id")
			.eq("approval_token", token)
			.single();

		if (findError || !client) {
			throw new ORPCError("NOT_FOUND", {
				message: "Brief not found. The link may be invalid or expired.",
			});
		}

		// Update brief
		const { data, error: updateError } = await supabase
			.from("agency_clients")
			.update({ brief })
			.eq("id", client.id)
			.select()
			.single();

		if (updateError) {
			throw new ORPCError("INTERNAL_SERVER_ERROR", {
				message: updateError.message,
			});
		}

		return {
			success: true,
			message: "Brief updated successfully",
			data,
		};
	});

