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
</style>
