import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendBookingReminderEmail } from "../../../../lib/email/booking-emails";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: NextRequest) {
  try {
    // Verificar API key secreta para proteger el endpoint
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      console.error("❌ CRON_SECRET no está configurada en las variables de entorno");
      return NextResponse.json(
        { error: "Cron secret not configured" },
        { status: 500 }
      );
    }

    // Verificar que el token sea válido (Bearer token o header personalizado)
    const providedSecret = authHeader?.replace("Bearer ", "") || 
                          request.headers.get("x-cron-secret") ||
                          request.nextUrl.searchParams.get("secret");

    if (providedSecret !== cronSecret) {
      console.error("❌ Intento de acceso no autorizado al endpoint de recordatorios");
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    console.log("🔔 Iniciando proceso de recordatorios de citas...");

    // Calcular el rango de fechas: próximas 24-25 horas
    const now = new Date();
    const tomorrowStart = new Date(now);
    tomorrowStart.setDate(tomorrowStart.getDate() + 1);
    tomorrowStart.setHours(0, 0, 0, 0);

    const tomorrowEnd = new Date(tomorrowStart);
    tomorrowEnd.setDate(tomorrowEnd.getDate() + 1);
    tomorrowEnd.setHours(23, 59, 59, 999);

    // Convertir a formato YYYY-MM-DD para la consulta
    const dateStart = tomorrowStart.toISOString().split('T')[0];
    const dateEnd = tomorrowEnd.toISOString().split('T')[0];

    console.log(`📅 Buscando reservas entre ${dateStart} y ${dateEnd}`);

    // Buscar todas las reservas en las próximas 24-25 horas
    // Que no hayan recibido recordatorio aún (reminder_sent IS NULL o false)
    // Y que estén confirmadas o pendientes (no canceladas)
    const { data: bookings, error: bookingsError } = await supabase
      .from("bookings")
      .select(`
        id,
        organization_id,
        client_name,
        client_email,
        date,
        start_time,
        end_time,
        price,
        status,
        service_id,
        professional_id
      `)
      .gte("date", dateStart)
      .lte("date", dateEnd)
      .in("status", ["pending", "confirmed"])
      .or("reminder_sent.is.null,reminder_sent.eq.false");

    if (bookingsError) {
      console.error("❌ Error al buscar reservas:", bookingsError);
      return NextResponse.json(
        { error: "Error al buscar reservas", details: bookingsError.message },
        { status: 500 }
      );
    }

    if (!bookings || bookings.length === 0) {
      console.log("✅ No hay reservas que necesiten recordatorio");
      return NextResponse.json({
        success: true,
        message: "No bookings found",
        sent: 0,
      });
    }

    console.log(`📧 Encontradas ${bookings.length} reservas para enviar recordatorio`);

    let sentCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    // Procesar cada reserva
    for (const booking of bookings) {
      try {
        // Obtener información del negocio
        const { data: businessConfig, error: configError } = await supabase
          .from("business_config")
          .select("*")
          .eq("organization_id", booking.organization_id)
          .single();

        if (configError || !businessConfig) {
          console.error(`⚠️ No se encontró business_config para organization_id: ${booking.organization_id}`);
          errorCount++;
          errors.push(`Booking ${booking.id}: Business config not found`);
          continue;
        }

        // Verificar que tenga email del cliente
        if (!booking.client_email) {
          console.warn(`⚠️ Reserva ${booking.id} no tiene email del cliente`);
          errorCount++;
          errors.push(`Booking ${booking.id}: No client email`);
          continue;
        }

        // Obtener información del servicio
        let serviceName = "Servicio no especificado";
        if (booking.service_id) {
          const { data: service } = await supabase
            .from("services")
            .select("name")
            .eq("id", booking.service_id)
            .single();
          if (service) {
            serviceName = service.name;
          }
        }

        // Obtener información del profesional
        let professionalName: string | null = null;
        if (booking.professional_id) {
          const { data: professional } = await supabase
            .from("professionals")
            .select("name")
            .eq("id", booking.professional_id)
            .single();
          if (professional) {
            professionalName = professional.name;
          }
        }

        // Enviar email de recordatorio
        const emailResult = await sendBookingReminderEmail({
          clientName: booking.client_name,
          clientEmail: booking.client_email,
          serviceName,
          professionalName,
          date: booking.date,
          time: booking.start_time,
          price: booking.price || 0,
          businessName: businessConfig.business_name || "Negocio",
          businessPhone: businessConfig.phone || undefined,
          businessAddress: businessConfig.address ? `${businessConfig.address}${businessConfig.city ? `, ${businessConfig.city}` : ''}` : undefined,
        });

        if (emailResult.success) {
          // Marcar como recordatorio enviado
          const { error: updateError } = await supabase
            .from("bookings")
            .update({ reminder_sent: true })
            .eq("id", booking.id);

          if (updateError) {
            console.error(`❌ Error al marcar recordatorio enviado para booking ${booking.id}:`, updateError);
            // No incrementamos errorCount aquí porque el email sí se envió
          } else {
            console.log(`✅ Recordatorio enviado y marcado para booking ${booking.id}`);
            sentCount++;
          }
        } else {
          console.error(`❌ Error al enviar email para booking ${booking.id}:`, emailResult.error);
          errorCount++;
          errors.push(`Booking ${booking.id}: Email send failed`);
        }
      } catch (error: any) {
        console.error(`❌ Error procesando booking ${booking.id}:`, error);
        errorCount++;
        errors.push(`Booking ${booking.id}: ${error.message}`);
      }
    }

    console.log(`✅ Proceso completado: ${sentCount} enviados, ${errorCount} errores`);

    return NextResponse.json({
      success: true,
      message: `Processed ${bookings.length} bookings`,
      sent: sentCount,
      errors: errorCount,
      errorDetails: errors.length > 0 ? errors : undefined,
    });
  } catch (error: any) {
    console.error("❌ Error en el endpoint de recordatorios:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error.message,
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return POST(request);
}

