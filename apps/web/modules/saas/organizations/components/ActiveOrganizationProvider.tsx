"use client";

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

	console.log("🎯 [ActiveOrgProvider] Componente renderizado", {
		activeOrganizationSlug,
		sessionActiveOrgId: session?.session?.activeOrganizationId,
		userId: user?.id,
	});

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
		console.log("🔄 [ActiveOrgProvider] syncActiveOrganization llamada con slug:", organizationSlug);
		
		if (!organizationSlug) {
			console.log("⚠️ [ActiveOrgProvider] No hay slug, abortando sync");
			return;
		}

		try {
			console.log("📡 [ActiveOrgProvider] Llamando a authClient.organization.setActive...");
			const { data: newActiveOrganization } =
				await authClient.organization.setActive({
					organizationSlug,
				});

			if (!newActiveOrganization) {
				console.log("❌ [ActiveOrgProvider] No se obtuvo nueva organización de setActive");
				return;
			}

			console.log("✅ [ActiveOrgProvider] Nueva organización activa:", {
				id: newActiveOrganization.id,
				slug: newActiveOrganization.slug,
				name: newActiveOrganization.name,
			});

			// Actualizar el query cache de la sesión sin hacer redirect
			console.log("💾 [ActiveOrgProvider] Actualizando query cache de sesión...");
			await queryClient.setQueryData(sessionQueryKey, (data: any) => {
				return {
					...data,
					session: {
						...data?.session,
						activeOrganizationId: newActiveOrganization.id,
					},
				};
			});

			console.log("🔄 [ActiveOrgProvider] Refetching active organization...");
			await refetchActiveOrganization();
			console.log("✅ [ActiveOrgProvider] Sincronización completada exitosamente");

			// Invalidar todas las queries que dependen del organizationId
			console.log("🔄 [ActiveOrgProvider] Invalidando queries dependientes de organización...");
			await queryClient.invalidateQueries({ queryKey: ["reservas", "bookings"] });
			await queryClient.invalidateQueries({ queryKey: ["reservas", "services"] });
			await queryClient.invalidateQueries({ queryKey: ["reservas", "professionals"] });
			await queryClient.invalidateQueries({ queryKey: ["reservas", "clients"] });
			await queryClient.invalidateQueries({ queryKey: ["reservas", "working_hours"] });
			console.log("✅ [ActiveOrgProvider] Queries invalidadas");
		} catch (error) {
			console.error("❌ [ActiveOrgProvider] Error syncing active organization:", error);
		}
	};

	const [loaded, setLoaded] = useState(activeOrganization !== undefined);
	const syncingRef = useRef(false);

	// Sincronizar la organización activa cuando cambia el slug de la URL
	useEffect(() => {
		console.log("🔍 [ActiveOrgProvider] useEffect de sincronización ejecutado", {
			activeOrganizationSlug,
			sessionActiveOrgId: session?.session?.activeOrganizationId,
			activeOrgId: activeOrganization?.id,
			activeOrgName: activeOrganization?.name,
			isSyncing: syncingRef.current,
		});

		if (!activeOrganizationSlug) {
			console.log("⚠️ [ActiveOrgProvider] No hay slug, abortando");
			return;
		}

		if (!activeOrganization) {
			console.log("⚠️ [ActiveOrgProvider] No hay activeOrganization cargada aún");
			return;
		}

		// Sincronizar si:
		// 1. No hay organización activa en la sesión (undefined)
		// 2. O la organización activa en la sesión no coincide con la de la URL
		const needsSync = !session?.session?.activeOrganizationId || 
		                  session.session.activeOrganizationId !== activeOrganization.id;

		if (needsSync && !syncingRef.current) {
			console.log("🚨 [ActiveOrgProvider] NECESITA SINCRONIZACIÓN", {
				sessionActiveOrgId: session?.session?.activeOrganizationId,
				activeOrgId: activeOrganization.id,
			});
			
			syncingRef.current = true;
			syncActiveOrganization(activeOrganizationSlug).finally(() => {
				syncingRef.current = false;
				console.log("🏁 [ActiveOrgProvider] Sincronización finalizada, syncingRef reset");
			});
		} else if (!needsSync) {
			console.log("✅ [ActiveOrgProvider] Ya está sincronizado correctamente");
		}
	}, [
		activeOrganizationSlug,
		activeOrganization?.id,
		session?.session?.activeOrganizationId,
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
