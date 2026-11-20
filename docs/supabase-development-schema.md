# Supabase development schema

The development Supabase project starts empty. Populate its structure from production with a schema-only dump. This copies tables, indexes, functions, triggers, and policies, but no production rows.

Run these commands from PowerShell. Each command prompts for the database password; do not put the password in the command or commit the generated SQL file.

```powershell
New-Item -ItemType Directory -Force supabase | Out-Null

pg_dump `
  --schema-only `
  --schema=public `
  --no-owner `
  --no-privileges `
  --file=supabase/dev-schema.sql `
  --host=db.ftuuyfhfrhvlllfwfbjx.supabase.co `
  --port=5432 `
  --username=postgres `
  --dbname=postgres `
  --password

psql `
  --host=db.alncrloxuuakchbcqqcf.supabase.co `
  --port=5432 `
  --username=postgres `
  --dbname=postgres `
  --file=supabase/dev-schema.sql `
  --password
```

Use the production database password for the dump and the development database password for the restore. These are database passwords from Supabase, not the service-role keys.

After the restore:

```powershell
pnpm --filter server dev
```

Check the API at `http://localhost:5000/healthcheck` and refresh the development project's Supabase Table Editor. Do not copy production data, `auth.users`, payment records, OTPs, or storage objects into development.
