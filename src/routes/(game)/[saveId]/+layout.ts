import { base } from '$app/paths';
import { redirect } from '@sveltejs/kit';

export async function load({ params }) {
	// This code is specific to itch.io as it starts at /index.html which is
	// handled by this slug rather than actual index.html page which is just /
	if (params.saveId === 'index.html') {
		throw redirect(301, `${base}/`);
	}

	const saveId: IDBValidKey = parseInt(params.saveId);

	return { saveId };
}
