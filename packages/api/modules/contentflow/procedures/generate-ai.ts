import { ORPCError } from "@orpc/client";
import { generateText, textModel } from "@repo/ai";
import { createClient } from "@supabase/supabase-js";
import z from "zod";
import { protectedProcedure } from "../../../orpc/procedures";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
	throw new Error("Supabase environment variables are not configured");
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Helper function to build context section for prompts
function buildContextSection(context: PromptContext): string {
	let contextText = `
INFORMACIÓN DEL NEGOCIO:
- Nombre: ${context.businessName}
${context.businessDescription ? `- Descripción: ${context.businessDescription}` : ''}
${context.services ? `- Servicios/Productos: ${context.services}` : ''}
${context.location ? `- Ubicación: ${context.location}` : ''}
${context.priceRange ? `- Rango de precios: ${context.priceRange}` : ''}
${context.schedule ? `- Horarios: ${context.schedule}` : ''}

AUDIENCIA TARGET:
${context.targetAge ? `- Edad: ${context.targetAge}` : ''}
${context.targetGender ? `- Género: ${context.targetGender}` : ''}
${context.targetInterests ? `- Intereses: ${context.targetInterests}` : ''}

ESTILO DE CONTENIDO:
- Tono de voz: ${context.tone}
${context.contentGoals ? `- Objetivos: ${context.contentGoals}` : ''}
${context.hashtags ? `- Hashtags preferidos: ${context.hashtags}` : ''}
${context.topicsToAvoid ? `- ⚠️ TEMAS A EVITAR: ${context.topicsToAvoid}` : ''}
`.trim();
	return contextText;
}

// Helper function for platform-specific instructions
function getPlatformSpecificInstructions(platform: string): string {
	const instructions: Record<string, string> = {
		instagram: `
REQUISITOS INSTAGRAM:
- Máximo 2200 caracteres
- Usa emojis relevantes (2-4) que reflejen el negocio
- Primera línea debe ser un HOOK potente
- Incluye los hashtags preferidos del brief al final
- Call-to-action claro
- Formato con saltos de línea para legibilidad`,
		
		twitter: `
REQUISITOS TWITTER/X:
- Máximo 280 caracteres
- Sé conciso e impactante
- Usa 1-2 hashtags del brief (máximo)
- Puede incluir pregunta o dato interesante
- Genera engagement`,
		
		facebook: `
REQUISITOS FACEBOOK:
- Puede ser más largo y conversacional (2-3 párrafos)
- Tono personal y cercano
- Incluye pregunta para generar comentarios
- Usa emojis moderadamente (1-3)
- Call-to-action natural
- Formato amigable`,
		
		linkedin: `
REQUISITOS LINKEDIN:
- Tono profesional pero accesible
- Enfocado en valor y expertise del negocio
- Puede incluir estadísticas o insights de la industria
- Formato: párrafo intro + 2-3 bullets con aprendizajes
- CTA profesional
- Hashtags profesionales (3-5)
- Evita emojis excesivos`,
		
		tiktok: `
REQUISITOS TIKTOK:
- Hook POTENTE en las primeras palabras (crucial)
- Lenguaje casual y energético
- Usa trends y lenguaje actual
- Emojis y energía alta
- CTA para like/comentar/compartir
- Hashtags trending (5-8)
- Formato: [HOOK] + [CONTENIDO] + [CTA]`,
		
		blog: `
REQUISITOS BLOG:
- Título atractivo y SEO-friendly
- Introducción de 2-3 párrafos (150-200 palabras)
- Primer párrafo: hook con problema/pregunta
- Segundo párrafo: contexto y relevancia
- Tercer párrafo: qué aprenderá el lector
- Tono informativo pero accesible`,
	};
	return instructions[platform] || '';
}

// Platform-specific prompt templates
const platformPrompts = {
	instagram: (context: PromptContext) => `
Eres un experto en marketing digital y redes sociales, especializado en Instagram.

${buildContextSection(context)}

PLATAFORMA: Instagram

${getPlatformSpecificInstructions('instagram')}

INSTRUCCIONES:
1. USA el tono de voz indicado (${context.tone})
2. Crea contenido relevante para la audiencia target descrita
3. Promociona los servicios/productos del negocio de forma natural
4. Incluye los hashtags preferidos del brief si son apropiados
5. EVITA absolutamente los temas mencionados en "temas a evitar"
6. Sé auténtico y específico para este negocio

Genera SOLO el contenido del post de Instagram, sin explicaciones adicionales.
Idioma: ${context.language}`,

	twitter: (context: PromptContext) => `
Eres un experto en marketing digital y redes sociales, especializado en Twitter/X.

${buildContextSection(context)}

PLATAFORMA: Twitter/X

${getPlatformSpecificInstructions('twitter')}

INSTRUCCIONES:
1. USA el tono de voz indicado (${context.tone})
2. Sé conciso pero impactante
3. Captura la esencia del negocio en pocas palabras
4. EVITA absolutamente los temas mencionados en "temas a evitar"
5. Genera engagement con la audiencia target

Genera SOLO el contenido del tweet, sin explicaciones adicionales.
Idioma: ${context.language}`,

	facebook: (context: PromptContext) => `
Eres un experto en marketing digital y redes sociales, especializado en Facebook.

${buildContextSection(context)}

PLATAFORMA: Facebook

${getPlatformSpecificInstructions('facebook')}

INSTRUCCIONES:
1. USA el tono de voz indicado (${context.tone})
2. Crea contenido conversacional y cercano
3. Conecta con la audiencia target de forma personal
4. Promociona los servicios del negocio de manera natural
5. EVITA absolutamente los temas mencionados en "temas a evitar"
6. Incluye pregunta para generar interacción

Genera SOLO el contenido del post de Facebook, sin explicaciones adicionales.
Idioma: ${context.language}`,

	linkedin: (context: PromptContext) => `
Eres un experto en marketing digital y redes sociales, especializado en LinkedIn.

${buildContextSection(context)}

PLATAFORMA: LinkedIn

${getPlatformSpecificInstructions('linkedin')}

INSTRUCCIONES:
1. USA el tono de voz indicado (${context.tone}) pero mantén profesionalismo
2. Enfócate en el valor y expertise del negocio
3. Proporciona insights relevantes para la industria
4. Conecta con profesionales de la audiencia target
5. EVITA absolutamente los temas mencionados en "temas a evitar"
6. Posiciona al negocio como autoridad

Genera SOLO el contenido del post de LinkedIn, sin explicaciones adicionales.
Idioma: ${context.language}`,

	tiktok: (context: PromptContext) => `
Eres un experto en marketing digital y redes sociales, especializado en TikTok.

${buildContextSection(context)}

PLATAFORMA: TikTok

${getPlatformSpecificInstructions('tiktok')}

INSTRUCCIONES:
1. HOOK POTENTE en las primeras 3 palabras (crucial para TikTok)
2. USA el tono de voz indicado (${context.tone}) pero adaptado a TikTok
3. Lenguaje casual, energético y auténtico
4. Conecta con la audiencia target de forma directa
5. EVITA absolutamente los temas mencionados en "temas a evitar"
6. Genera urgencia para interactuar

Genera SOLO el script/caption para TikTok, sin explicaciones adicionales.
Idioma: ${context.language}`,

	blog: (context: PromptContext) => `
Eres un experto en content marketing y blogging.

${buildContextSection(context)}

PLATAFORMA: Blog

${getPlatformSpecificInstructions('blog')}

INSTRUCCIONES:
1. USA el tono de voz indicado (${context.tone})
2. Crea contenido valioso para la audiencia target
3. Incorpora los servicios del negocio de forma natural
4. Posiciona al negocio como experto
5. EVITA absolutamente los temas mencionados en "temas a evitar"
6. Optimiza para SEO con keywords relevantes

Formato de salida:
# [TÍTULO DEL ARTÍCULO]

[Introducción: 2-3 párrafos]

Genera SOLO el título e introducción, sin explicaciones adicionales.
Idioma: ${context.language}`,
};

interface PromptContext {
	clientIndustry: string;
	tone: string;
	keywords: string[];
	language: string;
	// Brief-specific fields
	businessName: string;
	businessDescription: string;
	services: string;
	targetAge: string;
	targetGender: string;
	targetInterests: string;
	contentGoals: string;
	hashtags: string;
	topicsToAvoid: string;
	location: string;
	priceRange: string;
	schedule: string;
}

export const generateAI = protectedProcedure
	.route({
		method: "POST",
		path: "/contentflow/generate-ai",
		tags: ["ContentFlow"],
		summary: "Generate content with AI (Claude)",
		description: "Generate social media content for multiple platforms and days",
	})
	.input(
		z.object({
			client_id: z.string(),
			agency_id: z.string(),
			platforms: z.array(
				z.enum([
					"instagram",
					"facebook",
					"twitter",
					"linkedin",
					"tiktok",
					"blog",
				]),
			),
			days: z.number().min(1).max(30),
			brand_voice: z.object({
				tone: z.string(),
				keywords: z.array(z.string()),
				language: z.string().default("es"),
			}),
			client_industry: z.string(),
			generate_images: z.boolean().default(true),
		}),
	)
	.handler(async ({ input, context }) => {
		const {
			client_id,
			agency_id,
			platforms,
			days,
			brand_voice,
			client_industry,
			generate_images,
		} = input;
		const userId = context.user.id;

		console.log(
			`[ContentFlow AI] Starting generation for client ${client_id}: ${days} days x ${platforms.length} platforms = ${days * platforms.length} posts`,
		);

		// Verify ownership
		const { data: agency } = await supabase
			.from("agencies")
			.select("id, user_id")
			.eq("id", agency_id)
			.eq("user_id", userId)
			.single();

		if (!agency) {
			throw new ORPCError("FORBIDDEN", {
				message: "Agency not found or access denied",
			});
		}

	// Verify client belongs to agency and fetch brief
	const { data: client } = await supabase
		.from("agency_clients")
		.select("id, agency_id, name, industry, brief")
		.eq("id", client_id)
		.eq("agency_id", agency_id)
		.single();

	if (!client) {
		throw new ORPCError("FORBIDDEN", {
			message: "Client not found or access denied",
		});
	}

	// Extract brief information
	const brief = (client.brief as any) || {};
	const businessName = brief.business_name || client.name;
	const businessDescription = brief.business_description || '';
	const services = brief.services?.join(', ') || '';
	const targetAge = brief.target_age || '';
	const targetGender = brief.target_gender || '';
	const targetInterests = brief.target_interests?.join(', ') || '';
	const contentTone = brief.content_tone || brand_voice.tone || 'profesional';
	const contentGoals = brief.content_goals?.join(', ') || '';
	const hashtags = brief.hashtags_preferred?.join(' ') || '';
	const topicsToAvoid = brief.topics_to_avoid?.join(', ') || '';
	const location = brief.location || '';
	const priceRange = brief.price_range || '';
	const schedule = brief.schedule || '';

	// Prepare prompt context with brief data
	const promptContext: PromptContext = {
		clientIndustry: client_industry,
		tone: contentTone,
		keywords: brand_voice.keywords,
		language: brand_voice.language,
		// Brief-specific context
		businessName,
		businessDescription,
		services,
		targetAge,
		targetGender,
		targetInterests,
		contentGoals,
		hashtags,
		topicsToAvoid,
		location,
		priceRange,
		schedule,
	};

		// Generate content
		const generatedContent: Array<{
			client_id: string;
			scheduled_date: string;
			platform: string;
			content_text: string;
			image_url: string | null;
			status: string;
		}> = [];

		// Plataformas visuales que necesitan imagen
		const visualPlatforms = ['instagram', 'facebook', 'tiktok'];

		const startDate = new Date();
		let totalGenerated = 0;
		let totalErrors = 0;

		for (let dayIndex = 0; dayIndex < days; dayIndex++) {
			const scheduledDate = new Date(startDate);
			scheduledDate.setDate(scheduledDate.getDate() + dayIndex);
			const dateString = scheduledDate.toISOString().split("T")[0];

			for (const platform of platforms) {
				try {
					// Add day context to prompt
					const dayContext = `Día ${dayIndex + 1} de ${days}`;
					const promptTemplate = platformPrompts[platform](promptContext);
					const fullPrompt = `${promptTemplate}\n\nContexto temporal: ${dayContext}\nGenera contenido único y específico para este día.`;

					console.log(
						`[ContentFlow AI] Generating ${platform} content for day ${dayIndex + 1}...`,
					);

					// Generate content with Claude
					const { text } = await generateText({
						model: textModel,
						prompt: fullPrompt,
						temperature: 0.8, // Más creatividad
					});

					// Clean up the generated text
					const cleanedText = text.trim();

					// Generate image for visual platforms (Pollinations.ai - free)
					let imageUrl: string | null = null;

					if (generate_images && visualPlatforms.includes(platform)) {
						const imageSizes: Record<string, { width: number; height: number }> = {
							instagram: { width: 1080, height: 1080 },
							facebook: { width: 1200, height: 630 },
							tiktok: { width: 1080, height: 1920 },
						};

						const size = imageSizes[platform] || { width: 1024, height: 1024 };

						// Crear prompt de imagen basado en el negocio
						const imagePrompt = `Professional photo for ${platform}: ${businessName}. ${businessDescription}. ${services}. High quality, commercial style, safe for work.`;

						const encodedPrompt = encodeURIComponent(imagePrompt);
						imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${size.width}&height=${size.height}&nologo=true`;

						console.log(
							`[ContentFlow AI] 🖼️ Generated image for ${platform}: ${imageUrl.substring(0, 80)}...`,
						);
					}

					// Insert into database
					const { error: insertError } = await supabase
						.from("content_calendar")
						.insert({
							client_id,
							scheduled_date: dateString,
							platform,
							content_text: cleanedText,
							image_url: imageUrl,
							status: "draft",
						});

					if (insertError) {
						console.error(
							`[ContentFlow AI] Error inserting ${platform} for day ${dayIndex + 1}:`,
							insertError,
						);
						totalErrors++;
					} else {
						generatedContent.push({
							client_id,
							scheduled_date: dateString,
							platform,
							content_text: cleanedText,
							image_url: imageUrl,
							status: "draft",
						});
						totalGenerated++;
						console.log(
							`[ContentFlow AI] ✅ Generated ${platform} for day ${dayIndex + 1}${imageUrl ? ' (with image)' : ''}`,
						);
					}

					// Small delay to avoid rate limiting
					await new Promise((resolve) => setTimeout(resolve, 500));
				} catch (error: any) {
					console.error(
						`[ContentFlow AI] Error generating ${platform} for day ${dayIndex + 1}:`,
						error.message,
					);
					totalErrors++;

					// Insert fallback content
					const fallbackText = `[Contenido para ${platform}] - Error de generación. Por favor, editar manualmente.`;
					await supabase.from("content_calendar").insert({
						client_id,
						scheduled_date: dateString,
						platform,
						content_text: fallbackText,
						image_url: null,
						status: "draft",
					});
				}
			}
		}

		console.log(
			`[ContentFlow AI] Generation complete: ${totalGenerated} successful, ${totalErrors} errors`,
		);

		return {
			success: true,
			generated: totalGenerated,
			errors: totalErrors,
			total: days * platforms.length,
			content: generatedContent,
		};
	});

