<script lang="ts">
	import Home from "./pages/home.svelte";
	import { modal } from "./stores/store";
	import Modal from "./components/common/modal.svelte";
</script>

<Modal show={$modal}>
	<main>
		<Home />
	</main>
</Modal>

<style lang="scss">
	@import "./styles/_themes.scss";
	:global(*) {
		margin: 0px;
		box-sizing: border-box;
		color: white;
	}
	:global(body) {
		background-color: #0a0a0a;
	}
	:global(.card) {
		background-color: #202124;
		border: 0;
		box-shadow: 0 2px 10px rgba(0, 0, 0, 0.24);
		transition: all 0.3s ease;
		border-radius: 0.25rem;
		padding: 20px;
		transition: box-shadow 0.3s ease-in-out 0s;
		margin: 10px;
	}
	:global(.blankCard) {
		border: 0;
		padding: 20px;
		margin: 10px;
	}
	:global(.playerImg) {
		border-radius: 15px;
		display: block;
		height: 64px;
		width: 64px;
		margin: 15px;
		box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.5);
	}
	:global(.playerImg.mini) {
		border-radius: 50%;
		height: 20px;
		width: 20px;
		display: inline-block;
		margin: 0px;
		margin-right: 8px;
	}
</style>
