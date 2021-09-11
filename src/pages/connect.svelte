<script lang="ts">
	import Cookies from "js-cookie";
	import Button from "../components/common/button.svelte";

	import Input from "../components/common/input.svelte";
	import { TAWebsocket } from "../controllers/taWebsocket";
	import { taWS } from "../stores/store";

	let address = Cookies.get("HostIP") ?? "";
	let uname = Cookies.get("Name") ?? "";
	let uid = Cookies.get("UserId") ?? "";
	let pass = "";

	async function connect() {
		Cookies.set("HostIP", address, { sameSite: "strict" });
		Cookies.set("Name", uname, { sameSite: "strict" });
		Cookies.set("UserId", uid, { sameSite: "strict" });
		let client = new TAWebsocket(uname, address, pass);
		let t = await client.connect();
		if (t === "Connected") {
			$taWS = client;
		}
	}
</script>

<div class="connect">
	<div class="card">
		<h3>Connect To TA Server</h3>
		<Input placeholder="Scoresaber Id" bind:value={uid} />
		<Input placeholder="Overlay Host Address" bind:value={address} />
		<Input placeholder="Username" bind:value={uname} />
		<Input placeholder="Password (Optional)" bind:value={pass} />
		<Button on:click={connect} text="Connect" />
	</div>
</div>

<style lang="scss">
	.connect {
		text-align: center;
		display: flex;
		justify-content: center;
		align-items: center;
		> div {
			display: inline-block;
		}
	}
</style>
