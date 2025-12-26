-- Migration: Add brief field to agency_clients
-- This allows detailed client information for better AI content generation

-- Add brief column to agency_clients
ALTER TABLE agency_clients 
ADD COLUMN IF NOT EXISTS brief JSONB DEFAULT '{}'::jsonb;

-- Add comment explaining the structure
COMMENT ON COLUMN agency_clients.brief IS 'Client brief containing business info, target audience, content style, competitors, and examples';

-- Create index for faster queries on brief fields
CREATE INDEX IF NOT EXISTS idx_agency_clients_brief ON agency_clients USING gin(brief);

-- Example brief structure (for documentation):
/*
{
  "business_name": "Mi Restaurante",
  "business_description": "Restaurante de comida mediterránea con ambiente familiar",
  "services": ["Comida para llevar", "Delivery", "Catering", "Salón privado"],
  "price_range": "medio",
  "location": "Centro, Ciudad",
  "schedule": "Lun-Dom 12:00-23:00",
  "website": "https://mirestaurante.com",
  "phone": "+34 123 456 789",
  
  "target_age": "25-50",
  "target_gender": "todos",
  "target_interests": ["gastronomía", "vida saludable", "foodie", "vinos"],
  
  "content_tone": "casual",
  "content_goals": ["ventas", "engagement", "awareness"],
  "hashtags_preferred": ["#gastronomia", "#foodlover", "#restaurante"],
  "topics_to_avoid": ["fast food", "comida procesada"],
  
  "competitors": ["https://instagram.com/competidor1", "Competidor Local 2"],
  
  "liked_posts_examples": [
    "https://instagram.com/p/example1",
    "https://instagram.com/p/example2"
  ],
  
  "logo_url": "",
  "photos_urls": []
}
*/



