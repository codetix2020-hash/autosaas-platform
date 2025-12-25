import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { auth } from "@repo/auth";
import { headers } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// GET - Listar estilos de la organización del usuario autenticado
export async function GET(request: NextRequest) {
  try {
    // Obtener sesión del usuario
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const organizationId = session.session?.activeOrganizationId;
    if (!organizationId) {
      return NextResponse.json({ error: "No hay organización activa" }, { status: 400 });
    }

    // Obtener todos los estilos (activos e inactivos) de la organización
    const { data: styles, error: stylesError } = await supabase
      .from("style_gallery")
      .select("*")
      .eq("organization_id", organizationId)
      .order("display_order", { ascending: true })
      .order("name", { ascending: true });

    if (stylesError) {
      console.error("Error fetching styles:", stylesError);
      return NextResponse.json({ error: "Error loading styles" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      styles: styles || [],
    });
  } catch (error: any) {
    console.error("Error in GET /api/styles:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Crear nuevo estilo
export async function POST(request: NextRequest) {
  try {
    // Obtener sesión del usuario
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const organizationId = session.session?.activeOrganizationId;
    if (!organizationId) {
      return NextResponse.json({ error: "No hay organización activa" }, { status: 400 });
    }

    const body = await request.json();
    const {
      name,
      category,
      description,
      duration_minutes,
      base_price,
      image_url,
      recommended_for,
      display_order,
    } = body;

    // Validar campos requeridos
    if (!name || !category || !image_url) {
      return NextResponse.json(
        { error: "Nombre, categoría e imagen son requeridos" },
        { status: 400 }
      );
    }

    // Obtener el máximo display_order para establecer el siguiente si no se proporciona
    let nextDisplayOrder = display_order;
    if (nextDisplayOrder === undefined || nextDisplayOrder === null) {
      const { data: lastStyle } = await supabase
        .from("style_gallery")
        .select("display_order")
        .eq("organization_id", organizationId)
        .order("display_order", { ascending: false })
        .limit(1)
        .single();

      nextDisplayOrder = (lastStyle?.display_order || 0) + 1;
    }

    // Crear el estilo
    const { data: newStyle, error: createError } = await supabase
      .from("style_gallery")
      .insert({
        organization_id: organizationId,
        name,
        category,
        description: description || null,
        duration_minutes: duration_minutes || null,
        base_price: base_price || null,
        image_url,
        recommended_for: recommended_for || [],
        is_active: true,
        display_order: nextDisplayOrder,
      })
      .select()
      .single();

    if (createError) {
      console.error("Error creating style:", createError);
      return NextResponse.json({ error: createError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      style: newStyle,
    }, { status: 201 });
  } catch (error: any) {
    console.error("Error in POST /api/styles:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

