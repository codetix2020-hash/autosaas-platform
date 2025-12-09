import { z } from "zod";
import { protectedProcedure } from "../../../orpc/procedures";

// ⚠️ TODO PRODUCCIÓN: Cambiar a DALL-E ($0.04/img) o Recraft ($0.04/img)
// Actualmente usando Pollinations.ai (gratis) para desarrollo

export const generateImage = protectedProcedure
	.route({
		method: "POST",
		path: "/contentflow/ai/generate-image",
		tags: ["ContentFlow", "AI"],
	})
	.input(
		z.object({
			prompt: z.string().min(1).max(1000),
			platform: z.enum([
				"instagram",
				"facebook",
				"twitter",
				"linkedin",
				"tiktok",
				"blog",
			]),
			style: z
				.enum(["realistic", "illustration", "minimal"])
				.default("realistic"),
		}),
	)
	.handler(async ({ input }) => {
		const { prompt, platform, style } = input;

		// Tamaños optimizados por plataforma
		const sizes: Record<string, { width: number; height: number }> = {
			instagram: { width: 1080, height: 1080 },
			facebook: { width: 1200, height: 630 },
			twitter: { width: 1200, height: 675 },
			linkedin: { width: 1200, height: 627 },
			tiktok: { width: 1080, height: 1920 },
			blog: { width: 1200, height: 630 },
		};

		const size = sizes[platform] || { width: 1024, height: 1024 };

		// Mejorar prompt según estilo
		let enhancedPrompt = prompt;
		if (style === "illustration") {
			enhancedPrompt = `Digital illustration, modern clean design: ${prompt}`;
		} else if (style === "minimal") {
			enhancedPrompt = `Minimalist design, simple clean background: ${prompt}`;
		} else {
			enhancedPrompt = `Professional photography, high quality commercial photo: ${prompt}`;
		}

		// Agregar safety y calidad
		enhancedPrompt += ". High resolution, professional, safe for work.";

		const encodedPrompt = encodeURIComponent(enhancedPrompt);
		const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${size.width}&height=${size.height}&nologo=true`;

		return {
			success: true,
			image_url: imageUrl,
			platform,
			style,
			size: `${size.width}x${size.height}`,
		};
	});
