<script lang="ts">
	import { Mod } from '$lib/ts/classes/Mod';

	Mod.updateRepositories();
</script>

<slot></slot>

<style>
	:root {
		/* this section is supposed to contain all the global styles so that we can easily update the game theme */
		color-scheme: dark light;

		-webkit-user-select: none;
		user-select: none;

		font-size: 1rem;

		--surface2-color: #313131;
		--surface2-color-hover: #414141;

		--thin-text-color: #999;

		--primary-background-color: #0f0f0f;
		--secondary-background-color: #1d1d1d;
		--secondary-background-color-1: #171717;
		--tertiary-background-color: #343434;

		--primary-foreground-color: #f8f8f8;
		--secondary-foreground-color: #fff;
		--tertiary-foreground-color: #fff;

		--shadow-color-default: #0002;
		--border-color-default: hsl(206, 0%, 14%);

		--button-color-background: #ffffff;
		--button-color-background-hover: hsl(210, 0%, 15%);
		--button-color-background-disabled: hsl(200, 0%, 17%);
		--button-color-border: hsl(204, 0%, 15%);
		--button-color-background-primary: #5394ec;
		--button-color-background-primary-alpha: #5394ec11;

		--text-color-normal: #fff;

		--switch-background: #25282b;
		--switch-background-disabled: #212426;
		--switch-circle-background: #5b6167;
		--switch-circle-background-disabled: #393f44;
		--switch-circle-on: var(--button-color-background-primary);

		--error-background-color: #8e38385c;
	}

	:global(*),
	:global(*::before),
	:global(*::after) {
		box-sizing: border-box;
		-webkit-tap-highlight-color: transparent;
	}

	:global(body) {
		background-color: var(--primary-background-color);
		color: var(--text-color-normal);
		margin: 0;

		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen-Sans, Ubuntu,
			Cantarell, 'Helvetica Neue', sans-serif;

		display: flex;
		flex-direction: column;
		height: max-content;
		min-height: 100vh;
	}

	:global(a) {
		color: inherit;
	}

	:global(.selected) {
		background-color: var(--button-color-background-primary-alpha);
		color: var(--button-color-background-primary);
	}

	:global(.listcard) {
		display: flex;
		gap: 1rem;
		padding: 0.5em 2em;
		text-align: start;
		align-items: start;
	}

	:global(.listcard:hover) {
		background: var(--button-color-background-hover);
	}

	:global(label) {
		display: block;
		color: var(--primary-foreground-color);
	}

	:global(img),
	:global(svg) {
		pointer-events: none;
	}

	:global(button),
	:global(textarea) {
		font-family: inherit;
		font-size: inherit;
		-webkit-padding: 0.4em 0;
		padding: 0.4em;
		margin: 0 0 0.5em 0;
		border: 1px solid var(--border-color-default);
		border-radius: 2px;
	}

	:global(input:disabled) {
		color: var(--primary-foreground-color);
	}

	:global(input) {
		color: var(--text-color-normal);
		border: 0px;
		background: transparent;
		font-size: 1.3rem;
		font-weight: 500;
	}

	:global(select) {
		font-family: inherit;
		font-size: inherit;
		color: var(--text-color-normal);
		border: 2px solid var(--button-color-border, rgba(0, 0, 0, 0.1));
		background-color: var(--secondary-background-color);
		margin: 0;
		padding: 0.5rem 1rem;
		border-radius: 0.5rem;
	}

	:global(button) {
		margin: 0;
		border: 1px solid var(--button-color-border, rgba(0, 0, 0, 0.1));
		background-color: var(--primary-background-color);
		color: var(--text-color-normal);
		border-radius: 6px;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		transition: background-color 0.1s;
		padding: 0.4em 0.8em;
	}

	:global(button:hover) {
		background-color: var(--button-color-background-hover, rgba(0, 0, 0, 0.06));
	}

	:global(button:disabled) {
		background: var(--button-color-background-disabled);
		color: var(--primary-foreground-color);
		cursor: not-allowed;
	}

	:global(button.cardlike) {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		padding: 0;
		margin: 0;
		align-items: stretch;
		text-align: start;

		border: 1px solid var(--border-color-default);
		background-color: var(--secondary-background-color);
		border-radius: 8px;
		justify-content: flex-start;
		overflow: hidden;
	}

	:global(a.cardlike) {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		padding: 0;
		margin: 0;
		align-items: stretch;
		text-align: start;
		flex: 1;
		padding: 1rem;
		text-decoration: none;
		color: inherit;

		border: 1px solid var(--border-color-default);
		background-color: var(--secondary-background-color);
		border-radius: 8px;
		justify-content: flex-start;
		overflow: hidden;
	}

	:global(.blink) {
		animation: blinking 1s infinite;
		animation-direction: alternate;
		animation-timing-function: cubic-bezier(0.42, 0.67, 0.73, 1.07);
	}

	@keyframes blinking {
		0% {
			background-color: var(--secondary-background-color);
			border: 1px solid var(--tertiary-background-color);
		}
		100% {
			background-color: var(--tertiary-background-color);
			border: 1px solid var(--secondary-background-color);
		}
	}

	:global(.chip) {
		display: flex;
		align-items: center;
		background-color: var(--tertiary-background-color);

		width: -moz-fit-content;
		width: fit-content;
		border-radius: 0.5rem;
		padding: 0.25rem 0.5rem;
		gap: 0.5rem;
		text-decoration: none;
		color: var(--secondary-foreground-color);
		transition: all;
	}

	:global(header) {
		position: sticky;
		top: 0;
		z-index: 1000;
		background: var(--primary-background-color);
	}

	:global(header.back) {
		padding: 1rem 6rem 0.5rem 1rem;
		display: flex;
		flex-direction: row;
		align-items: center;
		gap: 1rem;
	}

	@media (width < 600px) {
		:global(header.back a.back span) {
			display: none;
		}
	}

	:global(header h1) {
		width: 100%;
		text-align: center;
		margin: 0;
		font-size: 1.5rem;
	}

	:global(header a img) {
		filter: invert(1);
	}

	:global(header a) {
		display: flex;
		align-items: center;
		background-color: var(--secondary-background-color);

		width: -moz-fit-content;
		width: fit-content;
		border-radius: 10rem;
		padding: 0.5rem 1rem;
		min-height: 3rem;
		gap: 0.5rem;
		text-decoration: none;
		color: var(--secondary-foreground-color);
		transition: all;
	}

	:global(header a:hover) {
		background-color: var(--tertiary-background-color);
	}

	:global(main) {
		flex: 1;
		padding: 1rem;
		display: flex;
		gap: 1rem;
		flex-direction: column;
	}

	:global(.stack) {
		display: grid;
		grid: [stack] 1fr / [stack] 1fr;
	}

	:global(.stack > *) {
		grid-area: stack;
	}

	:global(.rounded-button-icon) {
		border: 0;
		width: 3rem;
		height: 3rem;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: var(--secondary-background-color);
	}

	:global(.rounded-button-icon img) {
		filter: invert(1);
	}

	:global(.rounded-button-icon:hover) {
		background-color: var(--tertiary-background-color);
	}

	:global(.single-line-text) {
		white-space: nowrap;
		text-overflow: ellipsis;
		overflow: hidden;
	}

	:global(.input-group) {
		display: flex;
		gap: 0.1rem;
		border: 2px solid var(--secondary-background-color);
		border-radius: 0.5rem;
		align-content: center;
		align-items: stretch;
		overflow: hidden;
		padding: 0.25rem;
	}

	:global(.input-group:focus-within) {
		border-color: var(--button-color-background-primary);
	}

	:global(.input-group input) {
		width: 100%;
		padding: 0rem 0 0rem 1rem;
		outline: 0;
	}

	:global(.input-group button) {
		width: 2.5rem;
		height: 2.5rem;
		border: 0px;
		margin: 0px;
		background: transparent;
		padding: 0.5rem;
		border-radius: 0;
		outline-offset: -2px;
		border-radius: 0.5rem;
	}

	:global(button.dice:hover) {
		background-color: var(--secondary-background-color);
	}
</style>
