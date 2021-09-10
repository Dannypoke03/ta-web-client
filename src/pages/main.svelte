<script lang="ts">
	import { text } from "svelte/internal";
	import Button from "../components/common/button.svelte";
	import Coordinator from "../components/TA/coordinator.svelte";
	import Match from "../components/TA/matchCard.svelte";
	import Player from "../components/TA/player.svelte";
	import { taWS } from "../stores/store";
	import type { Player as IPlayer } from "../models/TA/player";
	import MatchCard from "../components/TA/matchCard.svelte";
	$: client = $taWS.client;
	$: state = $taWS.client.State;

	let selectedPlayers: IPlayer[] = [];
	function updateSelect(p: IPlayer) {
		let i = selectedPlayers.findIndex((x) => x.Id === p.Id);
		console.log(i);
		if (i === -1) {
			selectedPlayers.push(p);
		} else {
			selectedPlayers.splice(i, 1);
		}
		selectedPlayers = selectedPlayers;
	}

	function createMatch() {
		$taWS.createMatch(selectedPlayers);
		selectedPlayers = [];
	}
</script>

<div class="connectedDisplay">
	<div class="card title">
		<h2>Connected to {client.State.ServerSettings.ServerName}</h2>
		<span>Connected as: {client.Self.Name}</span>
	</div>
	<div class="card">
		<h2>Matches</h2>
		<div class="cards">
			{#each state.Matches as match}
				<MatchCard {match} />
			{/each}
		</div>
		{#if state.Matches.length === 0}
			<p>There are currently no ongoing matches.</p>
		{/if}
	</div>
	<div class="flexSplit">
		<div class="card">
			<h2>Coordinators</h2>
			<div class="cards">
				{#each state.Coordinators as coord}
					<Coordinator {coord} Self={client.Self} />
				{/each}
			</div>
		</div>
		<div class="card">
			<h2>Players</h2>
			<div class="cards">
				{#each state.Players as player}
					<Player bind:player bind:selectedPlayers on:updatePlayer={(e) => updateSelect(e.detail)} />
				{/each}
			</div>
			<br />
			{#if selectedPlayers.length > 0}
				<Button text="Create Match" on:click={createMatch} />
			{/if}
		</div>
	</div>
	<div class="card">
		<Button text="Disconect" on:click={() => $taWS.disconnect()} />
	</div>
</div>

<style lang="scss">
	.title {
		text-align: center;
		h2 {
			display: block;
		}
	}
	.connectedDisplay {
		display: flex;
		flex-direction: column;
	}
	.flexSplit {
		display: flex;
		flex-flow: row wrap;
		> div {
			flex: 1;
		}
	}
	.cards {
		display: flex;
		flex-flow: row wrap;
		align-items: flex-start;
		align-content: flex-start;
	}
</style>
