<div class="dropdown">
	<slot name="button" />
	<div class="dropdown-content">
		<slot />
	</div>
</div>

<style>
	.dropdown {
		position: relative;
		display: inline-block;
	}

	.dropdown-content {
		display: none;
		position: absolute;
		left: 0;
		border-radius: 0.5rem;
		background-color: var(--secondary-background-color);
		border: 1px solid var(--border-color-default);
		box-shadow: 0px 0.5rem 1rem 0px rgb(0 0 0 / 20%);
		padding: 0.3rem;
		z-index: 1;
		gap: 0.25rem;
		grid-auto-rows: 3rem;
		grid-auto-columns: max-content;
	}

	.dropdown:hover .dropdown-content {
		display: grid;
	}
</style>
