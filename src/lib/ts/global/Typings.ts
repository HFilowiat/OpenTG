import { Random } from '$lib/ts/namespaces/Random';

declare global {
	interface Array<T> {
		random(): T;
	}

	interface String {
		titleCase(): string;
	}
}

if (!Array.prototype.random) {
	Array.prototype.random = function <T>(this: Array<T>): T {
		return this[Math.floor(Random.Random01() * this.length)];
	};
}

if (!String.prototype.titleCase) {
	String.prototype.titleCase = function (this: string) {
		return this.charAt(0).toUpperCase() + this.slice(1);
	};
}

export {};
