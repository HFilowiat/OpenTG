<script lang="ts">
	import { saves } from '$lib/ts/stores/Stores';
	import type { LayoutData } from './$types';
	import { page } from '$app/stores';
	import { speed } from '$lib/ts/stores/Stores';

	page.subscribe((p) => {
		if (p.route.id === '/(game)/[saveId]') {
			speed.resume();
		} else {
			speed.pause();
		}
	});

	export let data: LayoutData;

	$: currentSave = $saves.find((save) => save.id === data.saveId);

	$: {
		if (currentSave) {
			saves.load(currentSave);
		}
	}
</script>

<slot></slot>
