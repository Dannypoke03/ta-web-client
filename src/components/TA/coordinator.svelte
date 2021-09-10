<script lang="ts">
	import { imgErr } from "../../controllers/common";

	import type { User } from "../../models/TA/User";

	export let coord: User;
	export let Self: User;
</script>

{#if coord.UserId != "0"}
	<div class="infoCard coordCard" style={coord.Id == Self.Id ? "order: -1;" : ""}>
		<img src="https://new.scoresaber.com/api/static/avatars/{coord.UserId}.jpg" on:error={imgErr} alt="" />
		<p>
			{#if coord.Id == Self.Id}
				<b>{coord.Name}</b>
			{:else}
				{coord.Name}
			{/if}
		</p>
	</div>
{:else}
	<div class="infoCard" style={coord.Id == Self.Id ? "order: -1;" : ""}>
		<p>
			{#if coord.Id == Self.Id}
				<b>{coord.Name}</b>
			{:else}
				{coord.Name}
			{/if}
		</p>
	</div>
{/if}

<style lang="scss">
	@import "../../styles/card.scss";
</style>
