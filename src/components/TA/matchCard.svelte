<script lang="ts">
	import { imgErr } from "../../controllers/common";
	import type { Match } from "../../models/TA/match";
	import { curentMatch } from "../../stores/store";

	export let match: Match;
</script>

<div class="matchCard clickable" on:click={() => curentMatch.set(match)}>
	<p>{match.Leader.Name}'s Match</p>
	<hr />
	<br />
	Players
	<br />
	<div class="playerList">
		{#each match.Players as player}
			<div>
				<img loading="lazy" class="playerImg mini" src="https://new.scoresaber.com/api/static/avatars/{player.UserId}.jpg" on:error={imgErr} alt="{player.Name}'s profile image'" />
				<span>
					{player.Name}
				</span>
			</div>
		{/each}
	</div>
</div>

<style lang="scss">
	@import "../../styles/_themes.scss";
	.matchCard {
		> p {
			padding: 10px 20px;
			box-sizing: border-box;
			width: 100%;
		}
		padding: 10px 20px;
		position: relative;
		margin: 10px;
		background-color: #161616;
		border-radius: 10px;
		border: 1px solid #161616;
		box-shadow: 5px 5px 4px 4px rgba(0, 0, 0, 0.5);
		transition: all 400ms;
		&:hover:not(.selected):not(.noHover) {
			&.clickable {
				cursor: pointer;
			}
			border: 1px solid map-get($map: $blue, $key: 800);
			background-size: 160px 160px;
		}
	}
	.playerList {
		display: flex;
		flex-flow: row wrap;
		> div {
			margin: 5px;
			display: flex;
			align-items: center;
		}
	}
</style>
