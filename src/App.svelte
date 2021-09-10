<script lang="ts">
	// declare Instascan;
	import Home from "./pages/home.svelte";
	import jsQR from "jsqr";
	import { onMount } from "svelte";
	import type { Point } from "jsqr/dist/locator";
	// let QRious = require("qrious");
	import QRious from "qrious";
	import { QR } from "./controllers/qr";
	// onMount(() => {});
	import pako from "pako";

	async function startCapture() {
		let captureStream = null;

		try {
			// @ts-ignore
			captureStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
		} catch (err) {
			console.error("Error: " + err);
		}
		return captureStream;
	}
	var video;
	var canvasElement: HTMLCanvasElement;
	var canvas: CanvasRenderingContext2D;
	async function test() {
		video = document.createElement("video");
		canvas = canvasElement.getContext("2d");
		let cap = await startCapture();
		iterated = false;
		if (cap) {
			video.srcObject = cap;
			video.play();
			requestAnimationFrame(tick);
		}
	}
	let iterated = false;
	function tick() {
		if (video.readyState === video.HAVE_ENOUGH_DATA) {
			canvas.drawImage(video, 0, 0, canvasElement.width, canvasElement.height);
			for (const square of squares) {
				var imageData = canvas.getImageData(square[0], square[1], square[2], square[3]);
				var code = jsQR(imageData.data, imageData.width, imageData.height, {
					inversionAttempts: "dontInvert",
				});
				if (code) {
					let topLeft = {
						x: square[0],
						y: square[1],
					};
					drawLine(addPoints(code.location.topLeftCorner, topLeft), addPoints(code.location.topRightCorner, topLeft), "#1effe6");
					drawLine(addPoints(code.location.topRightCorner, topLeft), addPoints(code.location.bottomRightCorner, topLeft), "#1effe6");
					drawLine(addPoints(code.location.bottomRightCorner, topLeft), addPoints(code.location.bottomLeftCorner, topLeft), "#1effe6");
					drawLine(addPoints(code.location.bottomLeftCorner, topLeft), addPoints(code.location.topLeftCorner, topLeft), "#1effe6");
					let center = {
						x: topLeft.x + (code.location.topLeftCorner.x + code.location.topRightCorner.x) / 2,
						y: topLeft.y + (code.location.topLeftCorner.y + code.location.bottomLeftCorner.y) / 2,
					};
					drawLine(center, addPoints(center, { x: 1, y: 1 }), "red");
					console.log(code.data, center);
				} else {
				}
			}
		}
		if (!iterated) requestAnimationFrame(tick);
	}
	function drawLine(begin, end, color) {
		canvas.beginPath();
		canvas.moveTo(begin.x, begin.y);
		canvas.lineTo(end.x, end.y);
		canvas.lineWidth = 4;
		canvas.strokeStyle = color;
		canvas.stroke();
	}
	function addPoints(a: Point, b: Point): Point {
		return {
			x: a.x + b.x,
			y: a.y + b.y,
		};
	}

	function stopCapture(evt) {
		iterated = true;
		let tracks = video.srcObject.getTracks();

		tracks.forEach((track) => track.stop());
		video.srcObject = null;
	}

	const maxSquares = 2;

	onMount(() => {
		var canvas = <HTMLCanvasElement>document.getElementById("canvas");
		var overlay = <HTMLCanvasElement>document.getElementById("overlay");
		var ctx = canvas.getContext("2d");
		var ctxo = overlay.getContext("2d");

		// style the context
		ctx.strokeStyle = "#6f1876";
		ctx.lineWidth = 3;
		ctxo.strokeStyle = "#6f1876";
		ctxo.lineWidth = 3;

		var offsetX = canvas.offsetLeft;
		var offsetY = canvas.offsetTop;

		var isDown = false;
		var startX: number;
		var startY: number;

		var prevStartX = 0;
		var prevStartY = 0;

		var prevWidth = 0;
		var prevHeight = 0;

		function handleMouseDown(e) {
			e.preventDefault();
			e.stopPropagation();
			startX = e.clientX - offsetX + window.scrollX;
			startY = e.clientY - offsetY + window.scrollY;
			isDown = true;
		}

		function handleMouseUp(e) {
			e.preventDefault();
			e.stopPropagation();
			isDown = false;
			if (squares.length == maxSquares) squares.shift();
			squares.push([prevStartX, prevStartY, prevWidth, prevHeight]);
			ctxo.clearRect(0, 0, overlay.width, overlay.height);
			for (const square of squares) {
				ctxo.strokeRect(square[0], square[1], square[2], square[3]);
			}
			squares = squares;
		}

		function handleMouseOut(e) {
			e.preventDefault();
			e.stopPropagation();
			isDown = false;
		}

		function handleMouseMove(e) {
			e.preventDefault();
			e.stopPropagation();
			if (!isDown) {
				return;
			}
			let mouseX = e.clientX - offsetX + window.scrollX;
			let mouseY = e.clientY - offsetY + window.scrollY;
			var width = mouseX - startX;
			var height = mouseY - startY;
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			ctx.strokeRect(startX, startY, width, height);
			prevStartX = startX;
			prevStartY = startY;
			prevWidth = width;
			prevHeight = height;
		}

		// listen for mouse events
		canvas.addEventListener("mousemove", handleMouseMove, false);
		canvas.addEventListener("mousedown", handleMouseDown, false);
		canvas.addEventListener("mouseup", handleMouseUp, false);
		canvas.addEventListener("mouseout", handleMouseOut, false);
	});
	let squares = [];

	async function genQR() {
		let qr = new QR("https://github.com/neocotic/qrious");
		console.log(await qr.imageData);
		console.log((await qr.base64Data).length);
		console.log(btoa(pako.deflate(await qr.base64Data, { to: "string" })).length);

		document.getElementById("test").innerHTML = `<img src="${await qr.code.toDataURL()}" />`;
		document.getElementById("test").appendChild(qr.canvas);
		// let tmpCanvas: HTMLCanvasElement = document.createElement("canvas");
		// tmpCanvas.width = 100;
		// tmpCanvas.height = 100;
		// let tmpCTX = tmpCanvas.getContext("2d");
		// tmpCTX.fillStyle = "green";
		// tmpCTX.fillRect(0, 0, 100, 100);
		// // document.getElementById("test").innerHTML += `<img src="${tmpCanvas.toDataURL()}" />`;
		// // console.log(_base64ToArrayBuffer(qrCode.toDataURL().replace("data:image/png;base64,", "")));
		// console.log(_base64ToArrayBuffer(tmpCanvas.toDataURL().replace("data:image/png;base64,", "")));
	}

	function test2() {
		let canvas = <HTMLCanvasElement>document.getElementById("test");
		console.log(canvas);
		let ctx = canvas.getContext("2d");
		console.log(ctx);
		var imageData = ctx.getImageData(0, 0, 100, 100);
		console.log(imageData);
		var code = jsQR(imageData.data, imageData.width, imageData.height, {
			inversionAttempts: "dontInvert",
		});
		console.log(code);
	}
</script>

<main>
	{JSON.stringify(squares)}
	<Home />
	<button on:click={test}> test </button>
	<button on:click={stopCapture}> stop </button>
	<button on:click={genQR}> sto2 </button>
	<button on:click={test2}> sto332 </button>
	<br /><br />
	<h4>Drag the mouse to create a rectangle</h4>
	<div id="canvasWrapper">
		<canvas bind:this={canvasElement} width="1200" height="900" />
		<canvas id="overlay" width="1200" height="900" />
		<canvas id="canvas" width="1200" height="900" />
	</div>
	<div id="test" />
	<!-- <canvas id="test" /> -->
</main>

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
	canvas {
		border: 1px solid red;
		position: absolute;
	}
	.canvasWrapper {
		position: relative;
	}
</style>
