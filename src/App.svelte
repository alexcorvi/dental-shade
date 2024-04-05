<script lang="ts">
	import { data } from "./data";
	import { draw, mouseEventsListeners } from "./draw";
	import { drawType } from "./types";
	import { Zoom } from "./zoom";

	function start() {
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
			draw(ctx, canvas, img);
		};
	}

	function setActive(draw: drawType) {
		data.currentDraw = draw;
	}

	function toggleHint() {
		data.showHint = !data.showHint;
	}

	function fileInput() {
		const img = document.getElementById("image") as HTMLImageElement;
		let fileInput = document.getElementById("fileinput") as HTMLInputElement;
		if (!fileInput.files) return;
		if (!fileInput.files.length) return;
		const reader = new FileReader();
		reader.onload = function (e) {
			if (!e.target) return;
			if (typeof e.target.result !== "string") return;
			img.src = e.target.result;
			data.imageSelected = true;
			start();
		};
		reader.readAsDataURL(fileInput.files[0]);
	}
	function reset() {
		const img = document.getElementById("image") as HTMLImageElement;
		const canvas = document.getElementById("canvas") as HTMLCanvasElement;
		const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
		data.rectangles.shades = [];
		data.rectangles.teeth = [];
		draw(ctx, canvas, img);
		setActive("");
	}
</script>

<main>
	<section
		id="upload"
		style={`display:${data.imageSelected ? "none" : "block"}`}
	>
		<p>
			This application simplifies shade selection for prosthodontic restoration
			using standard phone photos. Innovative algorithms analyze images to match
			shades accurately. With intuitive controls, dentists identify the perfect
			shade for each restoration, ensuring natural results.
		</p>
		<button
			on:click={() => {
				document.getElementById("fileinput")?.click();
			}}
		>
			<img src="upload.png" alt="camera-icon" />
			<div>Choose a photo to start</div>
		</button>
		<input
			accept="image/*"
			on:change={(e) => fileInput()}
			id="fileinput"
			style="display: none"
			type="file"
		/>
	</section>
	<section
		id="process"
		style={`display:${data.imageSelected ? "block" : "none"}`}
	>
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
				<div class="btn-text">Select Shades</div>
			</button>

			<button
				class={(data.currentDraw === "teeth" ? "selected " : "") + "ctrl-btn"}
				on:click={() => setActive("teeth")}
			>
				<img class="ctrl-icon" alt="icon" src="./icon-tooth.svg" />
				<div class="btn-text">Select Teeth</div>
			</button>

			<button class={"ctrl-btn"} on:click={() => reset()}>
				<img class="ctrl-icon" alt="icon" src="./icon-reset.svg" />
				<div class="btn-text">Reset</div>
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
					the area to be selected (as teeth or shade), or you can simply tap on
					it and it will be automatically determined.
				</li>
				<li>
					Use one finger to draw and select areas, and two fingers to zoom
					(pinch) and pan (scroll).
				</li>
				<li>
					After selecting both shades and teeth the program will define the
					closest shade to the selected teeth
				</li>
			</ul>
		</div>
	</section>
</main>

<style lang="scss">
	main {
		overflow: hidden;
		width: 100%;
		height: 100vh;
	}

	section#upload {
		display: block;
		width: 100%;
		height: 100vh;
		background: #f1f1f1;
		p {
			font-family: monospace;
			padding: 18px;
			padding-top: 50px;
			font-size: 14px;
			text-align: justify;
		}
		button {
			border-radius: 4px;
			display: block;
			margin: 0 auto;
			background: transparent;
			border: none;
			width: 223px;
			height: 150px;
			border: 1px solid #9e9e9e;
			padding: 5px 25px;
			font-family: monospace;
			text-transform: uppercase;
			font-size: 11px;
			letter-spacing: 1px;
			margin-top: 30px;
			background: #fafafa;
			box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
			img {
				width: 100px;
			}
			div {
				margin-top: 5px;
			}
		}
	}

	section#process {
		.ctrl {
			text-align: center;
			margin-top: 10px;
			background: #efebe9;
			border-top: 1px solid #795548;
			position: fixed;
			width: 100%;
			bottom: -1px;
			padding: 0;
			z-index: 1;
			box-shadow: 0 0 50px #0000007d;
			.ctrl-btn {
				display: inline-flex;
				background: #ececec;
				width: 33%;
				text-align: center;
				border: none;
				text-transform: uppercase;
				font-size: 12px;
				font-family: monospace;
				letter-spacing: 1px;
				border-left: 1px solid #cfd8dc;
				border-radius: 0;
				padding: 10px 7px;
				margin-left: -3px;
				justify-content: space-evenly;
				align-items: center;
				&.selected {
					background: #fff;
				}
				.ctrl-icon {
					width: 50px;
					height: 50px;
					border-radius: 20px;
				}
				.btn-text {
					width: 90px;
				}
			}
		}

		#canvas-container {
			width: 100%;
			height: calc(100vh - 65px);
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
			#canvas {
				display: block;
				margin: 0 auto;
				border-radius: 5px;
				transition: transform 0.1s;
			}
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
	}
</style>
