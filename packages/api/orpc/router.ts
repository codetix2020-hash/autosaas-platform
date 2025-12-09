import type { RouterClient } from "@orpc/server";
import { adminRouter } from "../modules/admin/router";
import { aiRouter } from "../modules/ai/router";
import { contactRouter } from "../modules/contact/router";
import { contentflowRouter } from "../modules/contentflow/router";
import { newsletterRouter } from "../modules/newsletter/router";
import { organizationsRouter } from "../modules/organizations/router";
import { paymentsRouter } from "../modules/payments/router";
import { usersRouter } from "../modules/users/router";
import { publicProcedure } from "./procedures";
import { invoiceflowRouter } from "../modules/invoiceflow/router";
import { taskflowRouter } from "../modules/taskflow/router";
import { reservasRouter } from "../modules/reservas/router";

export const router = publicProcedure.router({
	admin: adminRouter,
	newsletter: newsletterRouter,
	contact: contactRouter,
	organizations: organizationsRouter,
	users: usersRouter,
	payments: paymentsRouter,
	ai: aiRouter,
	contentflow: contentflowRouter,
	invoiceflow: invoiceflowRouter,
	taskflow: taskflowRouter,
	reservas: reservasRouter,
});

export type ApiRouterClient = RouterClient<typeof router>;
