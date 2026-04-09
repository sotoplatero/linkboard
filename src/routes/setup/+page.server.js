import { redirect, fail } from '@sveltejs/kit';
import { readJsonFile, writeJsonFile } from '$lib/server/github.js';
import { hashPassword } from '$lib/server/auth.js';

/** @type {import('./$types').PageServerLoad} */
export async function load({ locals }) {
	if (locals.isSetup) {
		throw redirect(303, '/');
	}
	return {};
}

/** @type {import('./$types').Actions} */
export const actions = {
	default: async ({ request }) => {
		const data = await request.formData();
		const username = data.get('username')?.toString().trim();
		const password = data.get('password')?.toString();
		const confirm = data.get('confirm')?.toString();

		if (!username || !password) {
			return fail(400, { error: 'Username and password are required', username });
		}

		if (password !== confirm) {
			return fail(400, { error: 'Passwords do not match', username });
		}

		if (password.length < 6) {
			return fail(400, { error: 'Password must be at least 6 characters', username });
		}

		// Check if already set up (race condition guard)
		const existing = await readJsonFile('auth.json');
		if (existing) {
			throw redirect(303, '/');
		}

		const passwordHash = await hashPassword(password);

		await writeJsonFile(
			'auth.json',
			{ username, passwordHash },
			'Initialize auth credentials',
			null
		);

		throw redirect(303, '/');
	}
};
