import bcrypt from 'bcryptjs';

export function hash(pass) {
	const promise =  new Promise((resolve, reject) => {
		bcrypt.hash(pass, 10, (err, result) => {
			if (err) {
				reject (err);
			}
			else {
				resolve(result)
			}
		});
	});
	return promise;
}

export function compare(pass, hash) {
	const promise =  new Promise((resolve, reject) => {
		bcrypt.compare(pass, hash, (err, result) => {
			if (err) {
				reject (err);
			}
			else {
				resolve(result)
			}
		});
	});
	return promise;
}