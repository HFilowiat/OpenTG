import { get } from 'svelte/store';
import type { JobTitles } from '../enums/JobTitles';
import { gameFeatures, teams } from '../stores/Stores';

export type Feature = {
	id: string;
	tag: string;
	name: string;
	category: string;
	description: string;
	points: number;
	pointScale: number[];
	requiredSkill: (keyof typeof JobTitles)[];
	releaseDate: Date;
	instructionPerCycle: number;
	requiredPointsToUnlock: number;
	requiredPointsResearched: number;
	isBeingResearched: boolean;
	dependency: string[];

	gridX: number;
	gridY: number;

	requirements: { processing: number; graphics: number; storage: number; memory: number };

	include: string[];
	exclude: string[];
};

export function createFeature(): Feature {
	return {
		id: crypto.randomUUID(),
		tag: '',
		name: '',
		category: '',
		description: '',
		points: 0,
		pointScale: [],
		requiredSkill: [],
		releaseDate: new Date(),
		instructionPerCycle: 0,
		requiredPointsToUnlock: 0,
		requiredPointsResearched: 0,
		isBeingResearched: false,
		dependency: [],

		gridX: 0,
		gridY: 0,

		requirements: {
			processing: 0,
			graphics: 0,
			storage: 0,
			memory: 0
		},

		include: [],
		exclude: []
	};
}

export function estimateFeatureRequirements(feature: Feature, multiplier: number) {
	return {
		processing: feature.requirements.processing * multiplier,
		graphics: feature.requirements.graphics * multiplier,
		storage: feature.requirements.storage * multiplier,
		memory: feature.requirements.memory * multiplier
	};
}

export function isFeatureResearched(feature: Feature): boolean {
	return feature.requiredPointsResearched >= feature.requiredPointsToUnlock;
}

export function getFeatureDependency(feature: Feature) {
	return get(gameFeatures).filter((f) => feature.dependency.includes(f.tag));
}

export function getFeatureDependencyAll(feature: Feature): Feature[] {

	let dep: Feature[] = [];

	for (const f of getFeatureDependency(feature)) {
		dep = [...dep, f, ...getFeatureDependencyAll(f)];
	}

	return dep;
}

export function isFeatureRevealed(feature: Feature): boolean {
	const isAllDependenciesResearched = getFeatureDependencyAll(feature)
		.map((f) => isFeatureResearched(f))
		.every((v) => v === true);

	return isAllDependenciesResearched;
}

export function featureRunStep(feature: Feature, currentTime: Date) {
	if (feature.isBeingResearched === false) return feature;

	if (isFeatureResearched(feature)) feature.isBeingResearched = false;

	const team = get(teams).find((team) => team.type.includes('research'));

	team?.employees.forEach((employee) => {
		const energyPoints = employee.energy;
		feature.requiredPointsResearched += energyPoints;
		employee.energy -= energyPoints;

		if (feature.requiredPointsResearched > feature.requiredPointsToUnlock) {
			feature.requiredPointsResearched = feature.requiredPointsToUnlock;
		}
	});


	return feature;
}
