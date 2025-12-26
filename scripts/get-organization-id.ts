/**
 * Script para obtener el organization_id
 * 
 * Este script muestra cómo obtener el organization_id desde:
 * 1. La base de datos (tabla services)
 * 2. Desde el slug de la organización
 */

import { createClient } from "@supabase/supabase-js";
import { getOrganizationBySlug } from "@repo/database";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function getOrganizationIdFromServices() {
  if (!supabaseUrl || !supabaseKey) {
    console.error("❌ Variables de entorno no configuradas");
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log("\n📊 Consultando organization_id desde la tabla services...\n");

  const { data: services, error } = await supabase
    .from("services")
    .select("organization_id")
    .limit(10);

  if (error) {
    console.error("❌ Error:", error.message);
    return;
  }

  if (!services || services.length === 0) {
    console.log("⚠️  No hay servicios en la base de datos");
    return;
  }

  // Obtener organization_ids únicos
  const uniqueOrgIds = [...new Set(services.map(s => s.organization_id))];

  console.log("✅ Organization IDs encontrados en services:");
  uniqueOrgIds.forEach((orgId, index) => {
    console.log(`   ${index + 1}. ${orgId}`);
  });

  return uniqueOrgIds[0];
}

async function getOrganizationIdFromSlug(slug: string) {
  console.log(`\n🔍 Buscando organización con slug: "${slug}"...\n`);

  try {
    const organization = await getOrganizationBySlug(slug);
    
    if (!organization) {
      console.log(`⚠️  No se encontró organización con slug: "${slug}"`);
      return null;
    }

    console.log("✅ Organización encontrada:");
    console.log(`   ID: ${organization.id}`);
    console.log(`   Nombre: ${organization.name}`);
    console.log(`   Slug: ${organization.slug}`);

    return organization.id;
  } catch (error: any) {
    console.error("❌ Error:", error.message);
    return null;
  }
}

async function main() {
  console.log("═══════════════════════════════════════════════════════");
  console.log("  OBTENER ORGANIZATION_ID");
  console.log("═══════════════════════════════════════════════════════\n");

  // Método 1: Desde services
  const orgIdFromServices = await getOrganizationIdFromServices();

  // Método 2: Desde slug (si tienes el slug de tu organización)
  // Descomenta y reemplaza con tu slug real:
  // const orgIdFromSlug = await getOrganizationIdFromSlug("tu-slug-aqui");

  console.log("\n═══════════════════════════════════════════════════════");
  console.log("\n💡 Para usar en la página pública:");
  if (orgIdFromServices) {
    console.log(`   URL: /reservas/${orgIdFromServices}`);
  }
  console.log("\n═══════════════════════════════════════════════════════\n");
}

main().catch(console.error);



