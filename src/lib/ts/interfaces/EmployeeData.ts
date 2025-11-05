import type { Person } from './Person';

export interface EmployeeData extends Person {
	energy: number;
	maxenergy: number;
	experiance: { jobTitle: string; xp: number }[];
	jobTitle: string;
	salary: number;
	portrait: any;
	id: string;
	isPlayer: boolean;
}
