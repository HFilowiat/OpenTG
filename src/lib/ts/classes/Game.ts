import type { Advertising } from '../interfaces/Advertising';
import { SoftwareReleaseLifeCycle } from '../enums/SoftwareReleaseLifeCycle';
import { cash } from '../stores/Cash';
import { generateTwoWord } from './Generator';
import { Random } from '../namespaces/Random';
import { get } from 'svelte/store';
import { Utility } from '../namespaces/Utility';
import { STARTING_DATE, time } from '../stores/Stores';
import { publishers, teams, gameProjects, platforms, gameFeatures } from '$lib/ts/stores/Stores';
import { createNewsWithProp } from './News';
import { type Platform } from './Platform';
import { genres, type Genre } from '../types/Genre';
import genreCompatibilityMatrix from '$lib/assets/data/data_genre_compatibility_matrix.json';

export type Game = {
	id: string;
	name: string;
	progress: number;
	phase: SoftwareReleaseLifeCycle;
	bugs: number;
	hype: number;
	ads: Advertising[];
	totalUnitsSold: number;
	releaseDate: Date;
	discontinueCounter: number;
	salesData: [number, number][];
	last60daysSalesDataWindow: [number, number][];
	price: number;
	unitcost: number;
	gamesize: number;
	distributionMethod: 'Self Publish' | 'Publisher';
	distributionMedia: 'ROM Cartridge' | 'Floppy Disk' | 'Cassette Tape';
	platformIds: IDBValidKey[];
	genres: Genre[];
	teamId: string;
	developerId: string;
	publisherId: string;
	publisherRoyalies: number;
	featuresIds: string[];
	featureProgress: { [key: number]: number };
};

const competitorCompanies = generateCompanies();
let genreFactorMatrix: MultiMap<[string, string], number>;

export function createGame(): Game {
	return {
		id: crypto.randomUUID(),
		name: '',
		progress: 0,
		phase: SoftwareReleaseLifeCycle.PreAlpha,
		bugs: 0,
		hype: 0,
		ads: [],
		totalUnitsSold: 0,
		releaseDate: new Date(),
		discontinueCounter: 0,
		salesData: [],
		last60daysSalesDataWindow: [],
		price: 0,
		unitcost: 0,
		gamesize: 0,
		distributionMethod: 'Self Publish',
		distributionMedia: 'Floppy Disk',
		platformIds: [],
		genres: [],
		teamId: '',
		developerId: '',
		publisherId: '',
		publisherRoyalies: 0,
		featuresIds: [],
		featureProgress: {}
	};
}

export function addAdvertising(game: Game, ad: Advertising, slots: number) {
	ad.slots ??= slots;

	if (game.ads.filter((x) => x.type === ad.type).length > 0) {
		const oldAd = game.ads.find((x) => x.type === ad.type);
		if (oldAd) oldAd.slots += slots;
	} else {
		game.ads = [...game.ads, ad];
	}

	const adCost = slots * ad.costPerSlot;
	cash.add('Advertising', -adCost);
}

function generateCompanies() {
	let companies = [];

	for (let i = 0; i < 100; i++) {
		const name = generateTwoWord();

		companies.push({ id: i, name });
	}

	return companies;
}

export function generateCompetitorGames() {
	calculateGenreFactorMatrix();

	let generatedData: Game[] = [];

	for (let i = 0; i < 40; i++) {
		generatedData.push(generateRandomGame());
	}

	const oldestGame = generatedData.sort(
		(a, b) => a.releaseDate.getTime() - b.releaseDate.getTime()
	)[0];

	if (!oldestGame) return;

	const time = oldestGame.releaseDate;
	const iterationCount = Utility.countDays(time, STARTING_DATE) * 24;

	console.log(`Simulating for ${iterationCount} hours`);

	for (let i = 0; i < iterationCount; i++) {
		generatedData.forEach((g) => {
			runStep(g, time);
		});

		// add one day
		time.setHours(time.getHours() + 1);
	}

	return generatedData;
}

export function generateRandomGame(): Game {
	const name = generateTwoWord();
	const sortedPlatforms = get(platforms).sort(
		(a, b) => a.releaseDate.getTime() - b.releaseDate.getTime()
	);

	const oldestPlatform = sortedPlatforms[0];

	if (oldestPlatform === undefined) throw new Error('Oldest platform is not set');

	const minPlatformReleaseDate = oldestPlatform.releaseDate;

	const platform = get(platforms)
		.filter(
			(platform) =>
				platform.releaseDate >= minPlatformReleaseDate && platform.releaseDate <= STARTING_DATE
		)
		.random();

	if (platform === undefined) {
		throw new Error('platform is not defined');
	}

	const developer = competitorCompanies.random().name;
	const genre = genres.random();
	const gamesize = Random.RangeInt(1, 6);
	let releaseDate = get(time);

	if (releaseDate === STARTING_DATE) {
		releaseDate = new Date(
			Random.RangeInt(minPlatformReleaseDate.getTime(), STARTING_DATE.getTime())
		);

		if (releaseDate < platform.releaseDate) {
			releaseDate = new Date(platform.releaseDate);
		}
	}

	const game: Game = create(name, [platform.id], [genre], undefined, developer);
	game.phase = SoftwareReleaseLifeCycle.Release;
	game.releaseDate = new Date(releaseDate);
	game.gamesize = gamesize;
	game.price = Random.Range(6, 40);
	game.distributionMedia = 'Floppy Disk';
	const features = get(gameFeatures);

	game.featureProgress[features.random().id] = Random.RangeInt(200, 1000);
	game.featuresIds = [...Object.keys(game.featureProgress)];

	return game;
}

export function create(
	name: string,
	platformIds: IDBValidKey[],
	genre: string[],
	teamId?: string,
	developerId?: string,
	featuresIds?: string[]
) {
	teamId ??= Random.UniqueID();
	developerId ??= 'MYCOMPANY';
	featuresIds ??= [];

	const game = createGame();
	game.phase = SoftwareReleaseLifeCycle.PreAlpha;

	game.distributionMethod = 'Self Publish';
	game.distributionMedia = 'Cassette Tape';
	game.platformIds = platformIds;
	game.genres = genre;
	game.teamId = teamId;
	game.developerId = developerId;
	game.name = name;
	game.publisherId = 'SELF';
	game.featuresIds = featuresIds;
	game.featureProgress = featuresIds.reduce((acc, id) => {
		acc[id] = 0;
		return acc;
	}, {});

	return game;
}

export function discontinueGame(game: Game) {
	game.phase = SoftwareReleaseLifeCycle.Discontinue;

	const news = createNewsWithProp(game.name, new Date(get(time)), 'PRODUCT_DISCONTINUED');

	gameProjects.refresh();
}

export function releaseGame(game: Game): void {
	game.phase = SoftwareReleaseLifeCycle.Release;
	game.releaseDate = new Date(get(time));

	const news = createNewsWithProp(game.name, new Date(game.releaseDate), 'PRODUCT_RELEASED');

	gameProjects.refresh();
}

export function getTotalSale(game: Game): number {
	return game.salesData.reduce((value, data) => (value += data[1]), 0);
}

export function getTotalSaleLast30Days(game: Game): {
	range: number;
	value: number;
} {
	let days = 1;

	if (game.last60daysSalesDataWindow.length === 60) {
		days = 30;
	}

	if (game.last60daysSalesDataWindow.length < 60 && game.last60daysSalesDataWindow.length >= 14) {
		days = 7;
	}

	if (days === 1) {
		return { range: 1, value: 0 };
	}

	const pre = game.last60daysSalesDataWindow
		.slice(-days * 2, -days)
		.reduce((acc, current) => acc + current[1], 0);
	const curr = game.last60daysSalesDataWindow
		.slice(-days)
		.reduce((acc, current) => acc + current[1], 0);
	const percentageIncrease = ((curr - pre) / curr) * 100;

	if (curr === 0 && pre === 0) {
		return { range: 1, value: 0 };
	}

	if (days === 7) {
		return { range: 7, value: percentageIncrease };
	}

	return { range: 30, value: percentageIncrease };
}

export function getGameFeatureProgress(game: Game) {
	const features = get(gameFeatures).filter((item) => game.featuresIds.includes(item.id));

	const featureWithPoints = features.map((x) => ({
		points: game.featureProgress[x.id] || 0,
		category: x.category,
		pointScale: x.pointScale.map((x) => x * game.gamesize)
	}));

	function mapToScaleLevel(number: number, scale: number[]) {
		let level = 0;

		scale.forEach((s, i) => {
			if (number > s) {
				level = i + 1;
			}
		});

		return level;
	}

	const featureScaleLevel: [string, number, number, number[]][] = featureWithPoints.map((x) => [
		x.category,
		mapToScaleLevel(x.points, x.pointScale),
		x.points,
		x.pointScale
	]);
	const mapObject = new Map();

	featureScaleLevel.forEach(([catgory, level, points, pointScale]) => {
		if (mapObject.has(catgory)) {
			mapObject.set(catgory, {
				level: mapObject.get(catgory).level + level,
				points: mapObject.get(catgory).points + points,
				pointScale: mapObject.get(catgory).pointScale.map((z, i) => pointScale[i] + z)
			});
		} else {
			mapObject.set(catgory, { level, points, pointScale });
		}
	});

	return Array.from(mapObject);
}

export function runHypeStep(game: Game, currentTime: Date): Game {
	if (game.ads.length > 0) {

		game.ads.forEach((ad) => {
			if (ad.slots > 0) {
				const generatedHype = Math.floor(ad.costPerSlot / 5);
				ad.slots -= 1;

				game.hype += generatedHype;
			} else {
				game.ads = game.ads.filter((a) => a.type !== ad.type);
			}
		});
	}

	if (game.hype > 0) {
		const daysFromRelease = Utility.countDays(game.releaseDate, currentTime) + 1;
		const hypeEffectiveness = Math.max(
			-Math.abs(Math.sqrt(Math.max(daysFromRelease, 1) / 90) + 2),
			0.98
		);
		game.hype = Math.floor(
			game.hype * hypeEffectiveness + Math.log(game.hype) * 2 * Random.Random01()
		);
	}

	if (game.hype < 0) {
		game.hype = 0;
	}

	return game;
}

export function runStep(game: Game, currentTime: Date): Game {
	if (
		game.phase === SoftwareReleaseLifeCycle.PreAlpha ||
		game.phase === SoftwareReleaseLifeCycle.Alpha ||
		game.phase === SoftwareReleaseLifeCycle.Beta
	) {
		const team = get(teams).find((t) => t.id === game.teamId);

		if (team === undefined) throw new Error('team is not set');

		const employees = team.employees;

		const features = get(gameFeatures).filter((item) => game.featuresIds.includes(item.id));

		employees.forEach((e) => {

			if (e.energy > 0) {
				const featureToWorkOn = features.random();
				const featureRequiredSkill = featureToWorkOn.requiredSkill as string[];

				const phaseMultiplierMap = new Map([
					[SoftwareReleaseLifeCycle.PreAlpha, 1],
					[SoftwareReleaseLifeCycle.Alpha, 1],
					[SoftwareReleaseLifeCycle.Beta, 0.7]
				]);

				const phaseMultiplier = phaseMultiplierMap.get(game.phase);

				if (phaseMultiplier === undefined)
					throw new Error('Phase does not map to multiplier number');

				// get the XP of highest employee skill that is in required feature skill
				const employeeExperiance = e.experiance.filter((exp) =>
					featureRequiredSkill.includes(exp.jobTitle)
				);
				// if employee does not have sufficent skill use default xp, should be a non zero and small number.
				let xp = 1;

				if (employeeExperiance.length > 0)
					xp = employeeExperiance.sort((a, b) => b.xp - a.xp)[0]?.xp || 0;

				const points =
					(Random.RangeInt(1, e.effects.productivity) + e.effects.extraProductivity) *
					xp *
					(1 + Random.Random01());

				game.featureProgress[featureToWorkOn.id] += points * phaseMultiplier;

				e.energy -= 1.5 * Random.Random01();

				if (
					game.phase === SoftwareReleaseLifeCycle.PreAlpha ||
					game.phase === SoftwareReleaseLifeCycle.Alpha
				) {
					// less energy has higher probability of making mistakes
					game.bugs += Random.RangeInt(0, Math.floor(e.maxenergy / e.energy));
				} else {
					game.bugs += Math.floor(Random.RangeInt(0, Math.floor(e.maxenergy / e.energy)) / 20);
				}

				if (game.phase === SoftwareReleaseLifeCycle.Beta) {
					game.bugs -= Random.RangeInt(0, Math.floor(e.energy)) * 10;
				} else {
					game.bugs -= Random.RangeInt(0, Math.floor(e.energy));
				}

				if (game.bugs < 0) {
					game.bugs = 0;
				}
			}
		});

		const fprogress = getGameFeatureProgress(game);

		const level2pointScale = fprogress.reduce((p, v) => {
			p += v[1].pointScale[1];
			return p;
		}, 0);

		const sumOfFeatureProgress = Object.values(game.featureProgress).reduce((p, v) => {
			p += v;
			return p;
		}, 0);

		game.progress = sumOfFeatureProgress / level2pointScale;

		if (game.progress >= 1 / 3) {
			game.phase = SoftwareReleaseLifeCycle.Alpha;
		}

		if (game.progress >= 2 / 3) {
			game.phase = SoftwareReleaseLifeCycle.Beta;
		}
	} else if (game.phase === SoftwareReleaseLifeCycle.Release) {
		if (!game.releaseDate) game.releaseDate = new Date(currentTime);

		if (game.distributionMethod === 'Publisher') {
			const averageGamePriceAceptablityforgamesizeInPercentage = new Map([
				[1, 0.3],
				[2, 0.5],
				[3, 0.7],
				[4, 0.8],
				[5, 0.9],
				[6, 1]
			]);

			const priceAcceptibility = averageGamePriceAceptablityforgamesizeInPercentage.get(
				game.gamesize
			);

			if (priceAcceptibility === undefined) throw new Error('Game size does not map to price');

			game.price = Math.max(Random.RangeInt(18, 35 * priceAcceptibility), 14);
		}

		sellGame(game, currentTime);
	} else if (game.phase === SoftwareReleaseLifeCycle.ScheduleToDiscontinue) {
		game.discontinueCounter++;

		if (
			game.discontinueCounter >= 120 &&
			game.phase === SoftwareReleaseLifeCycle.ScheduleToDiscontinue
		) {
			discontinueGame(game);
		}
	}

	return game;
}

function getGamePlatforms(game: Game) {
	const allPlatforms = get(platforms);

	const gamePlatforms: Platform[] = allPlatforms.reduce((list: Platform[], p: Platform) => {
		if (game.platformIds.includes(p.id)) {
			list.push(p);
		}

		return list;
	}, []);

	return gamePlatforms;
}

function sellGame(game: Game, currentTime: Date) {
	const platforms: Platform[] = getGamePlatforms(game);

	if (game.developerId === 'MYCOMPANY') {
		// daily calculation
		if (currentTime.getHours() === 0) {
			let avgFeatureScale = getAverageFeatureScale(game);

			const averageGamePriceAcceptabilityForGameSizeInPercentage = new Map([
				[1, 0.2],
				[2, 0.4],
				[3, 0.5],
				[4, 0.6],
				[5, 0.8],
				[6, 1]
			]);

			const priceAcceptability = averageGamePriceAcceptabilityForGameSizeInPercentage.get(
				game.gamesize
			);

			if (priceAcceptability === undefined) throw new Error('Game size does not map to price');

			const platform = platforms[0];

			if (platform === undefined) throw new Error('Platform is not set');

			const averagePrice = platform.averageGamePrice.value * priceAcceptability;

			const maxFeatureScale = 4;
			const priceAcceptiblityFactor =
				(averagePrice / game.price) * (avgFeatureScale / (maxFeatureScale / 2));

			const population = platform.unitsold;

			// number of people that do not own the game now
			const popThatDoesNotOwnACopy = Math.max(0, population - game.totalUnitsSold);

			const genreFactor = getGenreFactor(game);

			const publisherSizeEffectOnPopAwarness = {
				small: 0.01,
				medium: 0.03,
				large: 0.05,
				giant: 0.1,
				global: 0.15
			};

			const currentPublisher = get(publishers).filter((pub) => pub.id === game.publisherId)[0];

			if (game.distributionMethod === 'Publisher' && currentPublisher === undefined)
				throw new Error('publisher is not set');

			const maxpopawarnesspercent =
				(game.distributionMethod === 'Self Publish'
					? 0.001
					: publisherSizeEffectOnPopAwarness[currentPublisher.size]) +
				avgFeatureScale / maxFeatureScale / 10;


			const popThatIsHyped = game.hype;
			// at least 5% of pop might buy.
			const maxPopLowerBound = Math.floor(popThatIsHyped * 0.05);

			const maxPop = Math.floor(
				Random.RangeInt(
					maxPopLowerBound,
					popThatDoesNotOwnACopy * maxpopawarnesspercent * game.gamesize * genreFactor
				)
			);

			// at least 1% of pop might buy.
			const minPopUpperBound = Math.floor(popThatIsHyped * 0.01);

			const minPop = Random.RangeInt(0, minPopUpperBound);
			const numberOfPeopleWhoAreInterested = Random.RangeInt(minPop, maxPop);

			let unitsSold = Math.floor(
				numberOfPeopleWhoAreInterested * Math.min(priceAcceptiblityFactor, 1)
			);

			// unit sold might be negative, clamp it
			if (unitsSold < 0) unitsSold = 0;

			if (unitsSold >= 1) {
				// reset dicontinue counter
				game.discontinueCounter = 0;
			} else {
				game.discontinueCounter++;
			}

			// if project does not sell for 3 month discontinue it
			if (game.discontinueCounter >= 90) {
				game.phase = SoftwareReleaseLifeCycle.ScheduleToDiscontinue;
			}

			game.totalUnitsSold += unitsSold;
			reportUnitSales(game, unitsSold, currentTime);
		}
	} else {
		sellOtherCompanyProject(game, platforms, currentTime);
	}
}

function getAverageFeatureScale(game: Game) {
	const features = get(gameFeatures).filter((item) => game.featuresIds.includes(item.id));

	let avgFeatureScale = 0;

	for (const feature of features) {
		const points = game.featureProgress[feature.id] || 0;

		if (points > feature.pointScale[3]) {
			avgFeatureScale += 4;
		} else if (points > feature.pointScale[2]) {
			avgFeatureScale += 3;
		} else if (points > feature.pointScale[1]) {
			avgFeatureScale += 2;
		} else if (points > feature.pointScale[0]) {
			avgFeatureScale += 1;
		}
	}

	avgFeatureScale /= features.length;

	return avgFeatureScale;
}

function reportUnitSales(game: Game, unitsSold: number, currentTime: Date) {
	const salesReport = unitsSold * (game.price - game.unitcost);
	// report in monthly bases
	const reportingDate = new Date(currentTime.getFullYear(), currentTime.getMonth()).getTime();

	if (game.distributionMethod === 'Self Publish') {
		let index = game.salesData.findIndex((item) => item[0] === reportingDate);

		if (index !== -1) {
			game.salesData[index][1] += salesReport;
		} else {
			game.salesData.push([reportingDate, salesReport]);
		}

		game.last60daysSalesDataWindow.push([reportingDate, salesReport]);
		game.last60daysSalesDataWindow = game.last60daysSalesDataWindow.slice(-60);

		cash.add(game.name, salesReport);
	} else {
		let index = game.salesData.findIndex((item) => item[0] === reportingDate);

		if (index !== -1) {
			game.salesData[index][1] += salesReport - salesReport * game.publisherRoyalies;
		} else {
			game.salesData.push([reportingDate, salesReport - salesReport * game.publisherRoyalies]);
		}

		game.last60daysSalesDataWindow.push([
			reportingDate,
			salesReport - salesReport * game.publisherRoyalies
		]);
		game.last60daysSalesDataWindow = game.last60daysSalesDataWindow.slice(-60);

		cash.add(game.name, salesReport - salesReport * game.publisherRoyalies);
	}
}

function sellOtherCompanyProject(game: Game, platforms: Platform[], currentTime: Date) {
	const platform = platforms[0];

	if (platform === undefined) throw new Error('Platform is not set');

	const population = platform.unitsold;
	const popThatDoesNotOwnACopy = Math.max(0, population - game.totalUnitsSold);

	const genreFactor = getGenreFactor(game);

	const maxpopawarnesspercent = 0.01;
	const maxPop = Math.floor(
		Random.RangeInt(0, popThatDoesNotOwnACopy * maxpopawarnesspercent * game.gamesize * genreFactor)
	);
	const minPop = Random.RangeInt(0, 1);
	const numberOfPeopleWhoAreInterested = Random.RangeInt(minPop, maxPop);

	game.totalUnitsSold += Math.floor(numberOfPeopleWhoAreInterested * Random.Range(0.01, 0.02));
}

export function calculateGenreFactorMatrix() {
	const realeasedgames = get(gameProjects).filter(
		(g) =>
			g.phase === SoftwareReleaseLifeCycle.Release ||
			g.phase === SoftwareReleaseLifeCycle.ScheduleToDiscontinue
	);

	const allPlatforms = get(platforms).map((x) => x.id);

	let map: MultiMap<[string, string], number> = new Map();

	allPlatforms.forEach((plt) => {
		map.set(plt, new Map());

		const sameplatform = realeasedgames.filter((g) => g.platformIds.includes(plt));

		genres.forEach((gen) => {
			const samegeners = sameplatform.filter((g) => g.genres.includes(gen));
			const sameplatformLength = sameplatform.length || 1;

			const genreFactor = samegeners.length / sameplatformLength;

			map.get(plt)?.set(gen, genreFactor);
		});
	});

	genreFactorMatrix = map;
}

function getAllGenrePairs(game: Game) {
	const pairs = [];
	for (let i = 0; i < game.genres.length; i++) {
		for (let j = i + 1; j < game.genres.length; j++) {
			pairs.push([game.genres[i], game.genres[j]]);
		}
	}
	return pairs;
}

function getGenreFactor(game: Game): number {
	const platformId = game.platformIds[0];
	if (platformId === undefined) throw new Error('Platform is not set');

	const genreCompatibility: Record<Genre, Record<Genre, number>> = genreCompatibilityMatrix;

	const genreCompatibilityScore =
		game.genres.length === 1
			? 1
			: getAllGenrePairs(game)
				.map(([genreA, genreB]) => genreCompatibility[genreA][genreB])
				.reduce((value, x) => value * x, 1);

	const genre = game.genres[0];

	if (genre === undefined) throw new Error('Genere is not set');

	if (!genreFactorMatrix) {
		calculateGenreFactorMatrix();
	}

	const genreMatrix = genreFactorMatrix.get(platformId);

	if (genreMatrix === undefined)
		throw new Error(`Genre matrix is not available for platform: ${platformId}`);

	const genreFactor = genreMatrix.get(genre);

	if (genreFactor === undefined)
		throw new Error(
			`Genre factor is not avialable for platform: ${platformId}, genre: ${genre}, genre factor: ${genreFactor}`
		);

	return genreFactor * genreCompatibilityScore;
}
