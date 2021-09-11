<script lang="ts">
	import jsQR, { QRCode } from "jsqr";
	import { getContext, onDestroy, onMount } from "svelte";
	import { Packet, PacketType } from "../../controllers/packet";
	import { QR } from "../../controllers/qr";
	import type { Point } from "../../models/TA/player";
	import { curentMatch, taWS } from "../../stores/store";
	import Button from "../common/button.svelte";
	import { v4 as uuidv4 } from "uuid";
	import { Intentions } from "../../models/TA/file";
	import type { File } from "../../models/TA/file";
	import type { ForwardingPacket } from "../../models/TA/forwardingPacket";
	import { Command, CommandTypes } from "../../models/TA/command";

	const { close } = getContext("simple-modal");

	export let playPacket: Packet;

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

	async function loadScreen() {
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

	onDestroy(() => {
		stopCapture(false);
	});

	let iterated = true;
	let checkingGreen = false;
	let sentGreen = false;

	function tick() {
		if (video.readyState === video.HAVE_ENOUGH_DATA) {
			canvas.drawImage(video, 0, 0, canvasElement.width, canvasElement.height);
			let successfullCodes: { code: QRCode; center: Point }[] = [];
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
					successfullCodes.push({
						code,
						center,
					});
					// drawLine(center, addPoints(center, { x: 1, y: 1 }), "red");
					// console.log(code.data, center);
				} else {
				}
			}
			if (successfullCodes.length === maxSquares || sentGreen) {
				// Found all player codes
				if (!sentGreen) {
					for (const code of successfullCodes) {
						let player = players.find((x) => x.UserId === code.code.data);
						if (player) {
							player.StreamScreenCoordinates = code.center;
							$taWS.client.playerUpdated(player);
						}
					}

					let filePacket: File = {
						FileId: uuidv4(),
						Compressed: false,
						Intent: Intentions.ShowPngImmediately,
						Data: QR.greenImg(),
					};
					let fPacket: ForwardingPacket = {
						ForwardTo: players.map((x) => x.Id),
						Type: PacketType.File,
						SpecificPacket: filePacket,
					};
					$taWS.ws.send(new Packet(fPacket, PacketType.ForwardingPacket));
					for (let player of players) {
						player.StreamSyncStartMs = new Date().getTime();
						$taWS.client.playerUpdated(player);
					}
					let cPacket: Command = {
						CommandType: CommandTypes.ScreenOverlay_ShowPng,
					};
					let fPacket2: ForwardingPacket = {
						ForwardTo: players.map((x) => x.Id),
						Type: PacketType.Command,
						SpecificPacket: cPacket,
					};
					$taWS.ws.send(new Packet(fPacket2, PacketType.ForwardingPacket));
				}
				checkingGreen = true;
				sentGreen = true;
			} else {
				checkingGreen = false;
			}
			if (checkingGreen) {
				let foundUsers = [];
				for (const player of players) {
					let imgData = canvas.getImageData(player.StreamScreenCoordinates.x, player.StreamScreenCoordinates.y, 1, 1).data;
					console.log(player.StreamScreenCoordinates);
					console.log(imgData);
					if (imgData[0] < 50 && imgData[1] > 200 && imgData[2] < 50) {
						if (player.StreamDelayMs === 0) {
							player.StreamDelayMs = new Date().getTime() - player.StreamSyncStartMs;
							$taWS.client.playerUpdated(player);
						}
						foundUsers.push(player.Id);
					}
				}
				if (foundUsers.length === players.length) {
					let maxDelay = Math.max(...players.map((x) => x.StreamDelayMs));
					for (const player of players) {
						setTimeout(() => {
							let cPacket: Command = {
								CommandType: CommandTypes.DelayTest_Finish,
							};
							let fPacket2: ForwardingPacket = {
								ForwardTo: [player.Id],
								Type: PacketType.Command,
								SpecificPacket: cPacket,
							};
							$taWS.ws.send(new Packet(fPacket2, PacketType.ForwardingPacket));
						}, maxDelay - player.StreamDelayMs);
					}
					close();
				}
			}
		}
		if (!iterated) requestAnimationFrame(tick);
	}

	function sendStartDelay() {}

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

	// const maxSquares = 2;
	$: maxSquares = $curentMatch.Players.length;

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

		function handleMouseDown(e: MouseEvent) {
			e.preventDefault();
			e.stopPropagation();
			startX = e.clientX - canvas.getBoundingClientRect().x - window.scrollX;
			startY = e.clientY - canvas.getBoundingClientRect().y - window.scrollY;
			isDown = true;
		}

		function handleMouseUp(e: MouseEvent) {
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

		function handleMouseOut(e: MouseEvent) {
			e.preventDefault();
			e.stopPropagation();
			isDown = false;
		}

		function handleMouseMove(e: MouseEvent) {
			e.preventDefault();
			e.stopPropagation();
			if (!isDown) {
				return;
			}
			let mouseX = e.clientX - canvas.getBoundingClientRect().x - window.scrollX;
			let mouseY = e.clientY - canvas.getBoundingClientRect().y - window.scrollY;
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

	function beginSync() {
		$taWS.ws.send(playPacket);
	}

	$: players = $taWS.client.State.Players.filter((x) => $curentMatch?.Players.map((y) => y.Id).includes(x.Id));
	$: allInGame = players.every((x) => x.PlayState == 1);
	$: _allInGame(allInGame);

	async function _allInGame(...args) {
		console.log(allInGame);
		if (allInGame) {
			let qrCodes = [];
			for (const player of $curentMatch.Players) {
				player.StreamDelayMs = 0;
				player.StreamScreenCoordinates = {
					x: 0,
					y: 0,
				};
				player.StreamSyncStartMs = 0;

				// let qr = new QR(player.UserId);
				let qr = await QR.createQRCode(player.UserId);

				let filePacket: File = {
					FileId: uuidv4(),
					Compressed: false,
					Intent: Intentions.ShowPngImmediately,
					// Data: await qr.base64Data,
					Data: qr.replace("data:image/png;base64,", ""),
				};
				qrCodes.push({
					id: player.Id,
					packet: filePacket,
				});
			}
			for (const player of $curentMatch.Players) {
				let packet = qrCodes.find((x) => x.id === player.Id);
				if (packet) {
					let fPacket: ForwardingPacket = {
						ForwardTo: [player.Id],
						Type: PacketType.File,
						SpecificPacket: packet.packet,
					};
					$taWS.ws.send(new Packet(fPacket, PacketType.ForwardingPacket));
				}
			}
		}
	}
</script>

<h3>Stream Sync</h3>
{#if iterated}
	<Button on:click={() => loadScreen()} primary text="Load Stream Screen" />
{/if}

{#if !iterated}
	<h5>Select the players screens by dragging a rectangle around them</h5>
{/if}
{#if squares.length === maxSquares}
	<Button on:click={() => beginSync()} primary text="Begin Sync" />
{/if}
<div class="canvasWrapper">
	<canvas bind:this={canvasElement} width="960" height="540" />
	<canvas id="overlay" width="960" height="540" />
	<canvas id="canvas" width="960" height="540" />
</div>

<style lang="scss">
	.canvasWrapper {
		position: relative;
		width: 960px;
		height: 540px;
		margin: 20px;
	}
	canvas {
		// border: 1px solid red;
		position: absolute;
	}
</style>
