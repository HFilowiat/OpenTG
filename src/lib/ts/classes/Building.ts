import { buildings, cash } from '../stores/Stores';

export type Building = {
	id: string;
	buildingType: 'Studio' | 'Factory' | 'Generic';
	location: string;
	propertyState: 'Lease' | 'Buy';
	propertyType: 'Office' | 'Industrial' | 'Retail' | 'Land' | 'Mixed Use';
	leasingCost: number;
	buyingCost: number;
	isBought: boolean;
	isLeased: boolean;
	leaseDuration: number;
	spaces: { spaceType: string; size: number; quantity: number }[];
}

export function createBuilding(): Building {
	return {
		id: crypto.randomUUID(),
		buildingType: 'Generic',
		location: '',
		propertyState: 'Lease',
		propertyType: 'Office',
		leasingCost: 0,
		buyingCost: 0,
		isBought: false,
		isLeased: false,
		leaseDuration: 0,
		spaces: []
	};
}

export function getBuildingRentableSquareMeters(building: Building): number {
	const totalOfficeSpace = building.spaces.reduce((p, c) => (p += c.size * c.quantity), 0);

	const circulation = totalOfficeSpace * 0.4;

	const loadFactor = (totalOfficeSpace + circulation) * 0.2;

	return Math.floor(totalOfficeSpace + circulation + loadFactor);
}

export function getBuildingOfficeSpace(building: Building): number {
	const totalOfficeSpace = building.spaces.reduce((p, c) => (p += c.size * c.quantity), 0);

	return Math.floor(totalOfficeSpace);
}

export function getBuildingOfficeSpacePeople(building: Building): number {
	const people = building.spaces.reduce((p, c) => (p += c.quantity), 0);

	return Math.floor(people);
}

export function buyOrLeaseBuilding(building: Building) {
	if (building.propertyState === 'Lease') {
		cash.add('new office', -building.leasingCost);
		building.isLeased = true;

		buildings.refresh();
	} else {
		cash.add('new office', -building.buyingCost);
		building.isBought = true;

		buildings.refresh();
	}
}

export function buildingEndLease(building: Building) {
	if (building.propertyState === 'Lease' && building.isLeased) {
		building.isLeased = false;
		buildings.refresh();
	}
}

export function buildingRunStep(building: Building, currentDate: Date): any {
	if (building.isLeased) {
		cash.add('Building lease cost', -building.leasingCost);
	}

	if (building.isBought || building.isLeased) {
		const electricityDollarCostPerSquareMeter = 3;
		const buildingSquareMeter = getBuildingRentableSquareMeters(building);
		const electricityCost = Math.floor(electricityDollarCostPerSquareMeter * buildingSquareMeter);
		cash.add('Utility Cost, Electricity', -electricityCost);
	}
}
