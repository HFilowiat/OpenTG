import type { EmployeeData } from '../interfaces/EmployeeData';

export type Team = {
	id: string;
	name: string;
	employees: EmployeeData[];
	companyId: IDBValidKey;
	type: ('dev' | 'research')[];
}

export function createTeam() : Team { 
	return {
		id: crypto.randomUUID(),
		name: '',
		employees: [],
		companyId: -1,
		type: ['dev', 'research']
	};
}


export function constructorTeam(name?: string, employees?: EmployeeData[]) {
	const team = createTeam();
	if (name) team.name = name;
	if (employees) team.employees = employees;
	return team;
}