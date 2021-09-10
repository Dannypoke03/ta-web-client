<script lang="ts">
	import { createEventDispatcher } from "svelte";

	import Button from "../components/common/button.svelte";
	import Options from "../components/TA/match/options.svelte";
	import PlayerInGame from "../components/TA/match/playerInGame.svelte";
	import PlayerWaiting from "../components/TA/match/playerWaiting.svelte";
	import type { Packet } from "../controllers/packet";
	import { DownloadStates, PlayStates } from "../models/TA/player";
	import { curentMatch, taWS } from "../stores/store";

	const dispatch = createEventDispatcher();

	$: client = $taWS.client;

	$: players = $taWS.client.State.Players.filter((x) => $curentMatch?.Players.map((y) => y.Id).includes(x.Id));

	$: allFinLoad = !players.every((x) => x.DownloadState != DownloadStates.None);
	$: allWait = players.every((x) => x.PlayState == PlayStates.Waiting);
	$: allInGame = players.every((x) => x.PlayState == 1);
	$: playersDownloading = players.some((x) => x.DownloadState == DownloadStates.Downloading);
	$: playersDownloaded = players.every((x) => x.DownloadState == DownloadStates.Downloaded);

	// options
	// function sendPacket(packet: Packet) {
	//     // dispatch("sendPacket", packet);
	// }
</script>

{#if $curentMatch}
	<div class="match">
		<div class="card title">
			<h2>Connected to {client.State.ServerSettings.ServerName}</h2>
			<span>Connected as: {client.Self.Name}</span>
		</div>
		<div class="split">
			<div class="players blankCard" class:playing={allInGame}>
				<h3>Players</h3>
				{#each players as player}
					<div class="card">
						{#if !allInGame}
							<PlayerWaiting {player} />
						{:else}
							<PlayerInGame {player} />
						{/if}
					</div>
				{/each}
			</div>
			<div class="options card">
				<Options />
			</div>
		</div>
		<div class="card">
			<Button text="Leave Match" on:click={() => ($curentMatch = null)} />
			<Button text="Close Match" on:click={() => $taWS.closeMatch($curentMatch)} />
		</div>
	</div>
{/if}

<style lang="scss">
	.match {
		display: flex;
		flex-direction: column;
	}
	.title {
		text-align: center;
	}
	.split {
		display: flex;
		flex-flow: row wrap;
	}
	.options {
		flex: 1;
		transition: all 400ms;
	}
	.players {
		display: flex;
		flex-direction: column;
		transition: all 400ms;
		&.playing {
			flex: 2;
		}
	}
</style>
