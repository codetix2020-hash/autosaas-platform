import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Endpoint para actualizar el slug de Codetix
export async function POST(request: NextRequest) {
  try {
    const organizationId = "cmim6yzzg0005d8iwuvq8a45f";
    const newSlug = "codetix";

    console.log(`🔄 Actualizando slug de Codetix (${organizationId}) a "${newSlug}"...`);

    // Verificar si el slug ya existe para otra organización
    const { data: existingSlug } = await supabase
      .from("business_config")
      .select("organization_id, business_name")
      .eq("slug", newSlug)
      .neq("organization_id", organizationId)
      .single();

    if (existingSlug) {
      return NextResponse.json(
        { error: `El slug "${newSlug}" ya está en uso por otra organización: ${existingSlug.business_name}` },
        { status: 400 }
      );
    }

    // Actualizar el slug
    const { data: updated, error } = await supabase
      .from("business_config")
      .update({ slug: newSlug })
      .eq("organization_id", organizationId)
      .select()
      .single();

    if (error) {
      console.error("❌ Error actualizando slug:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!updated) {
      return NextResponse.json(
        { error: "No se encontró la organización con ese ID" },
        { status: 404 }
      );
    }

    console.log(`✅ Slug actualizado exitosamente. Organización: ${updated.business_name}, Nuevo slug: ${updated.slug}`);

    return NextResponse.json({
      success: true,
      message: `Slug actualizado a "${newSlug}"`,
      organization: {
        id: updated.organization_id,
        name: updated.business_name,
        slug: updated.slug,
      },
    });
  } catch (error: any) {
    console.error("❌ Error general:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

