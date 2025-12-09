import { NextResponse } from "next/server";

export async function GET() {
	try {
		const prompt =
			"A professional photo of a modern hair salon interior, bright and clean";

		// Pollinations.ai - Gratis, sin API key
		// Documentación: https://pollinations.ai/
		const encodedPrompt = encodeURIComponent(prompt);
		const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&nologo=true`;

		return NextResponse.json({
			success: true,
			image_url: imageUrl,
			provider: "pollinations.ai (free)",
			note: "TODO: Cambiar a DALL-E o Recraft en producción para mejor calidad",
		});
	} catch (error: any) {
		return NextResponse.json(
			{ success: false, error: error.message },
			{ status: 500 },
		);
	}
}

