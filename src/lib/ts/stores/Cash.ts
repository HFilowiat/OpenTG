import { get, writable } from 'svelte/store';

function store() {
	let ledger: { name: string; amount: number }[] = [];
	const { subscribe, set, update } = writable(0);

	return {
		subscribe,
		set,
		add: (name: string, amount: number) => {
			ledger.push({ name, amount });
			update((n) => n + amount);
		},
		ledger: () => {
			return ledger;
		}
	};
}

export const cash = store();