<script lang="ts">
	import Button from '$lib/components/Button.svelte';
	import { language } from '$lib/ts/stores/Stores';
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';
</script>

<header>
	<h1>{$language.YOU_GOT_BANKRUPT}</h1>
</header>

<main>
	<div>
		<Button grow on:click={() => goto(`${base}/`)}>{$language.EXIT_TO_MAIN_MENU}</Button>
	</div>
</main>
