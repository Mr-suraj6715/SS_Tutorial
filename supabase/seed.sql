-- ==============================================================================
-- SS TUTORIAL INITIAL SEED DATA
-- Note: As per specification, no fake institute details (address, phone, fees,
-- faculty, timings, achievements) are invented. Everything is initialized with
-- clean empty/placeholder strings, with @ss__tutorial Instagram presence,
-- ready for the admin to configure directly via the Admin Dashboard.
-- ==============================================================================

INSERT INTO public.site_settings (key, value, description)
VALUES
    ('institute_name', 'SS Tutorial', 'Name of the coaching institute'),
    ('tagline', '', 'Short tagline or slogan displayed in the hero and header'),
    ('about', '', 'Comprehensive overview of SS Tutorial, history, vision and mission'),
    ('notice_ticker', '', 'Latest announcements and ticker notices displayed at the top of the site'),
    ('address', '', 'Physical address of the institute'),
    ('phone', '', 'Primary contact phone number'),
    ('email', '', 'Official email address'),
    ('working_hours', '', 'Institute office and classroom operating hours'),
    ('whatsapp_number', '', 'WhatsApp contact number with country code'),
    ('whatsapp_message', 'Hello SS Tutorial, I would like to inquire about admissions and courses.', 'Default pre-filled WhatsApp message'),
    ('footer_note', '', 'Custom copyright or accreditation note displayed in the footer'),
    ('logo_url', '/logo.png', 'URL of the institute logo (uploaded via admin)'),
    ('hero_image_url', '', 'URL of the hero banner image (uploaded via admin)'),
    ('map_embed_url', '', 'Google Maps embed iframe URL'),
    ('instagram_url', 'https://www.instagram.com/ss__tutorial', 'Instagram profile URL (@ss__tutorial)'),
    ('facebook_url', '', 'Facebook page URL'),
    ('youtube_url', '', 'YouTube channel URL'),
    ('twitter_url', '', 'Twitter / X profile URL'),
    ('linkedin_url', '', 'LinkedIn profile URL'),
    ('meta_title', 'SS Tutorial | Premier Coaching Institute', 'Default SEO Meta Title'),
    ('meta_description', 'Welcome to SS Tutorial. Excellence in coaching, comprehensive courses, dedicated faculty, and proven results. Follow us @ss__tutorial.', 'Default SEO Meta Description')
ON CONFLICT (key) DO UPDATE
SET value = EXCLUDED.value, description = EXCLUDED.description;
