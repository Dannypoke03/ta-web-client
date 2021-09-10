<script lang="ts">
	export let placeholder = "Placeholder";
	export let value = "";
	export let inline = false;
</script>

<label for="inp" class="inp" class:inline>
	<input type="text" id="inp" placeholder="&nbsp;" bind:value />
	<span class="label">{placeholder}</span>
	<span class="focus-bg" />
</label>

<style lang="scss">
	.inp {
		position: relative;
		/* margin: auto; */
		width: 100%;
		max-width: 280px;
		border-radius: 3px;
		overflow: hidden;
		&.inline {
			display: inline-block;
		}
	}
	.inp .label {
		position: absolute;
		top: 20px;
		left: 12px;
		font-size: 16px;
		color: rgb(216, 216, 216);
		font-weight: 500;
		transform-origin: 0 0;
		transform: translate3d(0, 0, 0);
		transition: all 0.2s ease;
		pointer-events: none;
	}
	.inp .focus-bg {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: rgba(0, 0, 0, 0.05);
		z-index: -1;
		transform: scaleX(0);
		transform-origin: left;
	}
	.inp input {
		-webkit-appearance: none;
		-moz-appearance: none;
		appearance: none;
		width: 100%;
		border: 0;
		font-family: inherit;
		padding: 16px 12px 0 12px;
		height: 56px;
		font-size: 16px;
		font-weight: 400;
		background: rgba(255, 255, 255, 0.02);
		box-shadow: inset 0 -1px 0 rgba(255, 255, 255, 0.3);
		color: #fff;
		transition: all 0.15s ease;
	}
	.inp input:hover {
		background: rgba(255, 255, 255, 0.04);
		box-shadow: inset 0 -1px 0 rgba(255, 255, 255, 0.5);
	}
	.inp input:not(:-moz-placeholder-shown) + .label {
		color: rgb(216, 216, 216);
		transform: translate3d(0, -12px, 0) scale(0.75);
	}
	.inp input:not(:-ms-input-placeholder) + .label {
		color: rgb(216, 216, 216);
		transform: translate3d(0, -12px, 0) scale(0.75);
	}
	.inp input:not(:placeholder-shown) + .label {
		color: rgb(216, 216, 216);
		transform: translate3d(0, -12px, 0) scale(0.75);
	}
	.inp input:focus {
		background: rgba(0, 0, 0, 0.05);
		outline: none;
		box-shadow: inset 0 -2px 0 #0077ff;
	}
	.inp input:focus + .label {
		color: #0077ff;
		transform: translate3d(0, -12px, 0) scale(0.75);
	}
	.inp input:focus + .label + .focus-bg {
		transform: scaleX(1);
		transition: all 0.1s ease;
	}
</style>
