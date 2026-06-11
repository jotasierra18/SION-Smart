/*
# Add missing columns to service_types

1. Modified Tables
- `service_types`: Add `basePrice` and `estimatedDuration` columns

2. Security
- No changes to policies
*/

ALTER TABLE service_types
ADD COLUMN IF NOT EXISTS "basePrice" decimal(10,2),
ADD COLUMN IF NOT EXISTS "estimatedDuration" integer;
