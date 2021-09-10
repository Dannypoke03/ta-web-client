<script lang="ts">
	import { DownloadStates, PlayStates } from "../../../models/TA/player";
	import type { Player as IPlayer } from "../../../models/TA/player";
	import { quintOut } from "svelte/easing";
	import { crossfade } from "svelte/transition";
	import { imgErr } from "../../../controllers/common";

	const [send, receive] = crossfade({
		duration: (d) => Math.sqrt(d * 200),

		fallback(node, params) {
			const style = getComputedStyle(node);
			const transform = style.transform === "none" ? "" : style.transform;

			return {
				duration: 600,
				easing: quintOut,
				css: (t) => `
					transform: ${transform} scale(${t});
					opacity: ${t}
				`,
			};
		},
	});

	export let player: IPlayer;
</script>

<div in:receive={{ key: player.Id }} out:send={{ key: player.Id }} class="infoCard">
	<div style="display: flex; align-items: center; margin: 5px 0;">
		<img loading="lazy" class="playerImg mini" src="https://new.scoresaber.com/api/static/avatars/{player.UserId}.jpg" on:error={imgErr} alt="{player.Name}'s profile image'" />
		<b>{player.Name}</b>
	</div>
	<hr />
	<b>Score: </b>

	{player.Score}
	<br />
	<b>Accuracy: </b>
	{(player.Accuracy * 100).toFixed(2)}%
	<br />
	<b>Combo: </b>
	{player.Combo}
	<br />
	<hr />
	<b>Team: </b>
	{player.Team.Name}
	<br />
	<b>Play State: </b>
	{PlayStates[player.PlayState]}
	<br />
	<b>Download State: </b>
	{DownloadStates[player.DownloadState]}
	<hr />
	<!-- <Button text="Kick" secondary on:click={() => kickFromMatch(player)} /> -->
</div>
