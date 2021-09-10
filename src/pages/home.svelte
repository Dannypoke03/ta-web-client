<script lang="ts">
	import { curentMatch, taWS } from "../stores/store";
	import Connect from "./connect.svelte";
	import Main from "./main.svelte";
	import Match from "./match.svelte";
</script>

<main>
	<!-- <p>TA Web Client Home page</p> -->
	{#if !$taWS}
		<Connect />
	{:else if $curentMatch}
		<Match />
	{:else if $taWS.connected}
		<Main />
	{/if}
</main>
<br />
<br />
<br />
<br />
<pre>
    {JSON.stringify($taWS, undefined, 2)}
</pre>

<style lang="scss">
</style>
