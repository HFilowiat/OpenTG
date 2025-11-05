<script lang="ts">
	import { language, time } from '$lib/ts/stores/Stores';
	import Card from '$lib/components/Card.svelte';
	import { publisherestimateRoyalty } from '$lib/ts/interfaces/Publisher';
	import { goto } from '$app/navigation';
	import { gameProjects, publishers } from '$lib/ts/stores/Stores';
	import Button from '$lib/components/Button.svelte';
	import { get } from 'svelte/store';
	import { platforms } from '$lib/ts/stores/Stores';
	import type { LayoutData } from '../$types';
	import backIcon from '$lib/assets/icons/icon_back.svg';
	import { base } from '$app/paths';
	import cassetteTapeImage from '$lib/assets/images/image_media_cassette_tape.svg';
	import floppy5inchImage from '$lib/assets/images/image_media_floppy_5_25.svg';
	import { releaseGame } from '$lib/ts/classes/Game';
	export let data: LayoutData;

	$: game = $gameProjects.find((game) => game.id === data.gameId);
	let gameprice = 10;
	let distributionMedia: 'ROM Cartridge' | 'Floppy Disk' | 'Cassette Tape';

	const mediaCost = {
		'ROM Cartridge': 12,
		'Floppy Disk': 5,
		'Cassette Tape': 2
	};

	const mediaName = {
		'ROM Cartridge': $language.ROM_CARTRIDGE,
		'Floppy Disk': $language.FLOPPY_DISK,
		'Cassette Tape': $language.CASSETTE_TAPE
	};

	$: gamecost = mediaCost[distributionMedia];

	$: {
		if (gameprice < gamecost) gameprice = gamecost;
	}

	$: allPlatforms = get(platforms).filter((platform) => game.platformIds.includes(platform.id));

	let distributionMethod: 'Self Publish' | 'Publisher' = 'Publisher';

	$: publisherlistOfPlatform = $publishers.filter((publisher) => {
		let doesPublisherIncludesPlatform: boolean = false;

		allPlatforms.forEach((platform) => {
			if (platform.tag !== undefined && publisher.platformTags.includes(platform.tag)) {
				doesPublisherIncludesPlatform = true;
			}
		});

		return doesPublisherIncludesPlatform;
	});

	let recentPublisherContact = new Set<string>();

	function setGameAndRelease() {
		if (game === undefined) throw new Error('Game is not set');

		game.price = gameprice;
		game.unitcost = gamecost;
		game.distributionMethod = distributionMethod;
		game.distributionMedia = distributionMedia;
		releaseGame(game);

		goto(`${base}/${data.saveId}/`);
	}
</script>

<header class="back">
	<a href="javascript:history.back()" class="back">
		<img src={backIcon} alt="" />
		<span>{$language.BACK}</span>
	</a>
</header>

<main>
	<div
		style="display: flex;flex-wrap: wrap;gap: 1rem;align-content: flex-start;align-items: flex-start;">
		<div>
			<label for="">{$language.GAME_PRICE}</label>
			<input
				type="number"
				bind:value={gameprice}
				min={gamecost}
				step="0.5"
				disabled={distributionMethod === 'Publisher'} />
		</div>

		<div>
			<label for="">{$language.PLATFORM}</label>
			<div>{allPlatforms.map((x) => x.name).join(',')}</div>
		</div>

		<div>
			<label for="">{$language.GENRE}</label>
			<div>{game.genres.join(',')}</div>
		</div>

		<div class="flex-v">
			<div class="flex-v">
				<label for="">{$language.DISTRIBUTION_MEDIA}</label>

				<select bind:value={distributionMedia}>
					{#each allPlatforms[0].media as media}
						<option value={media}>{mediaName[media]}</option>
					{/each}
				</select>
			</div>

			{#if distributionMedia === 'Floppy Disk'}
				<div>
					<img style="max-width: 200px; height: 200px;" src={floppy5inchImage} alt="" />
				</div>
			{:else if distributionMedia === 'Cassette Tape'}
				<div>
					<img style="max-width: 200px; height: 200px;" src={cassetteTapeImage} alt="" />
				</div>
			{/if}
		</div>

		{#if distributionMethod === 'Self Publish'}
			<div>
				<label for="">{$language.GAME_COST_PER_UNIT}: ${gamecost} ({distributionMedia})</label>
			</div>
		{/if}
	</div>
	<div class="flex-v">
		<label for="">{$language.PUBLISHER}</label>
		<select bind:value={distributionMethod} disabled={distributionMedia === 'ROM Cartridge'}>
			<option value="Self Publish" selected={distributionMedia !== 'ROM Cartridge'}
				>{$language.SELF_PUBLISH}</option>
			<option value="Publisher" selected={distributionMedia === 'ROM Cartridge'}
				>{$language.PUBLISHER}</option>
		</select>
	</div>

	{#if distributionMethod === 'Publisher'}
		<div
			style="width: 100%; display: grid; grid-template-columns: repeat(auto-fit, minmax(min(400px, 100%), 1fr)); gap: 1rem;">
			{#each publisherlistOfPlatform as publisher}
				{@const royalty = publisherestimateRoyalty(publisher, game, publisherlistOfPlatform)}

				<Card name={publisher.name}>
					<div slot="action" style="margin-left: auto;">
						{#if recentPublisherContact.has(publisher.id)}
							<Button
								variant="warning"
								on:click={() => {
									publisher.lastContact = $time.getTime();
									recentPublisherContact.add(publisher.id);
									game.publisherId = publisher.id;
									game.publisherRoyalies = royalty;

									setGameAndRelease();
								}}><span style="white-space: nowrap;">{$language.SIGN_A_CONTRACT}</span></Button>
						{:else}
							<Button
								variant="primary"
								on:click={() => {
									publisher.lastContact = $time.getTime();
									recentPublisherContact.add(publisher.id);
								}}>{$language.NEGOTIATE}</Button>
						{/if}
					</div>

					<div>
						<div>{$language.PUBLISHERS_SIZE}: <b>{publisher.size}</b></div>
						<div>
							{$language.PUBLISHERS_ROYALTIES}:
							<b
								>{recentPublisherContact.has(publisher.id)
									? (royalty * 100).toFixed(1)
									: '???'}%</b>
						</div>
					</div>
				</Card>
			{/each}
		</div>
	{/if}

	{#if distributionMethod === 'Self Publish'}
		<div>
			<Button variant="primary" grow on:click={setGameAndRelease}>{$language.RELEASE_GAME}</Button>
		</div>
	{/if}
</main>

<style>
	.flex-v {
		display: flex;
		gap: 0.5rem;
		flex-direction: column;
	}

	input[type='number'] {
		max-width: 8ch;
	}
</style>
