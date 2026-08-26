import 'dotenv/config';
import { createInterface } from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import argon2 from 'argon2';
import { z } from 'zod';
import * as schema from './schema';

const emailSchema = z.string().trim().email('Invalid email address format');
const passwordSchema = z.string().min(8, 'Password must be at least 8 characters long');

async function main() {
	const databaseUrl = process.env.DATABASE_URL;
	if (!databaseUrl) {
		console.error('Error: DATABASE_URL environment variable is not set');
		process.exit(1);
	}

	const rl = createInterface({ input, output });

	console.log('\n=== Create Admin User ===\n');

	try {
		let name = '';
		while (!name) {
			const rawName = await rl.question('Admin Name (default: Admin): ');
			name = rawName.trim() || 'Admin';
		}

		let email = '';
		while (!email) {
			const rawEmail = await rl.question('Admin Email: ');
			const parseRes = emailSchema.safeParse(rawEmail);
			if (parseRes.success) {
				email = parseRes.data.toLowerCase();
			} else {
				console.log(`  ❌ ${parseRes.error.issues[0]?.message}`);
			}
		}

		let password = '';
		while (!password) {
			const rawPassword = await rl.question('Admin Password (min 8 chars): ');
			const parseRes = passwordSchema.safeParse(rawPassword);
			if (parseRes.success) {
				password = parseRes.data;
			} else {
				console.log(`  ❌ ${parseRes.error.issues[0]?.message}`);
			}
		}

		rl.close();

		console.log('\nHashing password and saving user to database...');

		const client = postgres(databaseUrl);
		const db = drizzle(client, { schema });

		const passwordHash = await argon2.hash(password);

		const [user] = await db
			.insert(schema.adminUsers)
			.values({
				name,
				email,
				passwordHash
			})
			.onConflictDoUpdate({
				target: schema.adminUsers.email,
				set: {
					name,
					passwordHash,
					tokenVersion: 0,
					updatedAt: new Date()
				}
			})
			.returning();

		await client.end();

		console.log(`\n✅ Admin user created/updated successfully!`);
		console.log(`   ID:    ${user.id}`);
		console.log(`   Name:  ${user.name}`);
		console.log(`   Email: ${user.email}\n`);
	} catch (err: unknown) {
		rl.close();
		console.error('\n❌ Failed to create admin user:', err);
		process.exit(1);
	}
}

main();
