import { ORPCError } from "@orpc/client";
import { type Config, config } from "@repo/config";
import { getOrganizationById } from "@repo/database";
import { logger } from "@repo/logs";
import {
	createCheckoutLink as createCheckoutLinkFn,
	getCustomerIdFromEntity,
} from "@repo/payments";
import { z } from "zod";
import { localeMiddleware } from "../../../orpc/middleware/locale-middleware";
import { protectedProcedure } from "../../../orpc/procedures";

export const createCheckoutLink = protectedProcedure
	.use(localeMiddleware)
	.route({
		method: "POST",
		path: "/payments/create-checkout-link",
		tags: ["Payments"],
		summary: "Create checkout link",
		description:
			"Creates a checkout link for a one-time or subscription product",
	})
	.input(
		z.object({
			type: z.enum(["one-time", "subscription"]),
			productId: z.string(),
			redirectUrl: z.string().optional(),
			organizationId: z.string().optional(),
		}),
	)
	.handler(
		async ({
			input: { productId, redirectUrl, type, organizationId },
			context: { user },
		}) => {
			console.log("🔍 [createCheckoutLink] Input recibido:", {
				productId,
				type,
				organizationId,
				redirectUrl,
				userId: user.id,
				userEmail: user.email,
			});

			if (!productId || productId === "undefined" || productId === "null") {
				console.error("❌ [createCheckoutLink] productId inválido:", productId);
				throw new ORPCError("BAD_REQUEST", "Invalid productId");
			}

			const customerId = await getCustomerIdFromEntity(
				organizationId
					? {
							organizationId,
						}
					: {
							userId: user.id,
						},
			);

			console.log("👤 [createCheckoutLink] customerId:", customerId);

			const plans = config.payments.plans as Config["payments"]["plans"];

			console.log("📦 [createCheckoutLink] Buscando plan con productId:", productId);
			console.log("📦 [createCheckoutLink] Planes disponibles:", Object.keys(plans));

			const plan = Object.entries(plans).find(([_planId, plan]) =>
				plan.prices?.find((price) => price.productId === productId),
			);

			if (!plan) {
				console.error("❌ [createCheckoutLink] No se encontró plan con productId:", productId);
				console.log("📋 [createCheckoutLink] Precios de todos los planes:", 
					Object.entries(plans).map(([planId, plan]) => ({
						planId,
						prices: plan.prices?.map(p => ({ productId: p.productId, type: p.type, interval: "interval" in p ? p.interval : undefined }))
					}))
				);
				throw new ORPCError("NOT_FOUND", "Plan not found for productId");
			}

			console.log("✅ [createCheckoutLink] Plan encontrado:", plan[0]);

			const price = plan?.[1].prices?.find(
				(price) => price.productId === productId,
			);

			if (!price) {
				console.error("❌ [createCheckoutLink] No se encontró price dentro del plan");
				throw new ORPCError("NOT_FOUND", "Price not found");
			}

			console.log("✅ [createCheckoutLink] Price encontrado:", {
				productId: price.productId,
				type: price.type,
				interval: "interval" in price ? price.interval : undefined,
			});
			const trialPeriodDays =
				price && "trialPeriodDays" in price
					? price.trialPeriodDays
					: undefined;

			const organization = organizationId
				? await getOrganizationById(organizationId)
				: undefined;

			if (organization === null) {
				throw new ORPCError("NOT_FOUND");
			}

			const seats =
				organization && price && "seatBased" in price && price.seatBased
					? organization.members.length
					: undefined;

			try {
				console.log("🚀 [createCheckoutLink] Creando checkout link con:", {
					type,
					productId,
					email: user.email,
					organizationId,
					userId: organizationId ? undefined : user.id,
					trialPeriodDays,
					seats,
					customerId: customerId ?? undefined,
				});

				const checkoutLink = await createCheckoutLinkFn({
					type,
					productId,
					email: user.email,
					name: user.name ?? "",
					redirectUrl,
					...(organizationId
						? { organizationId }
						: { userId: user.id }),
					trialPeriodDays,
					seats,
					customerId: customerId ?? undefined,
				});

				console.log("✅ [createCheckoutLink] Checkout link creado:", checkoutLink?.substring(0, 50) + "...");

				if (!checkoutLink) {
					console.error("❌ [createCheckoutLink] Checkout link es null/undefined");
					throw new ORPCError("INTERNAL_SERVER_ERROR");
				}

				return { checkoutLink };
			} catch (e) {
				console.error("❌ [createCheckoutLink] Error al crear checkout link:", e);
				logger.error(e);
				throw new ORPCError("INTERNAL_SERVER_ERROR");
			}
		},
	);
