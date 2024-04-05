<script lang="ts">
	import { onMount } from "svelte";
	import { data } from "./data";
	import { draw, mouseEventsListeners } from "./draw";
	import { drawType } from "./types";
	import { Zoom } from "./zoom";

	onMount(() => {
		const img = document.getElementById("image") as HTMLImageElement;
		const canvas = document.getElementById("canvas") as HTMLCanvasElement;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;
		mouseEventsListeners(ctx, canvas, img);
		img.onload = function () {
			img.style.display = "none";
			new Zoom(canvas, {
				rotate: false,
				pan: false,
				minZoom: 1,
			});
			start();
		};
	});

	function start() {
		const img = document.getElementById("image") as HTMLImageElement;
		const canvas = document.getElementById("canvas") as HTMLCanvasElement;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;
		draw(ctx, canvas, img);
	}

	function setActive(draw: drawType) {
		data.currentDraw = draw;
	}

	function toggleHint() {
		data.showHint = !data.showHint;
	}
</script>

<main>
	<div id="canvas-container">
		<img id="image" src="test11.jpg" alt="img" />
		<canvas id="canvas"></canvas>
	</div>

	<div class="ctrl">
		<button
			class={(data.currentDraw === "shades" ? "selected " : "") + "ctrl-btn"}
			on:click={() => setActive("shades")}
		>
			<img class="ctrl-icon" alt="icon" src="./icon-shade.svg" />
			<div>Select Shades</div>
		</button>

		<button
			class={(data.currentDraw === "teeth" ? "selected " : "") + "ctrl-btn"}
			on:click={() => setActive("teeth")}
		>
			<img class="ctrl-icon" alt="icon" src="./icon-tooth.svg" />
			<div>Select Teeth</div>
		</button>

		<button
			class={"ctrl-btn"}
			on:click={() => {
				data.rectangles.shades = [];
				data.rectangles.teeth = [];
				start();
				setActive("");
			}}
		>
			<img class="ctrl-icon" alt="icon" src="./icon-reset.svg" />
			<div>Reset</div>
		</button>
	</div>
	<div role="button" on:touchstart={() => toggleHint()} class="hint-button">
		<span>🛈</span> How to use
	</div>
	<div
		on:touchstart={() => toggleHint()}
		class="hint-text"
		style={`display:${data.showHint ? "block" : "none"}`}
	>
		<ul>
			<li>
				Use the buttons below to start selecting teeth or shades, you can draw
				the area to be selected (as teeth or shade), or you can simply tap on it
				and it will be automatically determined.
			</li>
			<li>
				Use one finger to draw and select areas, and two fingers to zoom (pinch)
				and pan (scroll).
			</li>
			<li>
				After selecting both shades and teeth the program will define the
				closest shade to the selected teeth
			</li>
		</ul>
	</div>
</main>

<style lang="scss">
	main {
		overflow: hidden;
		width: 100%;
		height: 100vh;
	}
	.ctrl {
		text-align: center;
		margin-top: 10px;
		background: #efebe9;
		border-top: 1px solid #795548;
		position: fixed;
		width: 100%;
		bottom: -1px;
		padding: 15px 0;
		z-index: 1;
		.ctrl-btn {
			display: inline-block;
			background: #fcf8ec;
			width: 31%;
			padding: 5px;
			text-align: center;
			border: 1px solid #002530;
			border-radius: 15px;
			text-transform: uppercase;
			font-size: 12px;
			font-family: monospace;
			letter-spacing: 1px;
			&.selected {
				background: #ffee58;
				border-color: #f57f17;
				border-width: 2px;
			}
			&:hover {
				box-shadow: 1px 1px 1px #000;
			}
			.ctrl-icon {
				width: 50px;
				height: 50px;
				border-radius: 20px;
			}
		}
	}

	#canvas-container {
		width: 100%;
		height: calc(100vh - 110px);
		overflow: hidden;
		margin: 0 auto;
		border-radius: 7px;
		background-color: #f0f0f0; // fallback
		background-image: linear-gradient(
			45deg,
			transparent 25%,
			#ccc 25%,
			#ccc 50%,
			transparent 50%,
			transparent 75%,
			#ccc 75%,
			#ccc
		);
		background-size: 20px 20px;
		display: flex;
		justify-content: center;
		align-items: center;
	}
	#canvas {
		display: block;
		margin: 0 auto;
		border-radius: 5px;
		transition: transform 0.1s;
	}
	.hint-button {
		span {
			font-size: 25px;
			position: relative;
			top: 4px;
			left: -1px;
		}
		position: fixed;
		top: 5px;
		left: 5px;
		padding: 0px 13px 13px 10px;
		background: rgba(255, 255, 255, 0.7);
		font-family: monospace;
		border-radius: 5px;
		border: 1px solid #e0e0e0;
	}
	.hint-text {
		position: fixed;
		top: 64px;
		width: 90%;
		left: 5%;
		background: rgba(33, 33, 33, 0.71);
		padding: 10px 10px 13px 30px;
		border-radius: 4px;
		font-family: monospace;
		color: rgb(255, 255, 255);
		transition: top 0.5s ease 0s;
	}
</style>
