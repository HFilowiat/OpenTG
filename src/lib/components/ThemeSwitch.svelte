<script lang="ts">
	const storageKey = 'theme-preference';

	const getThemePreference = (): 'light' | 'dark' => {
		if (localStorage.getItem(storageKey)) {
			return <'light' | 'dark'>localStorage.getItem(storageKey);
		} else {
			return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
		}
	};

	const setThemePreference = (theme: 'light' | 'dark' = 'light') => {
		localStorage.setItem(storageKey, theme);
		reflectThemePreference(theme);
	};

	const toggleThemePrefernce = () => {
		setThemePreference(getThemePreference() === 'light' ? 'dark' : 'light');
	};

	const reflectThemePreference = (theme: 'light' | 'dark' = 'light') => {
		document.firstElementChild.setAttribute('data-theme', theme);
	};

	reflectThemePreference(getThemePreference());
</script>

<button on:click={toggleThemePrefernce}>
	<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
		<mask id="mask">
			<rect x="0" y="0" width="100%" height="100%" fill="white" />
			<circle cx="26" cy="9.5" r="4.5" fill="black" />
		</mask>

		<g>
			<circle class="sun-and-moon" cx="12" cy="12" r="5" fill="black" mask="url(#mask)" />
			<path
				class="sun-beams"
				d="M12 2V4M12 20V22M19.071 4.92894L17.6568 6.34315M6.34312 17.6569L4.92891 19.0711M2 12H4M20 12H22M4.92896 4.92892L6.34317 6.34314M17.6569 17.6568L19.0711 19.0711"
				stroke="black"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round" />
		</g>
	</svg>
</button>

<style>
	button {
		cursor: pointer;
		touch-action: manipulation;

		outline-offset: 5px;
		border-radius: 50%;
		background: none;
		border: none;
		aspect-ratio: 1;
	}

	svg {
		--icon-fill: #000;
		--icon-fill-hover: #222;

		--icon-fill-dark: #eee;
		--icon-fill-hover-dark: #fff;
	}

	.sun-beams {
		transition:
			opacity 0.5s cubic-bezier(0.5, 1.5, 0.75, 1.25),
			transform 0.5s cubic-bezier(0.5, 1.5, 0.75, 1.25);
	}

	.sun-and-moon,
	.sun-beams {
		transform-origin: center center;
	}

	button .sun-and-moon {
		fill: var(--icon-fill);
	}

	button:hover .sun-and-moon {
		fill: var(--icon-fill-hover);
	}

	button .sun-beams {
		stroke: var(--icon-fill);
	}

	button:hover .sun-beams {
		stroke: var(--icon-fill-hover);
	}

	#mask circle {
		transition: cx 0.25s cubic-bezier(0, 0, 0, 1);
		transition: transform 0.25s cubic-bezier(0, 0, 0, 1);
	}

	.sun-and-moon {
		transition: transform 0.5s cubic-bezier(0.5, 1.25, 0.75, 1.25);
	}
</style>
