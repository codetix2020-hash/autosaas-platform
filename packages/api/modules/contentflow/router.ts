// ⚠️ TODO PRODUCCIÓN: Cambiar generación de imágenes de Pollinations.ai a:
// - DALL-E 3: $0.04/imagen (OpenAI) - Mejor calidad general
// - Recraft V3: $0.04/imagen - Mejor para vectores y texto en imágenes
// Actualmente usando Pollinations.ai (gratis) para desarrollo

import { createAgency } from "./procedures/create-agency";
import { createClient } from "./procedures/create-client";
import { createContent } from "./procedures/create-content";
import { deleteAgency } from "./procedures/delete-agency";
import { deleteClient } from "./procedures/delete-client";
import { deleteContent } from "./procedures/delete-content";
import { generateAI } from "./procedures/generate-ai";
import { generateImage } from "./procedures/generate-image";
import { listAgencies } from "./procedures/list-agencies";
import { listClients } from "./procedures/list-clients";
import { listContent } from "./procedures/list-content";
import { publicGetBrief } from "./procedures/public-get-brief";
import { publicUpdateBrief } from "./procedures/public-update-brief";
import { updateAgency } from "./procedures/update-agency";
import { updateClient } from "./procedures/update-client";
import { updateContent } from "./procedures/update-content";

export const contentflowRouter = {
	agencies: {
		list: listAgencies,
		create: createAgency,
		update: updateAgency,
		delete: deleteAgency,
	},
	clients: {
		list: listClients,
		create: createClient,
		update: updateClient,
		delete: deleteClient,
	},
	content: {
		list: listContent,
		create: createContent,
		update: updateContent,
		delete: deleteContent,
	},
	ai: {
		generate: generateAI,
		generateImage: generateImage,
	},
	public: {
		getBrief: publicGetBrief,
		updateBrief: publicUpdateBrief,
	},
};
