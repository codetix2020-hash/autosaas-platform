import { createCheckoutLink } from "./procedures/checkout-link";
import { createCustomerPortalLink } from "./procedures/create-customer-portal-link";
import { listPurchases } from "./procedures/list-purchases";

export const paymentsRouter = {
	createCheckoutLink,
	createCustomerPortalLink,
	listPurchases,
};
