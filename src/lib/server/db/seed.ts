import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error('DATABASE_URL is not set');

const client = postgres(databaseUrl);
const db = drizzle(client, { schema });

async function seed() {
	console.log('Seeding database...');

	await db
		.insert(schema.heroSection)
		.values({
			id: 1,
			title: 'Your Name',
			description: 'Web Developer & Designer building fast, accessible web experiences.',
			ctaPrimaryLabel: 'View My Work',
			ctaPrimaryUrl: '/work',
			ctaSecondaryLabel: 'Contact Me',
			ctaSecondaryUrl: '/#contact',
			showPhoto: true
		})
		.onConflictDoNothing();
	console.log('  Hero section created');

	await db
		.insert(schema.aboutSection)
		.values({
			id: 1,
			content:
				'<p>I am a web developer passionate about building clean, performant, and accessible web applications.</p>'
		})
		.onConflictDoNothing();
	console.log('  About section created');

	await db
		.insert(schema.sectionHeaders)
		.values([
			{
				sectionKey: 'hero',
				eyebrow: 'Full-Stack, Backend, IoT Developer',
				title: null,
				description: null,
				isVisible: true
			},
			{
				sectionKey: 'about',
				eyebrow: 'Who I Am',
				title: 'About Me',
				description: null,
				isVisible: true
			},
			{
				sectionKey: 'services',
				eyebrow: 'Services & Offerings',
				title: 'What I Can Do',
				isVisible: true
			},
			{
				sectionKey: 'skills',
				eyebrow: 'Tooling & Tech',
				title: 'Skills & Expertise',
				isVisible: true
			},
			{
				sectionKey: 'work',
				eyebrow: 'Featured Projects',
				title: 'My Work',
				isVisible: true
			},
			{
				sectionKey: 'contact',
				eyebrow: "Let's Talk",
				title: "Have a project worth building? Let's talk.",
				description:
					'Open to full-stack, backend, and IoT developer roles. I usually reply within 24 hours.',
				isVisible: true
			}
		])
		.onConflictDoNothing();
	console.log('  Section headers created');

	await db
		.insert(schema.footerSection)
		.values({
			id: 1,
			copyrightText: '© 2026 Your Name. All rights reserved.',
			socialLinks: [
				{ platform: 'GitHub', url: 'https://github.com/yourname', icon: 'Github' },
				{ platform: 'LinkedIn', url: 'https://linkedin.com/in/yourname', icon: 'Linkedin' },
				{ platform: 'Email', url: 'mailto:you@example.com', icon: 'Mail' }
			]
		})
		.onConflictDoNothing();
	console.log('  Footer section created');

	await db
		.insert(schema.whatICanDoItems)
		.values([
			{
				title: 'Frontend Development',
				description: 'Building responsive, accessible UIs with Svelte, TypeScript, and Tailwind.',
				icon: 'PanelsTopLeft',
				displayOrder: 0
			},
			{
				title: 'Backend Development',
				description: 'Designing robust APIs and services with Node.js, PostgreSQL, and Redis.',
				icon: 'Server',
				displayOrder: 1
			},
			{
				title: 'DevOps & Deployment',
				description: 'Deploying and managing applications with Docker, Nginx, and CI/CD.',
				icon: 'Container',
				displayOrder: 2
			}
		])
		.onConflictDoNothing();
	console.log('  Service items created');

	await db
		.insert(schema.skills)
		.values([
			{ name: 'Svelte', icon: 'Braces', category: 'Frontend', proficiency: 90, displayOrder: 0 },
			{
				name: 'TypeScript',
				icon: 'CodeXml',
				category: 'Frontend',
				proficiency: 88,
				displayOrder: 1
			},
			{
				name: 'PostgreSQL',
				icon: 'Database',
				category: 'Backend',
				proficiency: 85,
				displayOrder: 2
			},
			{ name: 'Redis', icon: 'Zap', category: 'Backend', proficiency: 80, displayOrder: 3 }
		])
		.onConflictDoNothing();
	console.log('  Skills created');

	console.log('Seed complete!');
	await client.end();
}

seed().catch((err) => {
	console.error('Seed failed:', err);
	process.exit(1);
});
