-- Fix "Public Bucket Allows Listing" advisory on the logos bucket.
--
-- logos is a public bucket, so objects are served via their public URL
-- (/storage/v1/object/public/logos/...) with no RLS evaluation. The broad
-- "logos public read" SELECT policy added nothing for that URL access but did
-- let any client LIST every file in the bucket. Drop it; uploads/updates are
-- still owner-scoped by the remaining insert/update policies, and logo display
-- via getPublicUrl() keeps working.

drop policy if exists "logos public read" on storage.objects;
