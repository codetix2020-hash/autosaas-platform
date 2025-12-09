import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json();
    
    const {
      service_id,
      professional_id,
      client_name,
      client_email,
      client_phone,
      date,
      start_time,
      notes,
    } = body;

    // Validar campos requeridos
    if (!service_id || !client_name || !client_email || !client_phone || !date || !start_time) {
      return NextResponse.json(
        { error: "Faltan campos requeridos" },
        { status: 400 }
      );
    }

    const organizationId = slug;

    // Obtener duración del servicio para calcular end_time
    const { data: service, error: serviceError } = await supabase
      .from("services")
      .select("duration, price")
      .eq("id", service_id)
      .single();

    if (serviceError || !service) {
      return NextResponse.json({ error: "Servicio no encontrado" }, { status: 404 });
    }

    // Calcular hora de fin
    const [hours, minutes] = start_time.split(":").map(Number);
    const startDate = new Date();
    startDate.setHours(hours, minutes, 0, 0);
    const endDate = new Date(startDate.getTime() + service.duration * 60000);
    const end_time = `${String(endDate.getHours()).padStart(2, "0")}:${String(endDate.getMinutes()).padStart(2, "0")}`;

    // Verificar disponibilidad (no hay otra reserva en ese horario)
    const { data: existingBookings, error: checkError } = await supabase
      .from("bookings")
      .select("id")
      .eq("organization_id", organizationId)
      .eq("date", date)
      .eq("professional_id", professional_id)
      .neq("status", "cancelled")
      .or(`and(start_time.lte.${start_time},end_time.gt.${start_time}),and(start_time.lt.${end_time},end_time.gte.${end_time})`);

    if (existingBookings && existingBookings.length > 0) {
      return NextResponse.json(
        { error: "Este horario ya no está disponible" },
        { status: 409 }
      );
    }

    // Buscar o crear cliente
    let client_id = null;
    const { data: existingClient } = await supabase
      .from("clients")
      .select("id")
      .eq("organization_id", organizationId)
      .eq("email", client_email)
      .single();

    if (existingClient) {
      client_id = existingClient.id;
      // Actualizar último contacto
      await supabase
        .from("clients")
        .update({ 
          last_visit: new Date().toISOString(),
        })
        .eq("id", client_id);
    } else {
      // Crear nuevo cliente
      const { data: newClient, error: clientError } = await supabase
        .from("clients")
        .insert({
          organization_id: organizationId,
          name: client_name,
          email: client_email,
          phone: client_phone,
          total_visits: 1,
          last_visit: new Date().toISOString(),
        })
        .select("id")
        .single();

      if (newClient) {
        client_id = newClient.id;
      }
    }

    // Crear la reserva
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .insert({
        organization_id: organizationId,
        client_id,
        professional_id: professional_id || null,
        service_id,
        client_name,
        client_email,
        client_phone,
        date,
        start_time,
        end_time,
        status: "pending",
        notes: notes || null,
        price: service.price,
      })
      .select()
      .single();

    if (bookingError) {
      console.error("Error creating booking:", bookingError);
      return NextResponse.json({ error: "Error al crear la reserva" }, { status: 500 });
    }

    // TODO: Enviar email de confirmación

    return NextResponse.json({
      success: true,
      booking: {
        id: booking.id,
        date: booking.date,
        start_time: booking.start_time,
        end_time: booking.end_time,
        status: booking.status,
      },
      message: "Reserva creada exitosamente",
    });

  } catch (error: any) {
    console.error("Error creating booking:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

