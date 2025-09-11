import crypto from 'crypto';

export function hash(password) {
	const salt = crypto.randomBytes(16).toString('base64');
	const hash = crypto.createHmac('sha512', salt).update(password).digest('base64');
	return `${salt}:${hash}`
}

export function compare(hashed, password) {
	const [salt, compareHash] = hashed.split(':');
	const hash = crypto.createHmac('sha512', salt).update(password).digest('base64');
	if (hash === compareHash) return true;
	return false;
}