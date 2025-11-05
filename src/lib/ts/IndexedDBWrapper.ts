import { version } from '$app/environment';

export namespace IndexedDBWrapper {
	let db: IDBDatabase;

	function getDatabase(
		name: string,
		onUpgradeNeeded: (this: IDBOpenDBRequest, event: IDBVersionChangeEvent) => void
	): Promise<IDBDatabase> {
		return new Promise((resolve, reject) => {
			const request = indexedDB.open(name);

			request.onerror = function (event) {
				reject(this.error);
			};

			request.onsuccess = function (event) {
				resolve(this.result);
			};

			request.onupgradeneeded = onUpgradeNeeded;
		});
	}

	export async function getDB(): Promise<IDBDatabase> {
		return new Promise(async (resolve, reject) => {
			if (!db) {
				db = await getDatabase(`database-${version}`, function (this: IDBOpenDBRequest) {
					const db = this.result;

					if (!db.objectStoreNames.contains('mods')) {
						db.createObjectStore('mods', { keyPath: 'id', autoIncrement: true });
					}

					if (!db.objectStoreNames.contains('saves')) {
						db.createObjectStore('saves', { keyPath: 'id', autoIncrement: true });
					}
				});
			}

			resolve(db);
		});
	}
}
