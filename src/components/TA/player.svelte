<script lang="ts">
	import { createEventDispatcher } from "svelte";

	import type { Player } from "../../models/TA/player";

	export let player: Player;
	export let selectedPlayers: Player[] = [];

	const dispatch = createEventDispatcher();

	function updateSelect(p: Player) {
		dispatch("updatePlayer", p);
	}
</script>

<!-- class:selected={selectedPlayers.find((x) => x.Id == player.Id)} on:click={() => updateSelect(player)}  -->
<div class="infoCard playerCard clickable" class:selected={selectedPlayers.find((x) => x.Id == player.Id)} on:click={() => updateSelect(player)} style="background-image: url('https://new.scoresaber.com/api/static/avatars/{player.UserId}.jpg');">
	<p>{player.Name}</p>
</div>

<style lang="scss">
	@import "../../styles/card.scss";
</style>
