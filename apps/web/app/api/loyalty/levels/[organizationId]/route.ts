import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// GET - Obtener niveles y stats
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ organizationId: string }> }
) {
  try {
    const { organizationId } = await params;

    // Obtener niveles
    const { data: levels, error: levelsError } = await supabase
      .from("loyalty_levels")
      .select("*")
      .eq("organization_id", organizationId)
      .order("level_number");

    if (levelsError && levelsError.code !== "PGRST116") {
      console.error("Error fetching levels:", levelsError);
    }

    // Obtener estadísticas
    const { count: totalClients } = await supabase
      .from("client_profiles")
      .select("*", { count: "exact", head: true })
      .eq("organization_id", organizationId);

    const { data: xpData } = await supabase
      .from("xp_history")
      .select("xp_amount")
      .eq("organization_id", organizationId);

    const totalXpGiven = xpData?.reduce((sum, x) => sum + x.xp_amount, 0) || 0;

    const { count: rewardsUsed } = await supabase
      .from("earned_rewards")
      .select("*", { count: "exact", head: true })
      .eq("organization_id", organizationId)
      .eq("status", "used");

    return NextResponse.json({
      levels: levels || [],
      stats: {
        totalClients: totalClients || 0,
        totalXpGiven,
        rewardsUsed: rewardsUsed || 0,
      },
    });

  } catch (error: any) {
    console.error("Error in loyalty levels GET:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Guardar niveles
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ organizationId: string }> }
) {
  try {
    const { organizationId } = await params;
    const body = await request.json();
    const { levels } = body;

    if (!levels || !Array.isArray(levels)) {
      return NextResponse.json({ error: "Niveles requeridos" }, { status: 400 });
    }

    // Eliminar niveles existentes
    await supabase
      .from("loyalty_levels")
      .delete()
      .eq("organization_id", organizationId);

    // Insertar nuevos niveles
    const levelsToInsert = levels.map((level: any) => ({
      organization_id: organizationId,
      level_number: level.level_number,
      name: level.name,
      min_xp: level.min_xp,
      color: level.color,
      icon: level.icon,
      reward_type: level.reward_type,
      reward_value: level.reward_value || null,
      reward_description: level.reward_description || null,
    }));

    const { error: insertError } = await supabase
      .from("loyalty_levels")
      .insert(levelsToInsert);

    if (insertError) {
      console.error("Error inserting levels:", insertError);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("Error in loyalty levels POST:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}



