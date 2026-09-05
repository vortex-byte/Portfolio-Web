import 'dotenv/config';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

console.log('Running database migrations...');
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
	console.error('DATABASE_URL is missing');
	process.exit(1);
}

const client = postgres(databaseUrl, { max: 1 });
const db = drizzle(client);

try {
	await migrate(db, { migrationsFolder: './drizzle' });
	console.log('Migrations completed successfully.');
} catch (error) {
	console.error('Migration failed:', error);
} finally {
	await client.end();
}
