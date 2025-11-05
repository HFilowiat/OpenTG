<script lang="ts">
	import { language } from '$lib/ts/stores/Stores';
	import backIcon from '$lib/assets/icons/icon_back.svg';
</script>

<header class="back">
	<a href="javascript:history.back()" class="back">
		<img src={backIcon} alt="" />
		<span>{$language.BACK}</span>
	</a>
	<h1>{$language.CREDITS}</h1>
</header>

<main>
	<div style="text-align: center;padding: 1rem;max-width: 80ch;margin: 0 auto;">
		<b>Programming, Design and Art</b>
		<p>Ahmed Ali</p>

		<b>Music</b>
		<p>Mahmood Ali (aka. Mahmood Shaheen)</p>

		<p>
			Thank you to our amazing community for their feedback, and special thanks to our playtesters
			who helped us squash bugs and improve the game.
		</p>

		<b>Playtesters</b>
		<p>Enderlais (<a target="_blank" href="https://discord.com/users/655451708620800041">Discord</a>)</p>
		<p>ChrisDo (<a target="_blank" href="https://discord.com/users/804625973785657356">Discord</a>)</p>
	</div>
</main>
