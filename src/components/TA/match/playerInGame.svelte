<script lang="ts">
	import type { Player } from "../../../models/TA/player";

	import Progress from "../../common/progress.svelte";
	export let player: Player;
</script>

<Progress progressPercent={parseFloat((player.Accuracy * 100).toFixed(2))} text={player.Name} />
<p>
	<span style="float: left">
		{player.Score}
	</span>
	<span style="float: right">
		{player.Combo}
	</span>
</p>
