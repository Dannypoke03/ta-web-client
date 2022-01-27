<script>
	import { fakePlayers } from "../../stores/store";
	import Button from "../common/button.svelte";
</script>

<div class="fakePlayers">
	<div class="infoCard">
		<div>Test Player</div>
		{#if $fakePlayers.displayMessage}
			<div class="message">
				<h2>{$fakePlayers.displayMessage.MessageTitle}</h2>
				<p>
					{$fakePlayers.displayMessage.MessageText}
				</p>
				{#if $fakePlayers.displayMessage.Option1}
					<Button text={$fakePlayers.displayMessage.Option1.Label} on:click={() => $fakePlayers.sendResponse($fakePlayers.displayMessage, $fakePlayers.displayMessage.Option1.Value)} />
				{/if}
				{#if $fakePlayers.displayMessage.Option2}
					<Button text={$fakePlayers.displayMessage.Option2.Label} on:click={() => $fakePlayers.sendResponse($fakePlayers.displayMessage, $fakePlayers.displayMessage.Option2.Value)} />
				{/if}
				{#if $fakePlayers.displayMessage.CanClose}
					<Button text="Close" on:click={() => $fakePlayers.closeMessage()} />
				{/if}
			</div>
		{/if}
		<br />
		<hr />
		<br />
		<Button text="Connect" on:click={() => $fakePlayers.connect()} />
		<Button text="Disconnect" on:click={() => $fakePlayers.disconnect()} />
	</div>
</div>

<style lang="scss">
	@import "../../styles/card.scss";
	.fakePlayers {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
	}
</style>
