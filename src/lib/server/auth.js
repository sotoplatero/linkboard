/**
 * Hash a password with a random salt using SHA-256.
 * @param {string} password
 * @returns {Promise<string>} "hexSalt:hexHash" format
 */
export async function hashPassword(password) {
	const salt = crypto.getRandomValues(new Uint8Array(16));
	const saltHex = toHex(salt);

	const data = new TextEncoder().encode(saltHex + password);
	const hashBuffer = await crypto.subtle.digest('SHA-256', data);
	const hashHex = toHex(new Uint8Array(hashBuffer));

	return `${saltHex}:${hashHex}`;
}

/**
 * Verify a password against a stored "salt:hash" string.
 * @param {string} password
 * @param {string} storedHash
 * @returns {Promise<boolean>}
 */
export async function verifyPassword(password, storedHash) {
	const [saltHex, expectedHash] = storedHash.split(':');
	if (!saltHex || !expectedHash) return false;

	const data = new TextEncoder().encode(saltHex + password);
	const hashBuffer = await crypto.subtle.digest('SHA-256', data);
	const hashHex = toHex(new Uint8Array(hashBuffer));

	return hashHex === expectedHash;
}

/** @param {Uint8Array} bytes */
function toHex(bytes) {
	return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}
