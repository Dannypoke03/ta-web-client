<script lang="ts">
	export let label: string = "";
	export let checked = false;
</script>

<label>
	<input class="inp-cbx" type="checkbox" bind:checked />
	<div class="cbx">
		<span>
			<svg width="12px" height="10px">
				<use xlink:href="#check" />
			</svg>
		</span>
		<span>
			{label}
		</span>
	</div>
</label>

<svg class="inline-svg">
	<symbol id="check" viewBox="0 0 12 10">
		<polyline points="1.5 6 4.5 9 10.5 1" />
	</symbol>
</svg>

<style type="scss">
	.cbx {
		-webkit-user-select: none;
		user-select: none;
		cursor: pointer;
		padding: 6px 8px;
		border-radius: 6px;
		overflow: hidden;
		transition: all 0.2s ease;
	}
	.cbx:not(:last-child) {
		margin-right: 6px;
	}
	.cbx:hover {
		background: #eb33ff17;
	}
	.cbx span {
		float: left;
		vertical-align: middle;
		transform: translate3d(0, 0, 0);
	}
	.cbx span:first-child {
		position: relative;
		width: 18px;
		height: 18px;
		border-radius: 4px;
		transform: scale(1);
		border: 1px solid #cccfdb;
		transition: all 0.2s ease;
		box-shadow: 0 1px 1px #eb33ff17;
	}
	.cbx span:first-child svg {
		position: absolute;
		top: 3px;
		left: 2px;
		fill: none;
		stroke: #fff;
		stroke-width: 2;
		stroke-linecap: round;
		stroke-linejoin: round;
		stroke-dasharray: 16px;
		stroke-dashoffset: 16px;
		transition: all 0.3s ease;
		transition-delay: 0.1s;
		transform: translate3d(0, 0, 0);
	}
	.cbx span:last-child {
		padding-left: 8px;
		line-height: 18px;
	}
	.cbx:hover span:first-child {
		border-color: #6f1876;
	}
	.inp-cbx {
		position: absolute;
		visibility: hidden;
	}
	.inp-cbx:checked + .cbx span:first-child {
		background: #6f1876;
		border-color: #6f1876;
		animation: wave 0.4s ease;
	}
	.inp-cbx:checked + .cbx span:first-child svg {
		stroke-dashoffset: 0;
	}
	.inline-svg {
		position: absolute;
		width: 0;
		height: 0;
		pointer-events: none;
		user-select: none;
	}
</style>
