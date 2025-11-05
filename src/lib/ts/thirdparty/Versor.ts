/*
	Copyright 2013-2021 Mike Bostock

	Permission to use, copy, modify, and/or distribute this software for any purpose
	with or without fee is hereby granted, provided that the above copyright notice
	and this permission notice appear in all copies.

	THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
	REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND
	FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
	INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS
	OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER
	TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF
	THIS SOFTWARE.
*/

const acos = Math.acos,
	asin = Math.asin,
	atan2 = Math.atan2,
	cos = Math.cos,
	hypot = Math.hypot,
	max = Math.max,
	min = Math.min,
	PI = Math.PI,
	sin = Math.sin,
	radians = PI / 180,
	degrees = 180 / PI;

export type Versor = [number, number, number, number];

export function fromCartesian([x, y, z]: [number, number, number]) {
	return [0, z, -y, x];
}
export function fromAngles([l, p, g]: [number, number, number]): Versor {
	l *= radians / 2;
	p *= radians / 2;
	g = ((g || 0) * radians) / 2;
	const sl = sin(l),
		cl = cos(l);
	const sp = sin(p),
		cp = cos(p);
	const sg = sin(g),
		cg = cos(g);
	return [
		cl * cp * cg + sl * sp * sg,
		sl * cp * cg - cl * sp * sg,
		cl * sp * cg + sl * cp * sg,
		cl * cp * sg - sl * sp * cg
	];
}
export function toAngles([a, b, c, d]: Versor) {
	return [
		atan2(2 * (a * b + c * d), 1 - 2 * (b * b + c * c)) * degrees,
		asin(max(-1, min(1, 2 * (a * c - d * b)))) * degrees,
		atan2(2 * (a * d + b * c), 1 - 2 * (c * c + d * d)) * degrees
	];
}
export function interpolateAngles(a: [number, number, number], b: [number, number, number]) {
	const i = interpolate(fromAngles(a), fromAngles(b));
	return (t: number) => toAngles(i(t));
}
export function interpolateLinear(
	[a1, b1, c1, d1]: Versor,
	[a2, b2, c2, d2]: Versor
): (t: number) => Versor {

    (a2 -= a1), (b2 -= b1), (c2 -= c1), (d2 -= d1);
    
    const x: Versor = [0, 0, 0, 0];
    
    return (t: number) => {
		const l = hypot(
			(x[0] = a1 + a2 * t),
			(x[1] = b1 + b2 * t),
			(x[2] = c1 + c2 * t),
			(x[3] = d1 + d2 * t)
		);
        (x[0] /= l), (x[1] /= l), (x[2] /= l), (x[3] /= l);
        
		return x;
	};
}

export function interpolate(
	[a1, b1, c1, d1]: Versor,
	[a2, b2, c2, d2]: Versor
): (t: number) => Versor {
    let dt = dot([a1, b1, c1, d1], [a2, b2, c2, d2]);
	if (dt < 0) (a2 = -a2), (b2 = -b2), (c2 = -c2), (d2 = -d2), (dt = -dt);
	
    const theta0 = acos(max(-1, min(1, dt)));
	const x: Versor = [0, 0, 0, 0];
	const l = hypot((a2 -= a1 * dt), (b2 -= b1 * dt), (c2 -= c1 * dt), (d2 -= d1 * dt));
	(a2 /= l), (b2 /= l), (c2 /= l), (d2 /= l);
	return (t: number) => {
		const theta = theta0 * t;
		const s = sin(theta);
		const c = cos(theta);
		x[0] = a1 * c + a2 * s;
		x[1] = b1 * c + b2 * s;
		x[2] = c1 * c + c2 * s;
		x[3] = d1 * c + d2 * s;
		return x;
	};
}

export function dot([a1, b1, c1, d1]: Versor, [a2, b2, c2, d2]: Versor) {
	return a1 * a2 + b1 * b2 + c1 * c2 + d1 * d2;
}
export function multiply([a1, b1, c1, d1]: Versor, [a2, b2, c2, d2]: Versor) {
	return [
		a1 * a2 - b1 * b2 - c1 * c2 - d1 * d2,
		a1 * b2 + b1 * a2 + c1 * d2 - d1 * c2,
		a1 * c2 - b1 * d2 + c1 * a2 + d1 * b2,
		a1 * d2 + b1 * c2 - c1 * b2 + d1 * a2
	];
}

// returns Cartesian coordinates [x, y, z] given spherical coordinates [λ, φ].
export function cartesian([lambda, phi]: [number, number, number]) {
	const l = lambda * radians,
		p = phi * radians,
		cp = cos(p);
	return [cp * cos(l), cp * sin(l), sin(p)];
}

// returns the quaternion to rotate between two cartesian points on the sphere.
// alpha for tweening [0,1]
export function delta(v0: [number, number, number], v1: [number, number, number], alpha: number) {
	if (arguments.length == 2) alpha = 1;

	const sqrt = Math.sqrt;
	function cross(
		v0: [number, number, number],
		v1: [number, number, number]
	): [number, number, number] {
		return [
			v0[1] * v1[2] - v0[2] * v1[1],
			v0[2] * v1[0] - v0[0] * v1[2],
			v0[0] * v1[1] - v0[1] * v1[0]
		];
	}
	function dot(v0: [number, number, number], v1: [number, number, number]) {
		return v0[0] * v1[0] + v0[1] * v1[1] + v0[2] * v1[2];
	}

	const w = cross(v0, v1),
		l = sqrt(dot(w, w));
	if (!l) return [1, 0, 0, 0];
	const t = (alpha * acos(max(-1, min(1, dot(v0, v1))))) / 2,
		s = sin(t); // t = θ / 2
	return [cos(t), (w[2] / l) * s, (-w[1] / l) * s, (w[0] / l) * s];
}
