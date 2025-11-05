class TimeSeries<T> {
	private series = new Map<Date, T>();

	public get(date: Date) {
		this.series.get(date);
	}

	public set(date: Date, value: T) {
		this.series.set(date, value);
	}

	public sort() {
		this.series = new Map([...this.series.entries()].sort());
	}

	public toJSON() {
		return Array.from(this.series, ([date, value]) => [date.getTime(), value]);
	}

	public fromJSON(jsonString: string) {
		this.series.clear();
		const array: [number, number][] = Array.from(JSON.parse(jsonString));
		array.map(([date, value]) => series.set(new Date(date), value));
	}
}
