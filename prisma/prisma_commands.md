`npx prisma init` - init it to the project

`npx prisma db pull` - generate schema.prisma from database structure

`npx prisma generate` - compile schema to @prisma/client to use it in code

`npx prisma migrate dev --name nameOfMigration` - migrations

`pg_dump --schema-only -d ctm -U ctmadmin > schema.sql` - updating ctmschema.sgl