declare global {
	namespace App {
		interface Locals {
			user: { id: string; email: string; name: string } | null;
		}
		interface Error {
			message: string;
			code?: string;
			errorId?: string;
			stack?: string;
		}
	}
}

export {};
