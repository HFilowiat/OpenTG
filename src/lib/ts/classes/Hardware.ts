import { Random } from '$lib/ts/namespaces/Random';
import { get } from 'svelte/store';
import type { HardwareProject } from './HardwareProject';
import { teams } from '$lib/ts/stores/Stores';

export namespace Hardware {
	export function runStep(project: HardwareProject): HardwareProject {
		const employees = get(teams)
			.find((t) => t.id === project.teamId)
			.employees.filter((e) => e.jobTitle === 'HardwareEngineer');

		for (let i = 0; i < employees.length; i++) {
			const e = employees[i];

			if (e.energy > 0) {
				const points =
					(Random.RangeInt(1, e.effects.productivity) + e.effects.extraProductivity) *
					e.experiance.find((x) => x.jobTitle === e.jobTitle).xp *
					(0.1 + Random.Random01());
				project.progress += points;

				e.energy -= 1.5 * Random.Random01();
			}
		}

		if (project.phase == 'Release') {
		} else {
			const productionProgressValue = 10;
			if (project.progress > productionProgressValue) {
				project.phase = 'Production';
			} else {
				project.phase = 'Design';
			}
		}

		return project;
	}
}
