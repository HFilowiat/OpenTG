<script lang="ts">
	import { onMount } from 'svelte';
	import imageOrangeII from '$lib/assets/images/image_platform_orange_II.jpg';
	import imagePET from '$lib/assets/images/image_platform_pet.jpg';
	import imageDRH80 from '$lib/assets/images/image_platform_drh_80.jpg';
	import imageAtari2600 from '$lib/assets/images/image_platform_ataru_2600.jpg';
	import imageIntelivision from '$lib/assets/images/image_platform_intelivision.jpg';
	import imageColecoVision from '$lib/assets/images/image_platform_coneco_vision.jpg';
	import imageOdessi2 from '$lib/assets/images/image_platform_odessi_2.jpg';
	import imageYES from '$lib/assets/images/image_platform_yes.jpg';
	import imageAtari5200 from '$lib/assets/images/image_platform_ataru_5200.jpg';
	import imageAtari7800 from '$lib/assets/images/image_platform_ataru_7800.jpg';
	import imageAtariXEGS from '$lib/assets/images/image_platform_ataru_xe.jpg';
	import imageSEGEMS from '$lib/assets/images/image_platform_sage_ms.jpg';
	import imageindev from '$lib/assets/images/image_platform_indev.jpg';
	import { language, newslist, selectedLanguage } from '$lib/ts/stores/Stores';
	import { platforms } from '$lib/ts/stores/Stores';
	import { get } from 'svelte/store';
	import backIcon from '$lib/assets/icons/icon_back.svg';
	import { getNewsHeader } from '$lib/ts/classes/News';

	$: dateTimeFormatter = new Intl.DateTimeFormat($selectedLanguage, {
		year: 'numeric',
		month: 'short',
		day: 'numeric'
	});

	$: numberFormatter = new Intl.NumberFormat($selectedLanguage, {
		notation: 'compact'
	});

	const allplatforms = get(platforms);
	console.log(allplatforms);

	const orangeII = allplatforms.find((x) => x.id === 'Orange.OrangeII');
	
	const platformImages = {
		'ORANGE_II': imageOrangeII,
		'PET': imagePET,
		'DRH_80': imageDRH80,
		'ATARU_2600': imageAtari2600,
		'ATARU_5200': imageAtari5200,
		'ATARU_7800': imageAtari7800,
		'INTELIVISION': imageIntelivision,
		'CONECO_VISION': imageColecoVision,
		'ODESSI_2': imageOdessi2,
		'YES': imageYES,
		'ATARU_XE': imageAtariXEGS,
		'SAGE_MS': imageSEGEMS,
		'IN_DEV': imageindev
	};

	onMount(() => {
		$newslist.forEach((news, i) => {
			if (news.seen === undefined) {
				news.seen = true;
				newslist.refresh();
			}
		});
	});
</script>

<header class="back">
	<a href="javascript:history.back()" class="back">
		<img src={backIcon} alt="" />
		<span>{$language.BACK}</span>
	</a>
</header>

<main>
	<div
		style="width: 100%;display: grid;grid-template-columns: minmax(min(100px, 100%), 700px);gap: 1rem;background: var(--primary-background-color);border-radius: 1rem;justify-content: center;">
		{#each $newslist.sort((a, b) => b.date.getTime() - a.date.getTime()) as news}
			<button class="cardlike" style="flex-direction:row">
				<div
					style="display: flex;width: 100%;justify-content: space-between;flex-direction: column; gap: 0.25rem;">
					<div
						style="display: flex;gap: 0.5rem; flex-direction: column; align-items: flex-start; width: 100%;justify-content: space-between; padding: 0.75rem;">
						<span style="font-weight: 600; margin: 0">{getNewsHeader(news)}</span>
						<small style="font-weight: 600; margin: 0">{dateTimeFormatter.format(news.date)}</small>
					</div>

					{#if news.content}
						{@const contentArray = news.content.split('\n').filter((x) => x !== '')}

						<div class="letter-container">
							<div class="letter">
								<h1>{contentArray[0]}</h1>

								<img
									class="image"
									src={platformImages[orangeII.imagesrc]}
									style="width:100%; max-height:100px" />

								{#each contentArray.slice(1) as c}
									<p>{c}</p>
								{/each}
							</div>
						</div>
					{/if}
				</div>
			</button>
		{/each}
	</div>
</main>

<style>

	.image {
		object-fit: cover;
		width: 100%;
		max-height: 300px;
		filter: grayscale(1);
	}

	.letter-container {
		padding: 1rem;
		max-height: 400px;
		overflow: hidden;

		font-family: serif;
	}

	.letter {
		background: #bebdb9;
		box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
		margin: 26px auto 0;
		max-width: 550px;
		min-height: 300px;
		padding: 24px;
		position: relative;
		width: 80%;
		color: #1b1a16;
		isolation: isolate;
		transform: rotate(-3deg);

		align-items: flex-start;
		padding: 2rem 3rem 4rem;
		display: flex;
		flex-direction: column;
	}
	.letter:before,
	.letter:after {
		content: '';
		height: 98%;
		position: absolute;
		width: 100%;
		z-index: -1;
	}
	.letter:before {
		background: #dadada;
		box-shadow: 0 0 8px rgba(0, 0, 0, 0.2);
		left: -5px;
		top: 4px;
		transform: rotate(-1.5deg);
	}
	.letter:after {
		background: #dadada;
		box-shadow: 0 0 3px rgba(0, 0, 0, 0.2);
		right: -3px;
		top: 1px;
		transform: rotate(1.4deg);
	}
</style>
