# Database Architecture

## Supabase PostgreSQL Schema

### `profiles` Table
Stores extended user data that isn't handled by Supabase Auth (`auth.users`).

**Columns:**
- `id` (uuid, PK, references `auth.users.id`)
- `full_name` (text)
- `email` (text)
- `phone` (text, optional)
- `avatar_url` (text, optional)
- `target_year` (integer, optional)
- `target_exam` (text: "JEE_MAIN", "JEE_ADVANCED", "BOTH")
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

### Row Level Security (RLS)
- **Profiles**: Users can only select and update their own rows `(auth.uid() = id)`.

*(More tables will be added here as features like Study, Analytics, and Planner are built).*
