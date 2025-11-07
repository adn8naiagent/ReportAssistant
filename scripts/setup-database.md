# Database Setup Guide for TeachAssist.ai

This guide will help you set up the Neon PostgreSQL database and get the admin dashboard working.

---

## Prerequisites

- Neon PostgreSQL account (free tier available at https://neon.tech)
- Replit environment with project code

---

## Step 1: Verify DATABASE_URL is Set

### Check if DATABASE_URL exists:

1. In Replit, click the **lock icon 🔒** in the left sidebar (Tools → Secrets)
2. Look for a secret named `DATABASE_URL`

### If DATABASE_URL is NOT set:

1. Get your Neon connection string:
   - Log into your Neon dashboard at https://console.neon.tech
   - Select your project
   - Click "Connection Details"
   - Copy the connection string (it should look like):
     ```
     postgresql://user:password@host.neon.tech/dbname?sslmode=require
     ```

2. Add it to Replit Secrets:
   - Click the lock icon 🔒 in Replit sidebar
   - Click "New Secret"
   - Key: `DATABASE_URL`
   - Value: Paste your Neon connection string
   - Click "Add Secret"

3. **Restart your development server** (stop and run `npm run dev` again)

---

## Step 2: Generate Prisma Client

This generates the TypeScript types and client code for your database schema.

```bash
npx prisma generate
```

Expected output:
```
✔ Generated Prisma Client to ./node_modules/@prisma/client
```

---

## Step 3: Push Schema to Database

This creates all the tables in your Neon database based on your Prisma schema.

```bash
npm run db:push
```

Expected output:
```
🚀  Your database is now in sync with your Prisma schema.
```

This will create 6 tables:
- **User** - User accounts and subscription tiers
- **Subscription** - Stripe subscription records
- **SavedResponse** - Saved AI-generated content
- **UsageLog** - API request tracking
- **Session** - User sessions for analytics
- **Event** - User event tracking

---

## Step 4: Verify Database Connection

1. Check the server logs when you run `npm run dev`
2. You should see:
   ```
   🔗 Database URL configured: postgresql://****@ep-...neon.tech/neondb
   ✅ Prisma client connected to database successfully
   ```

3. If you see errors, check:
   - DATABASE_URL is correctly set in Replit Secrets
   - Your Neon database is active (check Neon dashboard)
   - Connection string includes `?sslmode=require` at the end

---

## Step 5: Test Admin Dashboard

1. Navigate to `/admin` in your browser
2. All metrics should now load successfully
3. You should see:
   - Overview cards (Total Users, Active Users, MRR, New Signups)
   - Revenue breakdown table
   - Usage statistics
   - Recent activity
   - Empty user table (no users yet)

---

## Troubleshooting

### Error: "DATABASE_URL is not set"

**Solution:**
1. Verify the secret exists in Replit Secrets
2. Secret name must be exactly `DATABASE_URL` (case-sensitive)
3. Restart the development server after adding the secret

---

### Error: "The table public.User does not exist"

**Solution:**
1. Run `npm run db:push` to create the tables
2. Verify in Neon dashboard that tables were created
3. Restart the development server

---

### Error: "Connection timeout" or "Connection refused"

**Solution:**
1. Check your Neon database status in the dashboard
2. Verify the connection string is correct
3. Ensure `?sslmode=require` is at the end of the URL
4. Check if your Neon project is still active (free tier has limits)

---

### Error: "Failed to fetch overview metrics"

**Solution:**
1. Open browser console (F12) and check Network tab
2. Look for the API response - it should include a `hint` field
3. Follow the hint provided (usually "Run: npm run db:push")
4. Check server logs for detailed error messages

---

## Optional: View Database in Prisma Studio

Prisma Studio provides a GUI to view and edit your database data.

```bash
npm run db:studio
```

This will open a web interface at http://localhost:5555 where you can:
- View all tables and records
- Add/edit/delete records manually
- Test your database schema

---

## Database Migration Commands

### Quick reference:

```bash
# Generate Prisma Client (after schema changes)
npx prisma generate

# Push schema to database (development)
npm run db:push

# Create a new migration (production)
npm run db:migrate

# Open Prisma Studio GUI
npm run db:studio

# Reset database (WARNING: deletes all data)
npx prisma db push --force-reset
```

---

## Environment Variables Summary

Required environment variables in Replit Secrets:

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | Neon PostgreSQL connection string | `postgresql://user:pass@host/db?sslmode=require` |
| `OPENROUTER_API_KEY` | OpenRouter API key for Claude | `sk-or-v1-...` |

Optional (for production):
- `SESSION_SECRET` - Express session secret
- `STRIPE_SECRET_KEY` - Stripe API key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook signing secret

---

## Next Steps

Once the database is set up:

1. ✅ Admin dashboard will work at `/admin`
2. Implement user authentication
3. Set up Stripe integration for subscriptions
4. Add user registration/login pages
5. Enforce usage limits per tier

---

## Support

If you encounter issues:

1. Check the server console logs for detailed error messages
2. Verify all environment variables are set correctly
3. Ensure Neon database is active and accessible
4. Check that all tables exist in Prisma Studio
5. Review the error `hint` field in API responses

---

**Last Updated:** 2025-11-07
**Database:** Neon PostgreSQL
**ORM:** Prisma
**Schema Version:** 6 tables (User, Subscription, SavedResponse, UsageLog, Session, Event)
