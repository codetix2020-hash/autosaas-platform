-- Migration: Add image_url to content_calendar
-- Description: Add support for AI-generated images in content calendar

-- Add image_url column
ALTER TABLE content_calendar 
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_content_calendar_image_url 
ON content_calendar(image_url) 
WHERE image_url IS NOT NULL;

-- Add comment
COMMENT ON COLUMN content_calendar.image_url IS 'URL of AI-generated image (DALL-E 3)';


