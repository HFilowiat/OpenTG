export type HardwareProject = {
	id: string;
	name: string;
	teamId: string;
	progress: number;
	developerId: string;
	phase: 'Design' | 'Production' | 'Production-Test' | 'Release';
	featuresIds: string[];
	clockSpeed: { min: number; max: number };
	manufactorerId: string;
};

export function createHardwareProject(): HardwareProject { 
	return {
		id: crypto.randomUUID(),
		name: '',
		teamId: '',
		progress: 0,
		developerId: '',
		phase: 'Design',
		featuresIds: [],
		clockSpeed: { min: 0, max: 0 },
		manufactorerId: ''
	};
}