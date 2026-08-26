import { z } from 'zod';

function hasControlChars(value: string): boolean {
	// eslint-disable-next-line no-control-regex
	const control = /[\u0000-\u001F\u007F]/;
	return control.test(value);
}

const noControlChars = z.string().refine((v) => !hasControlChars(v), 'Contains invalid characters');

export const contactSchema = z.object({
	name: z
		.string()
		.trim()
		.min(2, 'Name must be at least 2 characters')
		.max(150, 'Name must be under 150 characters')
		.pipe(noControlChars),
	email: z.email('Please enter a valid email address').pipe(noControlChars),
	message: z
		.string()
		.trim()
		.min(10, 'Message must be at least 10 characters')
		.max(2000, 'Message must be under 2000 characters')
});

export type ContactInput = z.infer<typeof contactSchema>;
