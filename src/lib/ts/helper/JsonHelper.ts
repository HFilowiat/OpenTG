export function reviveDateObject(key: string, value: any) {
	if (value != null && typeof value === 'object' && value['@type'] === 'ISODate') {
		return new Date(value.value);
	}

	return value;
}

export function replaceDateObject(this: any, key: string, value: any) {
	if (this[key] instanceof Date) {
		return { '@type': 'ISODate', value: this[key].toISOString() };
	}

	return value;
}
