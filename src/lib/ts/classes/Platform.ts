import type { Currency } from '$lib/ts/interfaces/Currency';
import { Utility } from '../namespaces/Utility';
import { cash, platforms } from '$lib/ts/stores/Stores';
import { createNewsWithProp } from './News';

export type PlatformSpecs = {
	cpu: {
		speed: number;
		core: number;
		socket: number;
		DIPCC: number;
		bit: number;
	};
	gpu: {
		resolution: {
			width: number;
			height: number;
		};
		maxSprite: number;
		color: number;
	};
	mem: {
		speed: number;
		size: number[];
	};
	media: { capacity: number[]; format: string };
};

export type Platform = {
	id: string;
	tag?: string;
	name: string;
	releaseDate: Date;
	discontinued: Date;
	isReleased: boolean;
	isDiscontinued: boolean;
	generation: number;
	units: [Date, number][];
	unitsold: number;
	imagesrc: string;
	averageGamePrice: Currency;
	media: 'ROM Cartridge' | 'Floppy Disk' | 'Cassette Tape'[];
	license: { bought: boolean; costPerYear: number; expires: Date };

	specs: PlatformSpecs;
};

export function createPlatform(): Platform {
	return {
		id: crypto.randomUUID(),
		tag: undefined,
		name: '',
		releaseDate: new Date(),
		discontinued: new Date(),
		isReleased: false,
		isDiscontinued: false,
		generation: 0,
		units: [],
		unitsold: 0,
		imagesrc: '',
		averageGamePrice: { currency: 'USD', value: 0 },
		media: [],
		license: {
			bought: false,
			costPerYear: 20000,
			expires: new Date()
		},
		specs: {
			cpu: {
				speed: 1193525.28, core: 1, socket: 1,
				DIPCC: 0,
				bit: 0
			},
			gpu: {
				resolution: {
					width: 0,
					height: 0
				},
				maxSprite: 0,
				color: 0
			},
			mem: {
				size: [128],
				speed: 0
			},
			media: { capacity: [131072, 262144, 524288], format: "" }
		}
	};
}

export function getSystemSpecs(platform: Platform): {
	processing: number;
	graphics: number;
	storage: number;
	memory: number;
} {
	const dmips =
		platform.specs.cpu.core *
		platform.specs.cpu.speed *
		platform.specs.cpu.socket *
		platform.specs.cpu.DIPCC;
	const cp = (dmips * Math.sqrt(platform.specs.cpu.bit)) / 10000;

	if (platform.specs.gpu.maxSprite === 0) {
		platform.specs.gpu.maxSprite = 1;
	}

	const gp =
		(platform.specs.gpu.resolution.width *
			platform.specs.gpu.resolution.height *
			Math.sqrt(platform.specs.gpu.maxSprite) *
			Math.sqrt(platform.specs.gpu.color) *
			(platform.generation + 1)) /
		10000;

	const mem = Math.min(...platform.specs.mem.size);
	const mediaCapacity = Math.max(...platform.specs.media.capacity);

	return {
		processing: cp,
		graphics: gp,
		storage: mediaCapacity,
		memory: mem
	};
}

export function calculateUnitSold(platform: Platform, date: Date): number {
	let unitsold: [Date, number][] = platform.units;
	let prev: [Date, number], next: [Date, number];

	for (let i = 0; i < unitsold.length; i++) {
		const [indexTimestamp, value] = unitsold[i];

		if (indexTimestamp >= date) {
			next = unitsold[i];
			prev = unitsold[i - 1];
			break;
		}
	}

	let value = 0;

	if (!prev && next) {
		value = 0;
	} else if (prev && next) {
		const perc = Utility.countDays(prev[0], date) / Utility.countDays(prev[0], next[0]);
		value = Utility.lerp(prev[1], next[1], perc);
	} else {
		next = unitsold[unitsold.length - 1];
		value = next[1];
	}

	return value;
}

export function platformRunStep(platform: Platform, currentTime: Date) {
	platform.unitsold = calculateUnitSold(platform, currentTime);

	if (!platform.isReleased && currentTime >= platform.releaseDate) {
		platformRelease(platform);
	}

	if (!platform.isDiscontinued && currentTime >= platform.discontinued) {
		platformDiscontinue(platform);
	}
}

export function platformRunStepYearly(platform: Platform) {
	if (
		platform.license.bought &&
		platform.license.costPerYear &&
		platform.isDiscontinued === false
	) {
		cash.add(`${platform.name} License`, -platform.license.costPerYear);
	}
}

export function platformDiscontinue(platform: Platform) {
	const news = createNewsWithProp(
		platform.name,
		new Date(platform.discontinued),
		'PRODUCT_DISCONTINUED'
	);

	platform.isDiscontinued = true;
	platforms.update(platform);
}

export function platformRelease(platform: Platform) {
	const news = createNewsWithProp(
		platform.name,
		new Date(platform.releaseDate),
		'PRODUCT_RELEASED'
	);

	platform.isReleased = true;
	platforms.update(platform);
}

export function buyLicense(platform: Platform) {
	platform.license.bought = true;
	cash.add(`${platform.name} License`, -platform.license.costPerYear);
	platforms.update(platform);
}
