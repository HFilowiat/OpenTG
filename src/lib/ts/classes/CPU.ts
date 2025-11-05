export class CPU {
	constructor(
		public manufactorer: string,
		public name: string,
		public speed: number,
		public core: number = 1,
		public socket: number = 1
	) { }

	public toString(): string {
		const option: { notation: 'compact'; maximumFractionDigits: number } = {
			notation: 'compact',
			maximumFractionDigits: 3
		};

		let formatter = new Intl.NumberFormat('en-US', option);

		return `${this.name} @ ${formatter.format(this.speed)}Hz`;
	}

	public get InstructionPerSecond(): number {
		return this.socket * this.speed * this.core;
	}

	public get InstructionPerSecondText(): string {
		const option: { notation: 'compact'; maximumFractionDigits: number } = {
			notation: 'compact',
			maximumFractionDigits: 3
		};
		let formatter = new Intl.NumberFormat('en-US', option);

		const value = this.InstructionPerSecond;
		return 'IPS:' + formatter.format(value);
	}
}
