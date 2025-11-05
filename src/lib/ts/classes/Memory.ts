export class Memory {
	constructor(
		public base: number[],
		public additional?: number
	) {}

	public toString(): string {
		const option: { notation: 'compact'; maximumFractionDigits: number } = {
			notation: 'compact',
			maximumFractionDigits: 3
		};

		let formatter = new Intl.NumberFormat('en-US', option);

		return `${formatter.format(this.base[0])}Hz`;
	}
}
