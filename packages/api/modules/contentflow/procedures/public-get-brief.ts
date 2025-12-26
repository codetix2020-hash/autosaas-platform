import { ORPCError } from "@orpc/client";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { publicProcedure } from "../../../orpc/procedures";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey =
	process.env.SUPABASE_SERVICE_ROLE_KEY ||
	process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

export const publicGetBrief = publicProcedure
	.route({
		method: "GET",
		path: "/contentflow/public/brief/:token",
		tags: ["ContentFlow", "Public"],
		summary: "Get client brief (public)",
		description: "Get client information by token for public brief form",
	})
	.input(
		z.object({
			token: z.string().uuid(),
		}),
	)
	.handler(async ({ input }) => {
		const { token } = input;

		// Find client by approval_token (hide sensitive info)
		const { data: client, error } = await supabase
			.from("agency_clients")
			.select("id, name, industry, brief")
			.eq("approval_token", token)
			.single();

		if (error || !client) {
			throw new ORPCError("NOT_FOUND", {
				message: "Brief not found. The link may be invalid or expired.",
			});
		}

		return { data: client };
	});



