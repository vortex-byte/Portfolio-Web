import 'dotenv/config';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { db } from './index';

console.log('Running database migrations...');
try {
	await migrate(db, { migrationsFolder: './drizzle' });
	console.log('Migrations completed successfully.');
} catch (error) {
	console.error('Migration failed:', error);
	process.exit(1);
}
