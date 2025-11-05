export type Company = {
	id: string;
	name: string;
	owner: 'player' | 'competition';
	type: 'PUBLIC_COMPANY' | 'PRIVATE_COMPANY';
	location: string;
}

export function createCompany(): Company {
	return {
		id: crypto.randomUUID(),
		name: '',
		owner: 'player',
		type: 'PRIVATE_COMPANY',
		location: 'Sunnyvale, California'
	};
}
