<script lang="ts">
	import { tweened } from "svelte/motion";
	import { cubicOut } from "svelte/easing";

	const progress = tweened(0, {
		duration: 500,
		easing: cubicOut,
	});

	export let progressPercent = 100;
	export let text: string = "";

	$: progressPercent = progressPercent > 100 ? 100 : progressPercent;

	$: progress.set(progressPercent);

	$: dispText = progressPercent > 20;

	let color = Math.floor(Math.random() * 16777215).toString(16);
</script>

<div class="progress progress-striped">
	<div style="width: {$progress}%; background-color: #{color}" class="progress-bar">
		{#if text != ""}
			<p>
				{text}
			</p>
		{:else}
			<slot />
		{/if}
		{#if dispText}
			<span> {$progress.toFixed(2)}% </span>
		{/if}
	</div>
</div>

<style type="scss">
	.progress {
		padding: 6px;
		background: rgba(0, 0, 0, 0.25);
		border-radius: 6px;
		box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.25), 0 1px rgba(255, 255, 255, 0.08);
		box-sizing: border-box;
	}

	.progress-bar {
		border-radius: 4px;
		height: 28px;
	}

	.progress-striped .progress-bar {
		border-right: 5px solid white;
		box-sizing: border-box;
		position: relative;
		/* width: 100%; */
		> span {
			position: absolute;
			// float: right;
			right: 0;
			padding: 5px;
			font-weight: bold;
			text-shadow: 2px 2px #000000;
		}
		> p {
			margin: 0;
			position: absolute;
			left: 0;
			padding: 5px;
			font-weight: bold;
		}
	}
</style>
