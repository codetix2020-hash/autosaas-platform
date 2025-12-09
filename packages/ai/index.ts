import { anthropic } from "@ai-sdk/anthropic";
// import { openai } from "@ai-sdk/openai"; // Comentado - requiere OPENAI_API_KEY

// Modelo de texto principal - Claude Sonnet 4
export const textModel = anthropic("claude-sonnet-4-20250514");

// Modelos de imagen y audio requieren OpenAI API Key
// Descomentar si se configura OPENAI_API_KEY en el futuro
// export const imageModel = openai("dall-e-3");
// export const audioModel = openai("whisper-1");

export * from "ai";
export * from "./lib";
