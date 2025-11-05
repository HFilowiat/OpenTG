export const genres = [
	'Strategy',
	'Simulation',
	'Adventure',
	'Role-playing',
	'Action',
	'Puzzle',
	'Racing',
	'Sports'
] as const;

export type Genre = (typeof genres)[number];
