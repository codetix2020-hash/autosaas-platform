import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Buscar configuración del negocio - primero por slug, luego por organization_id
    let businessConfig = null;
    let organizationId = slug;

    // Intentar buscar por slug
    const { data: configBySlug } = await supabase
      .from("business_config")
      .select("*")
      .eq("slug", slug)
      .single();

    if (configBySlug) {
      businessConfig = configBySlug;
      organizationId = configBySlug.organization_id;
    } else {
      // Si no encuentra por slug, buscar por organization_id
      const { data: configById } = await supabase
        .from("business_config")
        .select("*")
        .eq("organization_id", slug)
        .single();

      if (configById) {
        businessConfig = configById;
        organizationId = configById.organization_id;
      }
    }

    if (!businessConfig) {
      return NextResponse.json({ error: "Negocio no encontrado" }, { status: 404 });
    }

    // Obtener estilos activos de la organización
    const { data: styles, error: stylesError } = await supabase
      .from("style_gallery")
      .select("*")
      .eq("organization_id", organizationId)
      .eq("is_active", true)
      .order("display_order", { ascending: true })
      .order("name", { ascending: true });

    if (stylesError) {
      console.error("Error fetching styles:", stylesError);
      return NextResponse.json({ error: "Error loading styles" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      styles: styles || [],
      organizationId,
    });
  } catch (error: any) {
    console.error("Error in GET /api/public/styles/[slug]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


