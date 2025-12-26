"use client";
// Force rebuild - Dec 26 2025

import { authClient } from "@repo/auth/client";
import { isOrganizationAdmin } from "@repo/auth/lib/helper";
import { config } from "@repo/config";
import { useSession } from "@saas/auth/hooks/use-session";
import { sessionQueryKey } from "@saas/auth/lib/api";
import {
	activeOrganizationQueryKey,
	useActiveOrganizationQuery,
} from "@saas/organizations/lib/api";
import { useRouter } from "@shared/hooks/router";
import { orpc } from "@shared/lib/orpc-query-utils";
import { useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import nProgress from "nprogress";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { ActiveOrganizationContext } from "../lib/active-organization-context";

export function ActiveOrganizationProvider({
	children,
}: {
	children: ReactNode;
}) {
	const router = useRouter();
	const queryClient = useQueryClient();
	const { session, user } = useSession();
	const params = useParams();

	const activeOrganizationSlug = params.organizationSlug as string;

	const { data: activeOrganization } = useActiveOrganizationQuery(
		activeOrganizationSlug,
		{
			enabled: !!activeOrganizationSlug,
		},
	);

	const refetchActiveOrganization = async () => {
		await queryClient.refetchQueries({
			queryKey: activeOrganizationQueryKey(activeOrganizationSlug),
		});
	};

	const setActiveOrganization = async (organizationSlug: string | null) => {
		nProgress.start();
		const { data: newActiveOrganization } =
			await authClient.organization.setActive(
				organizationSlug
					? {
							organizationSlug,
						}
					: {
							organizationId: null,
						},
			);

		if (!newActiveOrganization) {
			nProgress.done();
			return;
		}

		await refetchActiveOrganization();

		if (config.organizations.enableBilling) {
			await queryClient.prefetchQuery(
				orpc.payments.listPurchases.queryOptions({
					input: {
						organizationId: newActiveOrganization.id,
					},
				}),
			);
		}

		await queryClient.setQueryData(sessionQueryKey, (data: any) => {
			return {
				...data,
				session: {
					...data?.session,
					activeOrganizationId: newActiveOrganization.id,
				},
			};
		});

		router.push(`/app/${newActiveOrganization.slug}`);
	};

	// Función interna para sincronizar la sesión sin hacer redirect
	const syncActiveOrganization = async (organizationSlug: string | null) => {
		if (!organizationSlug) {
			return;
		}

		try {
			const { data: newActiveOrganization } =
				await authClient.organization.setActive({
					organizationSlug,
				});

			if (!newActiveOrganization) {
				return;
			}

			// Actualizar el query cache de la sesión sin hacer redirect
			await queryClient.setQueryData(sessionQueryKey, (data: any) => {
				return {
					...data,
					session: {
						...data?.session,
						activeOrganizationId: newActiveOrganization.id,
					},
				};
			});

			await refetchActiveOrganization();

			// Invalidar todas las queries que dependen del organizationId
			await queryClient.invalidateQueries({ queryKey: ["reservas", "bookings"] });
			await queryClient.invalidateQueries({ queryKey: ["reservas", "services"] });
			await queryClient.invalidateQueries({ queryKey: ["reservas", "professionals"] });
			await queryClient.invalidateQueries({ queryKey: ["reservas", "clients"] });
			await queryClient.invalidateQueries({ queryKey: ["reservas", "working_hours"] });
		} catch (error) {
			console.error("Error syncing active organization:", error);
		}
	};

	const [loaded, setLoaded] = useState(activeOrganization !== undefined);
	const syncingRef = useRef(false);

	// Sincronizar la organización activa cuando cambia el slug de la URL
	useEffect(() => {
		if (!activeOrganizationSlug) {
			return;
		}

		if (!activeOrganization) {
			return;
		}

		// Sincronizar si:
		// 1. No hay organización activa en la sesión (undefined)
		// 2. O la organización activa en la sesión no coincide con la de la URL
		const needsSync = !session?.activeOrganizationId || 
		                  session.activeOrganizationId !== activeOrganization.id;

		if (needsSync && !syncingRef.current) {
			syncingRef.current = true;
			syncActiveOrganization(activeOrganizationSlug).finally(() => {
				syncingRef.current = false;
			});
		}
	}, [
		activeOrganizationSlug,
		activeOrganization?.id,
		session?.activeOrganizationId,
	]);

	useEffect(() => {
		if (!loaded && activeOrganization !== undefined) {
			setLoaded(true);
		}
	}, [activeOrganization]);

	const activeOrganizationUserRole = activeOrganization?.members.find(
		(member) => member.userId === session?.userId,
	)?.role;

	return (
		<ActiveOrganizationContext.Provider
			value={{
				loaded,
				activeOrganization: activeOrganization ?? null,
				activeOrganizationUserRole: activeOrganizationUserRole ?? null,
				isOrganizationAdmin:
					!!activeOrganization &&
					!!user &&
					isOrganizationAdmin(activeOrganization, user),
				setActiveOrganization,
				refetchActiveOrganization,
			}}
		>
			{children}
		</ActiveOrganizationContext.Provider>
	);
}
