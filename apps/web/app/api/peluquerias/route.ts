import { NextRequest, NextResponse } from "next/server";

import { createClient } from "@supabase/supabase-js";

import { auth } from "@repo/auth";

import { db } from "@repo/database";

import { headers } from "next/headers";



const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;

const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);



// GET - Listar todas las peluquerías del usuario actual

export async function GET() {

  try {

    // Obtener sesión del usuario

    const session = await auth.api.getSession({

      headers: await headers(),

    });



    if (!session?.user) {

      return NextResponse.json({ error: "No autenticado" }, { status: 401 });

    }



    // Obtener organizaciones del usuario

    const organizations = await auth.api.listOrganizations({

      headers: await headers(),

    });



    if (!organizations || organizations.length === 0) {

      return NextResponse.json({ peluquerias: [] });

    }



    // Obtener business_config para cada organización

    const orgIds = organizations.map((org: any) => org.id);

    

    const { data: configs, error } = await supabase

      .from("business_config")

      .select("*")

      .in("organization_id", orgIds);



    if (error) {

      console.error("Error fetching business configs:", error);

    }



    // Combinar datos

    const peluquerias = organizations.map((org: any) => {

      const config = configs?.find((c: any) => c.organization_id === org.id);

      return {

        id: org.id,

        name: config?.business_name || org.name,

        slug: org.slug || config?.slug,

        logo: config?.logo_url || org.logo,

        createdAt: org.createdAt,

      };

    });



    return NextResponse.json({ peluquerias });

  } catch (error: any) {

    console.error("Error in peluquerias API:", error);

    return NextResponse.json({ error: error.message }, { status: 500 });

  }

}



// POST - Crear nueva peluquería

export async function POST(request: NextRequest) {

  try {

    const { name, slug } = await request.json();

    console.log("📍 Creando peluquería:", { name, slug });



    if (!name || !slug) {

      return NextResponse.json(

        { error: "Nombre y slug son requeridos" },

        { status: 400 }

      );

    }



    // Verificar sesión

    const session = await auth.api.getSession({

      headers: await headers(),

    });



    if (!session?.user) {

      return NextResponse.json(

        { error: "Debes iniciar sesión para crear una peluquería" },

        { status: 401 }

      );

    }



    console.log("👤 Usuario:", session.user.email, "ID:", session.user.id);



    // Verificar que el slug no exista

    const existingOrg = await db.organization.findUnique({

      where: { slug: slug },

    });



    if (existingOrg) {

      return NextResponse.json(

        { error: "Este slug ya está en uso. Elige otro." },

        { status: 400 }

      );

    }



    // Crear organización directamente con Prisma

    console.log("🏢 Creando organización con Prisma...");

    

    const newOrg = await db.organization.create({

      data: {

        name: name,

        slug: slug,

        createdAt: new Date(),

      },

    });



    const orgId = newOrg.id;

    console.log("✅ Organización creada:", orgId);



    // Agregar al usuario como owner de la organización

    console.log("👥 Agregando usuario como owner...");

    await db.member.create({

      data: {

        organizationId: orgId,

        userId: session.user.id,

        role: "owner",

        createdAt: new Date(),

      },

    });



    // Crear business_config

    console.log("💾 Creando business_config...");

    const { data: newConfig, error: configError } = await supabase

      .from("business_config")

      .insert({

        organization_id: orgId,

        business_name: name,

        slug: slug,

        primary_color: "#D4AF37",

        secondary_color: "#1a1a1a",

      })

      .select()

      .single();



    if (configError) {

      console.error("❌ Error creating business_config:", configError);

      // Si falla, eliminar la organización creada

      await db.organization.delete({ where: { id: orgId } });

      return NextResponse.json({ error: configError.message }, { status: 500 });

    }



    console.log("✅ business_config creado");



    // Crear niveles de fidelización por defecto

    console.log("🏆 Creando niveles de fidelización...");

    const defaultLevels = [

      { level_number: 1, name: "Bronce", min_xp: 0, color: "#CD7F32", icon: "🥉", reward_type: "none" },

      { level_number: 2, name: "Plata", min_xp: 500, color: "#C0C0C0", icon: "🥈", reward_type: "discount_percent", reward_value: 10, reward_description: "10% de descuento" },

      { level_number: 3, name: "Oro", min_xp: 1500, color: "#FFD700", icon: "🥇", reward_type: "discount_percent", reward_value: 15, reward_description: "15% de descuento" },

      { level_number: 4, name: "Platino", min_xp: 3000, color: "#E5E4E2", icon: "💎", reward_type: "free_service", reward_description: "Corte gratis" },

      { level_number: 5, name: "VIP", min_xp: 5000, color: "#FFD700", icon: "👑", reward_type: "gift", reward_description: "Tratamiento completo gratis" },

    ];



    await supabase.from("loyalty_levels").insert(

      defaultLevels.map((level) => ({

        ...level,

        organization_id: orgId,

      }))

    );



    // Crear servicio por defecto

    console.log("💇 Creando servicio por defecto...");

    await supabase.from("services").insert({

      organization_id: orgId,

      name: "Corte de cabello",

      description: "Corte clásico o moderno",

      duration: 30,

      price: 15,

      color: "#D4AF37",

      xp_value: 100,

      is_active: true,

    });



    console.log("✅ Peluquería creada exitosamente");



    return NextResponse.json({

      success: true,

      peluqueria: {

        id: orgId,

        name,

        slug,

      },

    });

  } catch (error: any) {

    console.error("❌ Error general:", error);

    return NextResponse.json({ error: error.message }, { status: 500 });

  }

}
