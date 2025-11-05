/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly VITE_PLATFORM: 'WEB' | 'WINDOWS' | 'MAC' | 'LINUX';
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
