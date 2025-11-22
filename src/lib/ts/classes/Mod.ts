import { version } from '$app/environment';
import { mods } from '$lib/ts/stores/Stores';
import {
  existsSafe,
  createDirSafe,
  readDirSafe,
  readTextFileSafe,
  isRunningInTauri
} from '$lib/tauriFs';
import { get } from 'svelte/store';
import * as semver from 'semver';
import { documentDir, join } from '@tauri-apps/api/path';

// mod_repository/
// ├── mod_repository.json
// ├── mods/
// │   ├── mod1/
// │   │   ├── manifest.json
// │   │   ├── assets/
// │   │   │   ├── texture.png
// │   │   │   └── script.js
// │   ├── mod2/
// │   │   ├── manifest.json
// │   │   ├── assets/
// │   │   │   ├── texture.png
// │   │   │   └── script.js

interface Repository {
  discoverable: boolean;
  manifests: string[];
}

export const modCategory = ['Language'] as const;
export type ModCategory = (typeof modCategory)[number];

export class Manifest {
  repositoryURL: string | undefined = undefined;
  manifestURL: string = '';
  manifestVersion: string = '';
  uuid: string = crypto.randomUUID();
  name: string = '';
  version: string = '';
  category: ModCategory[] = [];
  description: string = '';
  links: { type: 'homepage' | 'website'; url: string }[] = [];
  authors: { name: string; contacts: string[] }[] = [];
  changelog: string = '';
  assets: { type: 'json'; path: 'assets/language.json' }[] = [];
  supportedGameVersion: string = '';
  createdAt: Date = new Date();
  license: string = '';
  icon: string = '';

  public get iconURL(): string {
    return new URL(this.icon, this.manifestURL).href;
  }

  static fromJSON(record: Record<any, any>): Manifest {
    record.createdAt = new Date(record.createdAt);
    return Object.assign(new Manifest(), record);
  }
}

export class Mod implements SavableForeignObject {
  save?: IDBValidKey;
  manifest?: Manifest;
  languageDB: any = {};
  enabled: boolean = false;

  static fromObject(record: Record<any, any>): Mod {
    return Object.assign(new Mod(), record);
  }

  static fromManifest(manifestString: string) {
    const manifest = JSON.parse(manifestString);
    const mod = Mod.fromObject(manifest);
    mods.add(mod);
    return mod;
  }

  // Helper: get absolute mod directory in Documents
  private static async getModDir(): Promise<string | null> {
    if (!isRunningInTauri()) return null;
    try {
      const docs = await documentDir();
      if (!docs) return null;
      return await join(docs, 'OpenTG', 'Mod');
    } catch (err) {
      console.warn('Failed to resolve mod directory:', err);
      return null;
    }
  }

  //Loads mods from user's documents directory
  //Will early return when not running in Tauri
  static async loadMods() {
  // Not sure why this was made windows only
  	if (import.meta.env.VITE_PLATFORM !== 'WINDOWS') {
  	  console.log('mod system failed to initialize, the platform is not windows');
  	  return;
  	}

  	if (!isRunningInTauri()) {
  	  console.log('Not running in Tauri renderer, skipping mod system');
  	  return;
  	}

  	try {
  	  const docsPath = await Mod.getModDir();
  	  if (!docsPath) {
  	    console.warn('Documents directory unavailable; skipping mod load.');
  	    return;
  	  }

  	  const modDir = `${docsPath}/OpenTG/Mod`;
  	  await createDirSafe(modDir);

  	  const entries = await readDirSafe(modDir);

  	  for (const entry of entries) {
  	    // Construct full path
  	    const modFolderPath = `${modDir}/${entry.name}`;
  	    const modFiles = await readDirSafe(modFolderPath);

  	    for (const file of modFiles) {
  	      const filepath = `${modFolderPath}/${file.name}`;

  	      if (file.name === 'manifest.json') {
  	        const manifestContents = await readTextFileSafe(filepath);
  	        const mod = Mod.fromManifest(manifestContents);

  	        if (mod.manifest?.category.includes('Language')) {
  	          const languagePath = `${modFolderPath}/language.json`;

  	          if (await existsSafe(languagePath)) {
  	            const languageContents = await readTextFileSafe(languagePath);
  	            try {
  	              mod.languageDB = JSON.parse(languageContents);
  	            } catch (err) {
  	              console.warn('Failed to parse language.json for mod:', err);
  	            }
  	          }
  	        }
  	      }
  	    }
  	  }
  	} catch (error) {
  	  console.log('Error while loading mods: ', error);
  	}
	}

  static async updateRepositories() {
    const modsArray = get(mods);
    await Promise.all(modsArray.map((mod) => mod.checkForUpdates()));

    const preinstallModRepositoryURL =
      'https://rebelliumgames.github.io/TechGiants-Mod/preinstall-mod-repositories.json';
    const request = await fetch(preinstallModRepositoryURL);
    const listOfModsReposToPreInstall: string[] = await request.json();

    await Promise.all(
      listOfModsReposToPreInstall.map(async (link) => {
        const repo = await Mod.getRepository(link);
        if (repo.discoverable) {
          await Mod.addModRepository(link, true);
        }
      })
    );
  }

  static async getRepository(repositoryURLString: string) {
    const repositoryURL = new URL(repositoryURLString);
    const repositoryResponses = await fetch(repositoryURL);
    const repository: Repository = await repositoryResponses.json();
    return repository;
  }

  static async fetchManifest(manifestURL: string, repositoryURL: URL) {
    const manifestResponse = await fetch(new URL(manifestURL, repositoryURL));
    const manifest = await manifestResponse.json();
    const manifestObj = Manifest.fromJSON(manifest);
    manifestObj.manifestURL = new URL(manifestURL, repositoryURL.href).href;
    manifestObj.repositoryURL = repositoryURL.href;
    return manifestObj;
  }

  static handleFetchError(response: Response) {
    if (!response.ok) {
      if (response.status === 404) {
        return new Error(`404 Not Found, The requested resource does not exist. ${response.url}`);
      } else {
        return new Error(JSON.stringify({ code: response.status, message: response.statusText }));
      }
    }
    return undefined;
  }

  static async addModRepository(repositoryURLString: string, enabled = false) {
    const repositoryURL = new URL(repositoryURLString);
    const repositoryResponses = await fetch(repositoryURL);

    let error: Error | undefined;
    error = Mod.handleFetchError(repositoryResponses);
    if (error) return { error, value: false };

    const repository: Repository = await repositoryResponses.json();

    const manifests = await Promise.all(
      repository.manifests.map((manifestURL) => Mod.fetchManifest(manifestURL, repositoryURL))
    );

    const supportedManifests = manifests
      .filter((manifest) => semver.satisfies(version, manifest.supportedGameVersion, { includePrerelease: true }))
      .sort((a, b) => semver.compare(b.version, a.version));

    if (!supportedManifests[0]) return;

    const languageAsset = supportedManifests[0].assets.find(
      (asset) => asset.type === 'json' && asset.path.endsWith('language.json')
    );
    if (!languageAsset) return;

    const languageAssetURL = new URL(languageAsset.path, supportedManifests[0].manifestURL);
    const sourceResponse = await fetch(languageAssetURL);
    error = Mod.handleFetchError(sourceResponse);
    if (error) return { error, value: false };
    if (!sourceResponse.ok) throw new Error(`HTTP error! Status: ${sourceResponse.status}`);
    const sourceJson = await sourceResponse.json();

    const mod = new Mod();
    mod.manifest = supportedManifests[0];

    if (get(mods).find((m) => m.manifest?.uuid === mod.manifest?.uuid)) return;
    mod.enabled = enabled;
    (mod as any).id = mod.manifest.uuid;
    mod.languageDB = sourceJson;

    await mods.add(mod);
    return { error: undefined, value: true };
  }

  async checkForUpdates() {
    const repositoryURLString = this.manifest?.repositoryURL;
    if (!repositoryURLString) return;

    const repositoryURL = new URL(repositoryURLString);
    const repositoryResponses = await fetch(repositoryURL);

    let error: Error | undefined;
    error = Mod.handleFetchError(repositoryResponses);
    if (error) return { error, value: false };

    const repository: Repository = await repositoryResponses.json();
    const manifests = await Promise.all(
      repository.manifests.map((manifestURL) => Mod.fetchManifest(manifestURL, repositoryURL))
    );

    const supportedManifests = manifests
      .filter((manifest) => semver.satisfies(version, manifest.supportedGameVersion, { includePrerelease: true }))
      .sort((a, b) => semver.compare(b.version, a.version));

    if (!supportedManifests[0]) return;

    const languageAsset = supportedManifests[0].assets.find(
      (asset) => asset.type === 'json' && asset.path.endsWith('language.json')
    );
    if (!languageAsset) return;

    const languageAssetURL = new URL(languageAsset.path, supportedManifests[0].manifestURL);
    const sourceResponse = await fetch(languageAssetURL);
    error = Mod.handleFetchError(sourceResponse);
    if (error) return { error, value: false };
    if (!sourceResponse.ok) throw new Error(`HTTP error! Status: ${sourceResponse.status}`);

    const sourceJson = await sourceResponse.json();
    const mod = new Mod();
    mod.manifest = supportedManifests[0];

    if (get(mods).find((m) => m.manifest?.uuid === mod.manifest?.uuid)) return;
    mod.enabled = true;
    (mod as any).id = mod.manifest.uuid;
    mod.languageDB = sourceJson;

    await mods.put(mod);
    return { error: undefined, value: true };
  }
}
