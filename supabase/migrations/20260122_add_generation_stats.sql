-- Add generation stats columns to apps table
ALTER TABLE apps
ADD COLUMN duration_a double precision,
ADD COLUMN tokens_a integer,
ADD COLUMN duration_b double precision,
ADD COLUMN tokens_b integer;
