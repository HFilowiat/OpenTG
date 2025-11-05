export function load({ params }) {
	const saveId: IDBValidKey = parseInt(params.saveId);
	const gameId: IDBValidKey = params.gameId;

	return { saveId, gameId };
}
