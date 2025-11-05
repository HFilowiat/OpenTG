export function load({ params }) {
	const saveId: IDBValidKey = parseInt(params.saveId);
	const hardwareId: IDBValidKey = parseInt(params.hardwareId);

	return { saveId, hardwareId };
}
