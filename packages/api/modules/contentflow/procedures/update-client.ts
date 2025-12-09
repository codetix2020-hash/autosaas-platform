import { ORPCError } from "@orpc/client";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { protectedProcedure } from "../../../orpc/procedures";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey =
	process.env.SUPABASE_SERVICE_ROLE_KEY ||
	process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

export const updateClient = protectedProcedure
	.route({
		method: "PUT",
		path: "/contentflow/clients/:id",
		tags: ["ContentFlow"],
		summary: "Update client",
		description: "Update a client",
	})
	.input(
		z.object({
			id: z.string(),
			name: z.string().min(1).max(255).optional(),
			industry: z.string().max(100).nullable().optional(),
			brief: z.any().optional(), // JSONB field - accepts any object
		}),
	)
	.handler(async ({ input, context }) => {
		// Verify ownership: client belongs to agency owned by user
		const { data: client } = await supabase
			.from("agency_clients")
			.select("agency_id, agencies!inner(user_id)")
			.eq("id", input.id)
			.single();

		if (!client || (client.agencies as any)?.user_id !== context.user.id) {
			throw new ORPCError("FORBIDDEN", {
				message: "Client not found or access denied",
			});
		}

		const { id, ...updateData } = input;

		const { data, error } = await supabase
			.from("agency_clients")
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

