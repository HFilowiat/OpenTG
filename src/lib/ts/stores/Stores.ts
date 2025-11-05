import { writable, get, derived } from 'svelte/store';

export { cash } from '$lib/ts/stores/Cash';
import languageJson from '$lib/assets/data/data_language.json';
import { IndexedDBWrapper } from '$lib/ts/IndexedDBWrapper';
import type { Save } from '$lib/ts/types/Save';
import { version } from '$app/environment';
import { type Game } from '$lib/ts/classes/Game';
import { type Company } from '$lib/ts/classes/Company';
import { type Team } from '$lib/ts/classes/Team';
import { type HardwareProject } from '$lib/ts/classes/HardwareProject';
import { type News } from '$lib/ts/classes/News';
import { type Platform } from '$lib/ts/classes/Platform';
import { type Publisher } from '$lib/ts/interfaces/Publisher';
import { type Feature } from '$lib/ts/classes/Feature';
import { type Building } from '$lib/ts/classes/Building';
import { Manifest, Mod } from '$lib/ts/classes/Mod';
import { cash } from '$lib/ts/stores/Cash';

export const saves = indexedDBBackedStoreForSave('saves');
export const gameProjects = indexedDBBackedStore<Game>('games');
export const hardwareProjects = indexedDBBackedStore<HardwareProject>('hardwares');
export const companies = indexedDBBackedStore<Company>('companies');
export const teams = indexedDBBackedStore<Team>('teams');
export const newslist = indexedDBBackedStore<News>('news');
export const platforms = indexedDBBackedStore<Platform>('platforms');
export const publishers = indexedDBBackedStore<Publisher>('publishers');
export const gameFeatures = indexedDBBackedStore<Feature>('game-features');
export const hardwareFeatures = indexedDBBackedStore<Feature>('hardware-features');
export const buildings = indexedDBBackedStore<Building>('buildings');

function modFromObject(record: Record<any, any>): Mod {
	record.manifest = Object.assign(new Manifest(), record.manifest);
	return Object.assign(new Mod(), record);
}

export const mods = indexedDBBackedStoreGlobal<Mod>('mods', modFromObject);

function indexedDBBackedStore<T extends SavableForeignObject>(storeName: string) {
	const currentStore = writable(<T[]>[]);
	const { subscribe, set, update } = currentStore;

	let database: IDBDatabase;

	return {
		set,
		subscribe,
		refresh: () => {
			update((n) => n);
		},

		add: (obj: T): IDBValidKey => {
			obj.id ??= crypto.randomUUID();

			update((array) => {
				array.push(obj);
				return array;
			});

			return obj.id || -1;
		},

		update: (obj: T) => {
			update((n) => n);
		}
	};
}

function indexedDBBackedStoreGlobal<T extends SavableForeignObject>(
	storeName: string,
	fromObject?: (record: Record<any, any>) => T
) {
	const currentStore = writable(<T[]>[]);
	const { subscribe, set, update } = currentStore;
	load();

	async function load() {
		const database = await IndexedDBWrapper.getDB();

		const transaction = database.transaction(storeName, 'readonly');
		const store = transaction.objectStore(storeName);
		const request = store.getAll();

		return new Promise((resolve, reject) => {
			transaction.addEventListener('complete', () => {
				if (fromObject) {
					const result = request.result.map((x) => fromObject(x));
					set(result);
					resolve(result);
				} else {
					set(request.result);
					resolve(request.result);
				}
			});
		});
	}

	return {
		subscribe,
		refresh: () => {
			update((n) => n);
		},

		add: async (obj: T): Promise<IDBValidKey> => {
			const database = await IndexedDBWrapper.getDB();

			return new Promise((resolve, reject) => {
				const transaction = database.transaction(storeName, 'readwrite');
				const store = transaction.objectStore(storeName);
				const request = store.add(obj);

				transaction.addEventListener('complete', () => {
					const id = request.result;
					obj.id = id;

					update((array) => {
						array.push(obj);
						return array;
					});

					resolve(id);
				});
			});
		},

		put: async (obj: T): Promise<IDBValidKey> => {
			const database = await IndexedDBWrapper.getDB();

			return new Promise((resolve, reject) => {
				const transaction = database.transaction(storeName, 'readwrite');
				const store = transaction.objectStore(storeName);
				const request = store.put(obj);

				transaction.addEventListener('complete', () => {
					const id = request.result;

					update((array) => {
						if (array.findIndex((item) => item.id == id) !== -1) {
							return array.map((item) => (item.id == id ? obj : item));
						} else {
							array.push(obj);
							return array;
						}
					});

					resolve(id);
				});
			});
		},

		delete: async (obj: T) => {
			const database = await IndexedDBWrapper.getDB();

			const transaction = database.transaction(storeName, 'readwrite');
			const store = transaction.objectStore(storeName);
			const request = store.delete(IDBKeyRange.only(obj.id));

			transaction.addEventListener('complete', () => {
				update((array) => {
					return array.filter((element) => element.id !== obj.id);
				});
			});
		},

		update: async (obj: T) => {
			const database = await IndexedDBWrapper.getDB();

			const transaction = database.transaction(storeName, 'readwrite');
			const store = transaction.objectStore(storeName);
			const request = store.put(obj);

			return new Promise((resolve, reject) => {
				transaction.addEventListener('complete', () => {
					update((n) => n);
					resolve(true);
				});
			});
		}
	};
}

function indexedDBBackedStoreForSave(storeName: string) {
	const currentStore = writable(<Save[]>[]);
	const { subscribe, set, update } = currentStore;

	let database: IDBDatabase;

	initialize();

	async function initialize() {
		await IndexedDBWrapper.getDB().then((db) => loadAll(db));
	}

	function loadAll(db: IDBDatabase) {
		return new Promise((resolve, reject) => {
			database = db;

			const transaction = database.transaction(storeName, 'readonly');
			const store = transaction.objectStore(storeName);
			const request = store.getAll();

			transaction.addEventListener('complete', () => {
				set(request.result);
				resolve(true);
			});
		});
	}

	let currentSave: Save | undefined;

	return {
		subscribe,
		update: (save: Save) => {
			const transaction = database.transaction(storeName, 'readwrite');
			const store = transaction.objectStore(storeName);
			const request = store.put(save);

			return new Promise((resolve, reject) => {
				transaction.addEventListener('complete', () => {
					update((n) => n);
					resolve(true);
				});
			});
		},

		add: (save: Save): Promise<number> => {
			return new Promise((resolve, reject) => {
				const transaction = database.transaction(storeName, 'readwrite');
				const store = transaction.objectStore(storeName);
				const request = store.add(save);

				transaction.addEventListener('complete', () => {
					const id = request.result;
					save.id = id;

					update((array) => {
						array.push(save);
						return array;
					});

					resolve(<number>id);
				});
			});
		},

		put: (save: Save): Promise<number> => {
			return new Promise((resolve, reject) => {
				const transaction = database.transaction(storeName, 'readwrite');
				const store = transaction.objectStore(storeName);
				const request = store.put(save);

				transaction.addEventListener('complete', () => {
					const id = request.result;

					update((array) => {
						// replace and add new object
						if (array.findIndex((item) => item.id == id) !== -1) {
							return array.map((item) => (item.id == id ? save : item));
						} else {
							array.push(save);
							return array;
						}
					});

					resolve(<number>id);
				});
			});
		},

		async delete(save: Save) {
			return new Promise(async (resolve, reject) => {
				await this.load(save);

				const transaction = database.transaction(storeName, 'readwrite');

				transaction.addEventListener('complete', () => {
					update((array) => {
						return array.filter((element) => element.id !== save.id);
					});

					resolve(true);
				});

				const store = transaction.objectStore(storeName);
				const request = store.delete(IDBKeyRange.only(save.id));
			});
		},

		select: (save: Save | undefined) => {
			currentSave = save;
		},

		current: (): Save | undefined => {
			return get(currentStore).find((element) => element.id === currentSave?.id);
		},

		initialize: initialize,

		loadAll: loadAll,

		load: async (save: Save) => {

			if (saves.current()?.id === save.id) {
				return;
			}

			saves.select(save);

			time.resetRegistery();
			speed.pause();

			cash.set(save.cash);
			time.set(save.time);

			gameProjects.set(save.data.gameProjects);
			companies.set(save.data.companies);
			teams.set(save.data.teams);
			hardwareProjects.set(save.data.hardwareProjects);
			newslist.set(save.data.newslist);
			platforms.set(save.data.platforms);
			publishers.set(save.data.publishers);
			gameFeatures.set(save.data.gameFeatures);
			hardwareFeatures.set(save.data.hardwareFeatures);
			buildings.set(save.data.buildings);
		},

		async toObject(save: Save): Promise<Record<any, any>> {
			await this.load(save);

			save.data.gameProjects = get(gameProjects);
			save.data.companies = get(companies);
			save.data.teams = get(teams);
			save.data.hardwareProjects = get(hardwareProjects);
			save.data.newslist = get(newslist);
			save.data.platforms = get(platforms);
			save.data.publishers = get(publishers);
			save.data.gameFeatures = get(gameFeatures);
			save.data.hardwareFeatures = get(hardwareFeatures);
			save.data.buildings = get(buildings);

			return {
				save
			};
		},

		async fromObject(record: Record<any, any>) {
			const saveid = await saves.put(record.save);

			const save = get(currentStore).find((save) => save.id === saveid);

			if (save) {
				await saves.load(save);
			}

			const currentSave = saves.current();

			if (currentSave) {
				const save = <Save>record.save;

				currentSave.lastSaved = new Date();
				currentSave.cash = save.cash;
				cash.set(currentSave.cash);
				currentSave.time = new Date(save.time);
				currentSave.version = version;

				await saves.update(currentSave);
			}

			gameProjects.set(record.data.gameProjects);
			companies.set(record.data.companies);
			teams.set(record.data.teams);
			hardwareProjects.set(record.data.hardwareProjects);
			newslist.set(record.data.newslist);
			platforms.set(record.data.platforms);
			publishers.set(record.data.publishers);
			gameFeatures.set(record.data.gameFeatures);
			hardwareFeatures.set(record.data.hardwareFeatures);
			buildings.set(record.data.buildings);
		},

		save: async () => {
			const currentSave = saves.current();

			if (currentSave) {
				currentSave.lastSaved = new Date();
				currentSave.cash = get(cash);
				currentSave.time = get(time);
				currentSave.version = version;

				currentSave.data.gameProjects = get(gameProjects);
				currentSave.data.companies = get(companies);
				currentSave.data.teams = get(teams);
				currentSave.data.hardwareProjects = get(hardwareProjects);
				currentSave.data.newslist = get(newslist);
				currentSave.data.platforms = get(platforms);
				currentSave.data.publishers = get(publishers);
				currentSave.data.gameFeatures = get(gameFeatures);
				currentSave.data.hardwareFeatures = get(hardwareFeatures);
				currentSave.data.buildings = get(buildings);

				await saves.update(currentSave);
			}
		},

		createNew: async (startingCash: number = 1000) => {
			const saveid = await saves.add({
				name: 'Save 1',
				saveType: 'Auto',
				created: new Date(),
				lastSaved: new Date(),
				version: version,
				cash: startingCash,
				time: STARTING_DATE,
				data: {
					gameProjects: [],
					companies: [],
					teams: [],
					hardwareProjects: [],
					newslist: [],
					platforms: [],
					publishers: [],
					gameFeatures: [],
					hardwareFeatures: [],
					buildings: []
				}
			});

			// initialize newly created save
			const save = get(currentStore).find((save) => save.id === saveid);

			if (save) {
				await saves.load(save);
			}

			return saveid;
		}
	};
}

export const availableLanguageDB = derived([mods], ([$mods]) => {
	const languageDBs = $mods
		.filter((mod) => mod.enabled && mod.manifest?.category.includes('Language'))
		.map((mod) => mod.languageDB);

	let langDB = languageJson;

	languageDBs.forEach((db) => {
		langDB = { ...langDB, ...db };
	});

	return langDB;
});

export const language = writable(languageJson['en'].translations);

export const selectedLanguage = writable(
	localStorage.getItem('language') || new Intl.Locale(navigator.language).language || 'en'
);

availableLanguageDB.subscribe((db) => {
	if (!db[get(selectedLanguage)]) {
		selectedLanguage.set('en');
	}
});

selectedLanguage.subscribe((selectedLanguage) => {
	localStorage.setItem('language', selectedLanguage);

	const languageDB = get(availableLanguageDB)[selectedLanguage];

	if (languageDB !== undefined) {
		language.set(languageDB.translations);
	}
});

export const settings = writable(
	JSON.parse(localStorage.getItem('settings') || JSON.stringify({ sound: 0.5, textsize: 1 }))
);

settings.subscribe((value) => {
	localStorage.setItem('settings', JSON.stringify(value));
});

export const STARTING_DATE = new Date(1978, 4, 1);

export const speed = (function () {
	const currentStore = writable(0);
	const { subscribe, set } = currentStore;
	let previousState: number | undefined = undefined;

	return {
		set,
		subscribe,
		resume: () => {
			if (previousState !== undefined) {
				set(previousState);
				previousState = undefined;
			}
		},
		pause: () => {
			previousState = get(currentStore);
			set(0);
		},
		play: () => set(1),
		fastForward: () => set(2),
		isPaused: () => get(currentStore) === 0,
		isPlay: () => get(currentStore) === 1,
		isFastForward: () => get(currentStore) === 2
	};
})();
export const time = (function () {
	const currentStore = writable(STARTING_DATE);
	const { subscribe, set } = currentStore;

	let registery: Map<
		number,
		{
			callback: any;
			type: 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly';
			persistence: boolean;
		}
	> = new Map();

	function registerCallback(
		id: number,
		type: 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly',
		callback: any,
		persistence: boolean = false
	) {
		if (registery.has(id) === false) {
			registery.set(id, { callback, type, persistence });
		}
	}

	function dateAddOneMinute(date: Date) {
		return date.setMinutes(date.getMinutes() + 1);
	}
	
	function dateAddOneHour(date: Date, multiplier: number = 1) {
		return date.setHours(date.getHours() + multiplier);
	}

	function dateAddOneDay(date: Date, multiplier: number = 1) {
		return date.setDate(date.getDate() + multiplier);
	}

	function hourlyTick(steppingDate: Date, oldSteppingDate: Date) {

		const hourChange = steppingDate.getHours() !== oldSteppingDate?.getHours();
		const dayChange = steppingDate.getDay() !== oldSteppingDate?.getDay();
		const monthChange = steppingDate.getMonth() !== oldSteppingDate?.getMonth();
		const yearChange = steppingDate.getFullYear() !== oldSteppingDate?.getFullYear();

		registery.forEach((register) => {
			const isHourly = register.type === 'hourly' && hourChange;
			const isDaily = register.type === 'daily' && dayChange;
			// getDay() value 0 representes sunday
			const isWeek = register.type === 'weekly' && steppingDate.getDay() === 0 && dayChange;

			const isMonthly = register.type === 'monthly' && monthChange;
			const isYearly = register.type === 'yearly' && yearChange;

			if (isHourly || isDaily || isWeek || isMonthly || isYearly) {
				register.callback(steppingDate);
			}
		});
	}

	function tick(ticks: number, isNormalPlayingSpeed: boolean) {

		const oldGameTime = new Date(get(time).getTime());

		if (isNormalPlayingSpeed) {
			time.set(new Date(dateAddOneHour(get(time), ticks)));
		} else {
			time.set(new Date(dateAddOneDay(get(time), ticks)));
		}

		const currentGameDate = get(time);
		
		let steppingDateClone = new Date(oldGameTime.getTime());

		while (steppingDateClone < currentGameDate) {
			const oldSteppingDate = new Date(steppingDateClone.getTime());
			const oldSteppingDateClone = new Date(oldSteppingDate.getTime());
			steppingDateClone = new Date(
				isNormalPlayingSpeed ? dateAddOneMinute(oldSteppingDateClone) : dateAddOneHour(oldSteppingDateClone)
			);

			hourlyTick(steppingDateClone, oldSteppingDate)
		}		

	}

	function resetRegistery() {
		
		for (const [key, value] of registery) {
			if (value.persistence === false) {
				registery.delete(key);

			}
		}
	}

	return {
		set,
		subscribe,
		registerCallback,
		tick,
		resetRegistery,
		update: (time: Date) => {
			const previousTime = get(currentStore);
			const nextTime = time;
			const timeDiff = nextTime.getTime() - previousTime.getTime()
			const hourDiff = timeDiff / 1000 / 60 / 60;
			const ticks = Math.round(hourDiff);
			tick(ticks, true);
		}
	};
})();

time.registerCallback(
	0,
	'weekly',
	() => {
		saves.save();
	},
	true
);

export const isSoundAllowed = writable(false);

function animationInterval(
	ms: number,
	signal: AbortSignal,
	callback: (deltaTime: number) => void
) {
	const start: number = document.timeline
		? <number>document.timeline.currentTime
		: performance.now();
	let previousTarget = start;

	function frame(time: number, deltaTime: number) {
		if (signal.aborted) return;
		callback(deltaTime);
		scheduleFrame(time);
	}

	function scheduleFrame(time: number) {
		const elapsed = time - start;
		const roundedElapsed = Math.round(elapsed / ms) * ms;
		const targetNext = start + roundedElapsed + ms;
		const delay = targetNext - performance.now();
		const deltaTime = Math.round(targetNext - previousTarget);

		setTimeout(() => requestAnimationFrame((t) => frame(t, deltaTime)), delay);
		previousTarget = targetNext;
	}

	scheduleFrame(start);
}

let controller = new AbortController();

speed.subscribe(() => {
	if (speed.isPaused()) {
		controller.abort();
	} else {
		controller.abort();
		controller = new AbortController();

		animationInterval(1000, controller.signal, (deltaTime: number) => {
			const ticks = Math.round(deltaTime / 1000);

			if (ticks > 1) {
				console.log('animationInterval is being Throttled');
			}

			const isNormalPlayingSpeed = speed.isPlay();

			time.tick(ticks, isNormalPlayingSpeed);
		});
	}
});
