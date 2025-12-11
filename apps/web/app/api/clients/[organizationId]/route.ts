import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ organizationId: string }> }
) {
  try {
    const { organizationId } = await params;

    // Obtener todos los clientes de esta organización
    const { data: clients, error } = await supabase
      .from("client_profiles")
      .select("*")
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching clients:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Calcular estadísticas
    const stats = {
      total: clients?.length || 0,
      totalXp: clients?.reduce((sum, c) => sum + (c.total_xp || 0), 0) || 0,
      avgVisits: clients?.length 
        ? clients.reduce((sum, c) => sum + (c.total_visits || 0), 0) / clients.length 
        : 0,
    };

    return NextResponse.json({ clients: clients || [], stats });
  } catch (error: any) {
    console.error("Error in clients API:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

