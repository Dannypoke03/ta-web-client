<script lang="ts">
	export let value;
	export const change = null;
	export let defaultOption = null;
</script>

<div class="select">
	<!-- svelte-ignore a11y-no-onchange -->
	<select bind:value on:change>
		{#if defaultOption}
			<option selected disabled value="">{defaultOption}</option>
		{/if}
		<slot />
	</select>
</div>

<style>
	select {
		-webkit-appearance: none;
		-moz-appearance: none;
		-ms-appearance: none;
		appearance: none;
		outline: 0;
		box-shadow: none;
		border: 0 !important;
		background: #181818;
		background-image: none;
	}
	select::-ms-expand {
		display: none;
	}
	.select {
		position: relative;
		display: inline-flex;
		width: 12em;
		height: 2em;
		line-height: 2;
		background: #181818;
		overflow: hidden;
		border-radius: 0.25em;
	}
	select {
		flex: 1;
		padding: 0.1em 0.5em;
		margin-bottom: 0;
		color: #fff;
		cursor: pointer;
	}
	.select::after {
		content: "\25BC";
		position: absolute;
		top: 0;
		right: 0;
		padding: 0 0.5em;
		background: #2b2b2b;
		cursor: pointer;
		pointer-events: none;
		-webkit-transition: 0.25s all ease;
		-o-transition: 0.25s all ease;
		transition: 0.25s all ease;
	}
	.select:hover::after {
		color: #24756e;
	}
</style>
