// Promote an existing account to admin:  npm run make-admin -- someone@example.com
import "dotenv/config";
import postgres from "postgres";

const email = process.argv[2]?.trim().toLowerCase();
if (!email) {
  console.error("Usage: npm run make-admin -- someone@example.com");
  process.exit(1);
}

const sql = postgres(process.env.DATABASE_URL!, { prepare: false, max: 1 });
const rows = await sql`update "user" set role = 'admin', updated_at = now() where lower(email) = ${email} returning name, email`;
console.log(rows.length ? `Admin: ${rows[0].name} <${rows[0].email}>` : `No account found for ${email} — sign up first.`);
await sql.end();
