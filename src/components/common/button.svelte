<script lang="ts">
	export let text = "Button";
	export let disabled = false;
	export let primary = false;
	export let secondary = false;
	export let danger = false;
	export let inline = false;
</script>

<button on:click class="cus-btn btn-3" class:danger class:inline class:primary class:secondary {disabled}>
	<span>
		{text}
	</span>
</button>

<style lang="scss">
	@import "../../styles/_themes.scss";
	.cus-btn {
		box-sizing: border-box;
		padding: 10px 25px;
		border: 2px solid #000;
		font-family: "Lato", sans-serif;
		font-weight: 500;
		background: transparent;
		cursor: pointer;
		transition: all 0.3s ease;
		position: relative;
		display: inline-block;
		overflow: hidden;
		transition: all 200ms;
		&.inline {
			display: inline-block;
		}
		&:hover {
			// box-shadow: -7px -7px 20px 0px rgba(255, 255, 255, 0.056), -4px -4px 5px 0px rgba(255, 255, 255, 0.056), 7px 7px 20px 0px #0002, 4px 4px 5px 0px #0001;
			box-shadow: 0px 8px 15px rgba(0, 0, 0, 0.4);
			// font-size: 18px;
		}
		&:after {
			content: "";
			background: rgba(241, 241, 241, 0.2);
			display: block;
			position: absolute;
			padding-top: 300%;
			padding-left: 350%;
			margin-left: -20px !important;
			margin-top: -120%;
			opacity: 0;
			border-radius: 8px;
			transition: all 0.8s;
		}
		&:active:after {
			padding: 0;
			margin: 0;
			opacity: 1;
			transition: 0s;
		}
		&.primary {
			color: map-get($map: $purple, $key: 600);
			border: 0.15em solid map-get($map: $purple, $key: 600);
		}
		&.secondary {
			color: map-get($map: $blue, $key: 600);
			border: 0.15em solid map-get($map: $blue, $key: 600);
		}
		&.danger {
			color: #b71c1c;
			border: 0.15em solid #b71c1c;
		}
		&:disabled {
			cursor: not-allowed !important;
			color: grey;
			border: 0.15em solid grey;
		}
	}
</style>
