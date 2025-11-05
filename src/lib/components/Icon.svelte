<script lang="ts">
	// find all svg icon asset files and put them into and object key value map
	const iconMap = import.meta.glob('../assets/icons/icon_feature_category_*.svg', { query: '?raw' });
	
	// convert icon name such as FEATURE_CATEGORY_AI into import('../assets/icons/icon_feature_category_ai.svg?raw')
	function loadIconByName(name: string) {
		const key = `../assets/icons/icon_${name.toLowerCase()}.svg`;
		const loader = iconMap[key];
		if (loader) return loader();
		return Promise.reject(new Error(`Unknown icon: ${name}`));
	}

	export let src: undefined | Promise<typeof import("*?raw")> = undefined;
	export let name = undefined;
</script>

{#if name !== undefined}
	{#await loadIconByName(name) then value}
		{@html value.default}
	{/await}
{:else if src !== undefined}
	{#await src then value}
		{@html value.default}
	{/await}
{/if}