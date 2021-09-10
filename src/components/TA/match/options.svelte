<script lang="ts">
	import { createEventDispatcher, getContext } from "svelte";
	import { clamp, titleCase } from "../../../controllers/common";
	import { Packet } from "../../../controllers/packet";
	import type { Characteristic } from "../../../models/TA/characteristic";
	import { EventType, TAEvent } from "../../../models/TA/event";
	import { PacketType } from "../../../models/TA/forwardingPacket";
	import type { ForwardingPacket } from "../../../models/TA/forwardingPacket";
	import { GameOptions, GameplayModifiers } from "../../../models/TA/gameplayModifiers";
	import type { LoadSong } from "../../../models/TA/loadSong";
	import { BeatmapDifficulty } from "../../../models/TA/match";
	import { DownloadStates, PlayStates } from "../../../models/TA/player";
	import type { PreviewBeatmapLevel } from "../../../models/TA/previewBeatmapLevel";
	import { curentMatch, modal, taWS } from "../../../stores/store";
	import Button from "../../common/button.svelte";
	import Checkbox from "../../common/checkbox.svelte";
	import Input from "../../common/input.svelte";
	import Select from "../../common/select.svelte";
	import type { Beatsaver } from "../../../models/bsAPI";
	import type { Beatmap } from "../../../models/TA/beatmap";
	import type { GameplayParameters } from "../../../models/TA/gameplayParameters";
	import { PlayerOptions } from "../../../models/TA/playerSpecificSettnigs";
	import type { PlaySong } from "../../../models/TA/playSong";
	import { Command, CommandTypes } from "../../../models/TA/command";
	import StreamSync from "../../modals/streamSync.svelte";

	const { open } = getContext("simple-modal");

	const dispatch = createEventDispatcher();

	$: players = $taWS.client.State.Players.filter((x) => $curentMatch?.Players.map((y) => y.Id).includes(x.Id));

	$: allFinLoad = !players.every((x) => x.DownloadState != DownloadStates.None);
	$: allWait = players.every((x) => x.PlayState == PlayStates.Waiting);
	$: allInGame = players.every((x) => x.PlayState == 1);
	$: playersDownloading = players.some((x) => x.DownloadState == DownloadStates.Downloading);
	$: playersDownloaded = players.every((x) => x.DownloadState == DownloadStates.Downloaded);

	$: validDiff = $curentMatch?.SelectedCharacteristic?.Difficulties?.includes($curentMatch.SelectedDifficulty);
	$: canPlay = playersDownloaded && allWait && $curentMatch?.SelectedCharacteristic?.Difficulties?.includes($curentMatch.SelectedDifficulty);

	let bsURL = "";
	let bsSong: Beatsaver.map;
	let bsVersion: Beatsaver.Version;
	$: bsDiff = bsVersion?.diffs.find((x) => x.difficulty == BeatmapDifficulty[$curentMatch?.SelectedDifficulty].replace("Plus", "+"));

	async function loadSong() {
		if (!$curentMatch) return;
		if (bsURL == "" || !bsURL) return null;
		let songId = bsURL;
		if (bsURL.includes("beatsaver")) {
			songId = bsURL.split("map/")[1];
			if (songId.includes("&")) songId = songId.split("&")[0];
		}
		let req = await fetch(`https://beatsaver.com/api/maps/id/${songId}`, {
			method: "GET",
		});
		let songData: Beatsaver.map = await req.json();
		let curVersion = songData.versions.reduce((a, b) => (new Date(a.createdAt) > new Date(b.createdAt) ? a : b));
		bsSong = songData;
		bsVersion = curVersion;
		let hash: string = curVersion.hash;
		let characteristics: Characteristic[] = [];
		$curentMatch.SelectedDifficulty = 0;
		for (const characteristic of curVersion.diffs) {
			let diffs: BeatmapDifficulty[] = [];
			let curCharacteristic = characteristics.find((x) => x.SerializedName === characteristic.characteristic);
			if (curCharacteristic) {
				let diff: BeatmapDifficulty = (<any>BeatmapDifficulty)[titleCase(characteristic.difficulty)];
				curCharacteristic.Difficulties.push(diff);
			} else {
				let diff: BeatmapDifficulty = (<any>BeatmapDifficulty)[titleCase(characteristic.difficulty)];
				characteristics.push({
					SerializedName: characteristic.characteristic,
					Difficulties: [diff],
				});
			}
		}
		let matchMap: PreviewBeatmapLevel = {
			LevelId: `custom_level_${hash.toUpperCase()}`,
			Name: songData.metadata.songName,
			Characteristics: characteristics,
			Loaded: true,
		};

		$curentMatch.SelectedLevel = matchMap;
		$curentMatch.SelectedCharacteristic = matchMap.Characteristics[0];
		$curentMatch.SelectedDifficulty = BeatmapDifficulty.Easy;

		let SpecificPacket: TAEvent = {
			Type: EventType.MatchUpdated,
			ChangedObject: $curentMatch,
		};

		let loadedSong: LoadSong = {
			LevelId: $curentMatch.SelectedLevel.LevelId,
			CustomHostUrl: null,
		};
		let playerIds = $curentMatch.Players.map((x) => x.Id);
		let specificPacket2: ForwardingPacket = {
			ForwardTo: playerIds,
			Type: PacketType.LoadSong,
			SpecificPacket: loadedSong,
		};

		setTimeout(function () {
			$taWS.ws.send(new Packet(specificPacket2, PacketType.ForwardingPacket));
		}, 1000);

		$taWS.ws.send(new Packet(SpecificPacket, PacketType.Event));
		bannedCheck = false;
	}

	function updateMatch() {
		let SpecificPacket: TAEvent = {
			Type: EventType.MatchUpdated,
			ChangedObject: $curentMatch,
		};
		$taWS.ws.send(new Packet(SpecificPacket, PacketType.Event));
	}

	let palyingWithSync = false;

	function playSong(withSync = false) {
		palyingWithSync = withSync;

		let gm: GameplayModifiers = { Options: GameOptions.None };
		for (const modifier of mapOptions) {
			if (modifier.isSelected) {
				gm.Options = gm.Options | modifier.value;
			}
		}
		let beatMap: Beatmap = {
			Characteristic: $curentMatch.SelectedCharacteristic,
			Difficulty: $curentMatch.SelectedDifficulty,
			LevelId: $curentMatch.SelectedLevel.LevelId,
			Name: $curentMatch.SelectedLevel.Name,
		};
		let gameplayParam: GameplayParameters = {
			PlayerSettings: {
				Options: PlayerOptions.None,
			},
			GameplayModifiers: gm,
			Beatmap: beatMap,
		};

		let playSong: PlaySong = {
			GameplayParameters: gameplayParam,
			FloatingScoreboard: taSongOptions[0].isSelected,
			StreamSync: withSync,
			DisablePause: taSongOptions[1].isSelected,
			DisableFail: taSongOptions[2].isSelected,
		};
		let playerIds = $curentMatch.Players.map((x) => x.Id);
		let specificPacket: ForwardingPacket = {
			ForwardTo: playerIds,
			Type: PacketType.PlaySong,
			SpecificPacket: playSong,
		};
		if (withSync) {
			// $modal
			open(StreamSync, { playPacket: new Packet(specificPacket, PacketType.ForwardingPacket) });
			return;
		}
		$taWS.ws.send(new Packet(specificPacket, PacketType.ForwardingPacket));
	}

	function showCode() {
		for (const player of $curentMatch.Players) {
		}
		let cPacket: Command = {
			CommandType: CommandTypes.ScreenOverlay_ShowPng,
		};
		let fPacket: ForwardingPacket = {
			ForwardTo: $curentMatch.Players.map((x) => x.Id),
			Type: PacketType.File,
			SpecificPacket: cPacket,
		};
		$taWS.ws.send(new Packet(fPacket, PacketType.ForwardingPacket));
	}

	function returnToMenu() {
		let playerIds = $curentMatch.Players.map((x) => x.Id);
		let specificPacket: ForwardingPacket = {
			ForwardTo: playerIds,
			Type: PacketType.Command,
			SpecificPacket: {
				commandType: CommandTypes.ReturnToMenu,
			},
		};
		$taWS.ws.send(new Packet(specificPacket, PacketType.ForwardingPacket));
	}

	let bannedCheck = false;

	let mapOptions = [];
	for (const modifier in GameOptions) {
		if (isNaN(Number(modifier))) {
			if (modifier == "None") continue;
			mapOptions.push({
				name: modifier.replace(/([A-Z])/g, " $1").trim(),
				value: GameOptions[modifier],
				isSelected: false,
			});
		}
	}

	let taSongOptions = [
		{
			label: "Show Scoreboard",
			isSelected: false,
		},
		{
			label: "Disable Pause",
			isSelected: true,
		},
		{
			label: "Disable Fail",
			isSelected: true,
		},
	];

	function calcTime(startTime: Date, now: Date, length: number) {
		// let now = new Date();
		let d = now.getTime() - startTime.getTime();
		if (d >= length * 1000) d = length * 1000;
		return formatTime(d);
	}

	let now = new Date();
	setInterval(() => (now = new Date()), 1000);

	export function formatTime(t: number) {
		t = Math.floor(t / 1000);
		let hours = Math.floor(t / 60 / 60);
		let minutes = Math.floor(t / 60) - hours * 60;
		let seconds = t % 60;
		let formatted = minutes.toString().padStart(2, "0") + ":" + seconds.toString().padStart(2, "0");
		return formatted;
	}

	$: songProgress = clamp(230 - ((now.getTime() - new Date($curentMatch?.StartTime).getTime()) / (bsSong?.metadata.duration * 1000)) * 230, 0, 230);
	// function calcSongProgress() {

	// }
</script>

{#if $curentMatch}
	<h2>Match Options</h2>
	<br />
	{#if allWait}
		<div style="display: flex; align-items: center;">
			<Input bind:value={bsURL} placeholder="Song URL/ID" inline />
			&nbsp;
			<Button on:click={loadSong} primary inline disabled={playersDownloading || bsURL == "" || !bsURL || allInGame} text={playersDownloading ? "Players Downloading" : "Load Song"} />
		</div>
		<br />
	{/if}
	{#if $curentMatch.SelectedLevel}
		<h3>{allInGame ? "Currently Playing" : "Loaded Map"}</h3>
		<div style="display: flex; align-items: center;">
			<div style="min-height: 80px; min-width: 80px; margin: 15px; position: relative;">
				<svg style="position: absolute; margin: 0px;" height="76" width="76">
					<rect class="songProgress" style={`stroke-dashoffset: ${songProgress};`} x="6" y="6" width="64" height="64" stroke="#ea33ff" stroke-width="12px" rx="15px" ry="15px" stroke-linejoin="round" />
				</svg>
				<img style="position: absolute; top: 6px; left: 6px; margin: 0px;" class="playerImg" src={"https://as.cdn.beatsaver.com/" + $curentMatch.SelectedLevel.LevelId.replace("custom_level_", "").toLowerCase() + ".jpg"} alt="Song cover" />
			</div>
			<div>
				<p>
					<b>
						{$curentMatch.SelectedLevel.Name}
					</b>
				</p>
			</div>
		</div>
		{#if bsDiff}
			<div style="margin: 7px;">
				<p>
					Length: <strong>{$curentMatch.StartTime ? calcTime(new Date($curentMatch.StartTime), now, bsSong.metadata.duration) + "/" : ""}{formatTime(bsSong.metadata.duration * 1000)}</strong>
				</p>
				<div>
					<i class="fas fa-music svelte-103w9s3" /> Notes: <strong>{bsDiff.notes}</strong>
				</div>
				<div>
					<i class="fas fa-drum svelte-103w9s3" /> BPM: <strong><span class="" title="">{bsSong.metadata.bpm}</span></strong>
				</div>
				<div>
					<i class="fas fa-tachometer-alt svelte-103w9s3" /> NJS: <strong><span class="" title="">{bsDiff.njs}</span></strong>
				</div>
				<div>
					<i class="fas fa-fire svelte-103w9s3" /> NPS: <strong><span class="" title="">{bsDiff.nps}</span></strong>
				</div>
				<div>
					<i class="fas fa-bomb svelte-103w9s3" /> Bombs: <strong><span class="" title="">{bsDiff.bombs}</span></strong>
				</div>
				<div>
					<i class="fas fa-skull svelte-103w9s3" /> Obstacles: <strong><span class="" title="">{bsDiff.obstacles}</span></strong>
				</div>
			</div>
		{/if}
	{/if}
	{#if $curentMatch.SelectedLevel && allWait}
		<Select bind:value={$curentMatch.SelectedCharacteristic} on:change={updateMatch}>
			{#each $curentMatch.SelectedLevel?.Characteristics as char}
				<option value={char}>{char.SerializedName}</option>
			{/each}
		</Select>
		{#if $curentMatch.SelectedCharacteristic}
			<Select bind:value={$curentMatch.SelectedDifficulty} on:change={updateMatch}>
				<option selected={!validDiff} disabled> Select a Difficulty </option>
				{#each $curentMatch.SelectedCharacteristic?.Difficulties.sort() as diff}
					<option selected={diff == $curentMatch.SelectedDifficulty} value={diff}>
						{BeatmapDifficulty[diff]}
					</option>
				{/each}
			</Select>
		{/if}
		<br />
		<div style="width: 100%; overflow: hidden;">
			<ul style="list-style:none; float:left; margin-right: 20px;">
				{#each mapOptions as option}
					<li>
						<Checkbox bind:checked={option.isSelected} label={option.name} />
					</li>
				{/each}
			</ul>
			<ul style="list-style:none; float:left">
				{#each taSongOptions as option}
					<li>
						<Checkbox bind:checked={option.isSelected} label={option.label} />
					</li>
				{/each}
			</ul>
		</div>
		<br />
		<Button on:click={() => playSong()} disabled={!canPlay} primary text="Play Song" />
		<Button on:click={() => playSong(true)} disabled={!canPlay} primary text="Play With Sync" />
	{/if}
	{#if allInGame}
		<Button on:click={returnToMenu} primary text="Return To Menu" />
		<Button on:click={() => showCode()} primary text="Show Code" />
	{/if}
{/if}

<style lang="scss">
	.songProgress {
		stroke-dasharray: 230;
		stroke-linecap: round;
	}
</style>
