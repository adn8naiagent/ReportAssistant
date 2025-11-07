# Copy Prisma Schema to Production Database

This guide explains how to deploy your Prisma schema to a production database (or any other database).

## Quick Method (Schema Push - No Migration Files)

This is the fastest way for initial setup or development. It **directly pushes** your schema to the database without creating migration files.

### Steps:

1. **Update Replit Secret with target database URL**
   - Click the lock icon 🔒 in Replit's left sidebar (Tools → Secrets)
   - Find `DATABASE_URL` secret
   - Temporarily change it to your **production/target database** connection string
   - Save

2. **Push schema to database**
   ```bash
   npm run db:push
   ```

   This command:
   - Reads `prisma/schema.prisma`
   - Pushes schema directly to the database
   - Creates/updates all tables and columns
   - **Does NOT create migration files**

3. **Restore development DATABASE_URL**
   - Go back to Replit Secrets
   - Change `DATABASE_URL` back to your **development database**
   - Save

4. **Done!**
   - Your production database now has the schema
   - Your dev environment is back to normal

## Migration Method (Production-Ready)

For production systems where you want version-controlled migrations:

### Steps:

1. **Generate migration files**
   ```bash
   npm run db:migrate
   ```
   - Creates migration SQL files in `prisma/migrations/`
   - Applies them to your current (development) database

2. **Commit migrations to git**
   ```bash
   git add prisma/migrations
   git commit -m "Add database migrations"
   ```

3. **Deploy to production**
   - Update `DATABASE_URL` to production (in Replit Secrets or deployment environment)
   - Run: `npx prisma migrate deploy`
   - This applies all pending migrations

## Which Method Should You Use?

- **`db:push`** (Quick Method)
  - ✅ Perfect for: Initial setup, development, prototyping
  - ✅ Fast and simple
  - ❌ No migration history
  - ❌ Not recommended for production with existing data

- **`db:migrate`** (Migration Method)
  - ✅ Perfect for: Production deployments
  - ✅ Version-controlled schema changes
  - ✅ Safe for databases with existing data
  - ✅ Team collaboration friendly
  - ❌ Slightly more complex

## Viewing Your Data

After pushing the schema, you can view your database with Prisma Studio:

```bash
npm run db:studio
```

This opens a web GUI to browse and edit your data.

## Troubleshooting

**Error: "DATABASE_URL is not defined"**
- Make sure you've added `DATABASE_URL` to Replit Secrets
- Restart your Repl after adding the secret

**Error: "Can't reach database server"**
- Check that your DATABASE_URL is correct
- Verify your database allows connections from Replit's IP addresses
- For Neon, make sure the connection string includes `?sslmode=require`

**Schema already exists warning**
- This is normal if tables already exist
- Prisma will update them to match your schema

## Need Help?

- [Prisma Docs](https://www.prisma.io/docs)
- [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)
- [Prisma Migrate](https://www.prisma.io/docs/concepts/components/prisma-migrate)
