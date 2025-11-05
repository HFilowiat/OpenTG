import { generateFullName, generatePortrait } from '$lib/ts/classes/Generator';
import { Random } from '$lib/ts/namespaces/Random';
import type { Sex } from '$lib/ts/enums/Sex';
import { JobTitles } from '../enums/JobTitles';
import type { EmployeeData } from '../interfaces/EmployeeData';

export namespace Employee {
	const jobs: Record<keyof typeof JobTitles, { averageSalary: { US: number } }> = {
		Designer: { averageSalary: { US: 6000 } },
		Programmer: { averageSalary: { US: 4000 } },
		Artist: { averageSalary: { US: 5000 } },
		AudioEngineer: { averageSalary: { US: 7000 } },
		Producer: { averageSalary: { US: 5000 } },
		Director: { averageSalary: { US: 7000 } },
		Writer: { averageSalary: { US: 4400 } }
	};

	export const create = (
		jobTitle: keyof typeof JobTitles,
		isPlayer: boolean = false,
		fullName?: string,
		sex?: Sex,
		salary?: number,
		portrait?: any
	): EmployeeData => {
		const randomJobs: string[] = Object.keys(JobTitles).filter(
			(k) => Random.Random01() < 0.5 || k === jobTitle
		);
		const salaryofjob = jobs[jobTitle];

		//if salary is null or underfined, randomly pick a salary close to average salary
		salary ??= Math.round(salaryofjob.averageSalary.US * Random.Range(0.5, 1.5));
		sex ??= <Sex>Random.RangeInt(0, 2);
		fullName ??= generateFullName(sex);
		portrait ??= generatePortrait();

		const object: EmployeeData = {
			energy: 10,
			maxenergy: 10,
			experiance: randomJobs.map((job) => {
				return { jobTitle: job, xp: Random.RangeInt(1, 5) };
			}),
			jobTitle,
			salary,
			sex,
			nationality: Random.RangeInt(0, 1),
			dateOfBirth: new Date(),
			placeOfBirth: '',
			fullName,
			effects: { productivity: Random.RangeInt(1, 2), extraProductivity: 0 },
			portrait,
			id: Random.UniqueID(),
			isPlayer
		};

		return object;

	};
}
