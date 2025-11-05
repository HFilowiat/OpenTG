<script lang="ts">
	import warningIcon from '$lib/assets/icons/icon_warning.svg';
</script>

<div>
	<img src={warningIcon} alt="" />
	<span>
		<slot></slot>
	</span>
</div>

<style>
	div {
		display: flex;
		gap: 0.5rem;
		background-color: #8e773830;
		padding: 0.5rem;
		border-radius: 0.5rem;
	}
</style>
