# TAALMEET Database Migrations

This folder contains Supabase database migrations for the TAALMEET app.

## Migration Files

1. **001_initial_schema.sql** - Creates all tables (users, user_languages, locations, messages, matches)
2. **002_rls_policies.sql** - Implements Row Level Security policies
3. **003_functions.sql** - Database functions and triggers

## Running Migrations

### Option 1: Supabase Dashboard (Recommended for setup)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Run each migration file in order (001, 002, 003)

### Option 2: Supabase CLI

```bash
# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

## Database Schema

### Tables

- **users** - User profiles
- **user_languages** - Languages users speak or are learning
- **locations** - User location data for nearby matching
- **messages** - Direct messages between users
- **matches** - Connection requests and matches

### Key Features

- **RLS Policies** - Secure data access at the database level
- **Triggers** - Auto-update timestamps
- **Functions** - Helper functions for complex queries
  - `get_nearby_users()` - Find users within radius
  - `get_unread_message_count()` - Count unread messages
  - `get_conversation_messages()` - Fetch conversation history

## Security

All tables have Row Level Security (RLS) enabled. Users can only:
- View public data (profiles, locations)
- Modify their own data
- Send/receive messages with matched users

## Testing

After running migrations, test the schema:

```sql
-- Test user creation
SELECT * FROM users LIMIT 10;

-- Test nearby users function
SELECT * FROM get_nearby_users(40.7128, -74.0060, 10, 50);

-- Test unread messages
SELECT get_unread_message_count('user-uuid-here');
```

