import { appWindow } from '@tauri-apps/api/window';

export namespace Fullscreen {
	interface Platform {
		isFullscreen(): Promise<boolean>;
		enableFullscreen(): void;
		disableFullscreen(): void;
		toggleFullscreen(): Promise<void>;
		isFullscreenSupported(): boolean;
	}

	// windows platform implementation
	class WindowsPlatform implements Platform {
		isFullscreenSupported(): boolean {
			return true;
		}
		async isFullscreen(): Promise<boolean> {
			return await appWindow.isFullscreen();
		}

		enableFullscreen(): void {
			appWindow.setFullscreen(true);
		}

		disableFullscreen(): void {
			appWindow.setFullscreen(false);
		}

		async toggleFullscreen(): Promise<void> {
			const isFullscreen = await this.isFullscreen();
			appWindow.setFullscreen(!isFullscreen);
		}
	}

	// default platform implementation (assumed to be non-Windows)
	class WebPlatform implements Platform {
		isFullscreenSupported(): boolean {
			return 'fullscreenElement' in document;
		}
		async isFullscreen(): Promise<boolean> {
			return document.fullscreenElement !== null;
		}

		enableFullscreen(): void {
			document.documentElement.requestFullscreen();
		}

		disableFullscreen(): void {
			document.exitFullscreen();
		}

		async toggleFullscreen(): Promise<void> {
			const isFullscreen = await this.isFullscreen();

			if (isFullscreen) {
				this.disableFullscreen();
			} else {
				this.enableFullscreen();
			}
		}
	}

	// determine the platform and use the corresponding implementation
	function getPlatform(): Platform {
		if (import.meta.env.VITE_PLATFORM === 'WINDOWS') {
			return new WindowsPlatform();
		} else {
			return new WebPlatform();
		}
	}

	// expose the namespace functions using the platform implementation
	export const platform: Platform = getPlatform();

	export function isFullscreenSupported(): boolean {
		return platform.isFullscreenSupported();
	}

	export async function isFullscreen(): Promise<boolean> {
		return await platform.isFullscreen();
	}

	export function enableFullscreen(): void {
		platform.enableFullscreen();
	}

	export function disableFullscreen(): void {
		platform.disableFullscreen();
	}

	export async function toggleFullscreen(): Promise<void> {
		await platform.toggleFullscreen();
	}
}
