/**
 * Script para actualizar el slug de Codetix a "codetix"
 * Ejecutar con: npx tsx scripts/update-codetix-slug.ts
 */

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import { resolve } from "path";

// Cargar variables de entorno
dotenv.config({ path: resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Faltan variables de entorno: NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateCodetixSlug() {
  const organizationId = "cmim6yzzg0005d8iwuvq8a45f";
  const newSlug = "codetix";

  try {
    console.log(`🔄 Actualizando slug de Codetix (${organizationId}) a "${newSlug}"...`);

    // Verificar si el slug ya existe para otra organización
    const { data: existingSlug, error: checkError } = await supabase
      .from("business_config")
      .select("organization_id, business_name")
      .eq("slug", newSlug)
      .neq("organization_id", organizationId)
      .single();

    if (existingSlug) {
      console.error(`❌ El slug "${newSlug}" ya está en uso por otra organización: ${existingSlug.business_name}`);
      process.exit(1);
    }

    if (checkError && checkError.code !== "PGRST116") {
      console.error("❌ Error verificando slug:", checkError);
      process.exit(1);
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
      console.error("   Detalles:", JSON.stringify(error, null, 2));
      process.exit(1);
    }

    if (!updated) {
      console.error("❌ No se encontró la organización con ese ID");
      process.exit(1);
    }

    console.log(`✅ Slug actualizado exitosamente!`);
    console.log(`   Organización: ${updated.business_name}`);
    console.log(`   Nuevo slug: ${updated.slug}`);
    console.log(`   URL pública: /reservas/${updated.slug}`);
  } catch (error: any) {
    console.error("❌ Error general:", error);
    process.exit(1);
  }
}

updateCodetixSlug();

