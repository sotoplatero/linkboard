import { env } from '$env/dynamic/private';

function getConfig() {
	const token = env.GITHUB_TOKEN;
	const owner = env.GITHUB_OWNER;
	const repo = env.GITHUB_REPO;
	const branch = env.GITHUB_BRANCH || 'main';

	if (!token || !owner || !repo) {
		throw new Error('Missing required env vars: GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO');
	}

	return { token, owner, repo, branch };
}

/**
 * Read a JSON file from the GitHub repo.
 * @param {string} path - e.g. 'auth.json'
 * @returns {Promise<{content: any, sha: string} | null>} null if file doesn't exist
 */
export async function readJsonFile(path) {
	const { token, owner, repo, branch } = getConfig();

	const res = await fetch(
		`https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`,
		{
			headers: {
				Authorization: `token ${token}`,
				Accept: 'application/vnd.github.v3+json'
			}
		}
	);

	if (res.status === 404) return null;

	if (!res.ok) {
		throw new Error(`GitHub API error reading ${path}: ${res.status} ${await res.text()}`);
	}

	const data = await res.json();
	const content = JSON.parse(atob(data.content));
	return { content, sha: data.sha };
}

/**
 * Write (create or update) a JSON file in the GitHub repo.
 * @param {string} path
 * @param {any} data - object to JSON.stringify
 * @param {string} message - commit message
 * @param {string | null} sha - current SHA for updates; null for creation
 * @returns {Promise<{sha: string}>} the new file SHA
 */
export async function writeJsonFile(path, data, message, sha) {
	const { token, owner, repo, branch } = getConfig();

	/** @type {Record<string, any>} */
	const body = {
		message,
		content: btoa(JSON.stringify(data, null, 2)),
		branch
	};

	if (sha) {
		body.sha = sha;
	}

	const res = await fetch(
		`https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
		{
			method: 'PUT',
			headers: {
				Authorization: `token ${token}`,
				Accept: 'application/vnd.github.v3+json',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(body)
		}
	);

	if (!res.ok) {
		const text = await res.text();
		throw new Error(`GitHub API error writing ${path}: ${res.status} ${text}`);
	}

	const result = await res.json();
	return { sha: result.content.sha };
}

/**
 * Atomically read-modify-write a JSON file. Retries once on SHA conflict (409).
 * @param {string} path
 * @param {(current: any | null) => any} updater - receives current content (or null if file doesn't exist)
 * @param {string} message - commit message
 */
export async function updateJsonFile(path, updater, message) {
	for (let attempt = 0; attempt < 2; attempt++) {
		const existing = await readJsonFile(path);
		const newContent = updater(existing?.content ?? null);

		try {
			await writeJsonFile(path, newContent, message, existing?.sha ?? null);
			return;
		} catch (err) {
			if (attempt === 0 && /** @type {Error} */ (err).message.includes('409')) {
				continue;
			}
			throw err;
		}
	}
}
