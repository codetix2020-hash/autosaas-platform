import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { auth } from "@repo/auth";
import { headers } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// PUT - Actualizar estilo
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const body = await request.json();

    // Verificar que el estilo pertenezca a la organización del usuario
    const { data: existingStyle, error: fetchError } = await supabase
      .from("style_gallery")
      .select("id, organization_id")
      .eq("id", id)
      .single();

    if (fetchError || !existingStyle) {
      return NextResponse.json({ error: "Estilo no encontrado" }, { status: 404 });
    }

    if (existingStyle.organization_id !== organizationId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    // Preparar campos para actualizar (solo incluir los que se proporcionan)
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (body.name !== undefined) updateData.name = body.name;
    if (body.category !== undefined) updateData.category = body.category;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.duration_minutes !== undefined) updateData.duration_minutes = body.duration_minutes;
    if (body.base_price !== undefined) updateData.base_price = body.base_price;
    if (body.image_url !== undefined) updateData.image_url = body.image_url;
    if (body.recommended_for !== undefined) updateData.recommended_for = body.recommended_for;
    if (body.is_active !== undefined) updateData.is_active = body.is_active;
    if (body.display_order !== undefined) updateData.display_order = body.display_order;

    // Actualizar el estilo
    const { data: updatedStyle, error: updateError } = await supabase
      .from("style_gallery")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating style:", updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      style: updatedStyle,
    });
  } catch (error: any) {
    console.error("Error in PUT /api/styles/[id]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Eliminar estilo (soft delete - is_active = false)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    // Verificar que el estilo pertenezca a la organización del usuario
    const { data: existingStyle, error: fetchError } = await supabase
      .from("style_gallery")
      .select("id, organization_id")
      .eq("id", id)
      .single();

    if (fetchError || !existingStyle) {
      return NextResponse.json({ error: "Estilo no encontrado" }, { status: 404 });
    }

    if (existingStyle.organization_id !== organizationId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    // Soft delete: marcar como inactivo
    const { error: deleteError } = await supabase
      .from("style_gallery")
      .update({
        is_active: false,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (deleteError) {
      console.error("Error deleting style:", deleteError);
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Estilo eliminado correctamente",
    });
  } catch (error: any) {
    console.error("Error in DELETE /api/styles/[id]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


