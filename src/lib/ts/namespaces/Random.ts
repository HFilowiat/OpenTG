export namespace Random {
	function cyrb128(str): number[] {
		let h1 = 1779033703,
			h2 = 3144134277,
			h3 = 1013904242,
			h4 = 2773480762;
		for (let i = 0, k; i < str.length; i++) {
			k = str.charCodeAt(i);
			h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
			h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
			h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
			h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
		}
		h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
		h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
		h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
		h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);
		return [(h1 ^ h2 ^ h3 ^ h4) >>> 0, (h2 ^ h1) >>> 0, (h3 ^ h1) >>> 0, (h4 ^ h1) >>> 0];
	}

	function sfc32(a, b, c, d): () => number {
		return function () {
			a >>>= 0;
			b >>>= 0;
			c >>>= 0;
			d >>>= 0;
			var t = (a + b) | 0;
			a = b ^ (b >>> 9);
			b = (c + (c << 3)) | 0;
			c = (c << 21) | (c >>> 11);
			d = (d + 1) | 0;
			t = (t + d) | 0;
			c = (c + t) | 0;
			return (t >>> 0) / 4294967296;
		};
	}

	function splitmix32(a) {
		return function () {
			a |= 0;
			a = (a + 0x9e3779b9) | 0;
			var t = a ^ (a >>> 15);
			t = Math.imul(t, 0x85ebca6b);
			t = t ^ (t >>> 13);
			t = Math.imul(t, 0xc2b2ae35);
			return ((t = t ^ (t >>> 16)) >>> 0) / 4294967296;
		};
	}

	let rand;
	Seed('initialseed');

	export function Seed(value: string) {
		const seedstate = value;
		const seed: number[] = cyrb128(seedstate);
		rand = splitmix32(seed[0]);
		return seedstate;
	}

	export function Random01(): number {
		return rand();
	}

	export function Range(min: number, max: number): number {
		return Random01() * (max - min) + min;
	}

	export function RangeInt(min: number, max: number): number {
		return Math.floor(Random01() * (max - min + 1) + min);
	}

	export function UniqueID() {
		const symbols = 'useandom26T198340PX75pxJACKVERYMINDBUSHWOLFGQZbfghjklqvwyzrict';
		let size = 16; 
		let id = '';

		while (size--) {
			// OR logical operator is faster than Math.floor()
			id += symbols[(Math.random() * symbols.length) | 0];
		}

		return id;
	}
}
