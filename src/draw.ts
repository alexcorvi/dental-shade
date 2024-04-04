import { debouncedCalculation } from "./calculate";
import { deltaE2000 } from "./comparison";
import { hexToRGBA } from "./conversion";
import { data } from "./data";
import { rectangle, resizeEdgeT, coords, drawType, ColorTuple } from "./types";

let resizeEdge: resizeEdgeT = "";

// function to check if mouse is over delete button
function isMouseOverDelete(mouseCoords: coords, rect: rectangle) {
	let buttonX = rect.x;
	let buttonY = rect.y + rect.height - 15;
	return (
		mouseCoords.x >= buttonX &&
		mouseCoords.x <= buttonX + rect.width &&
		mouseCoords.y >= buttonY &&
		mouseCoords.y <= buttonY + 15
	);
}

// Function to check if mouse is over rectangle edge
function isMouseOverRectEdge(mouseCoords: coords, rect: rectangle) {
	return (
		(mouseCoords.x >= rect.x - 5 &&
			mouseCoords.x <= rect.x + 5 &&
			mouseCoords.y >= rect.y &&
			mouseCoords.y <= rect.y + rect.height) ||
		(mouseCoords.x >= rect.x + rect.width - 5 &&
			mouseCoords.x <= rect.x + rect.width + 5 &&
			mouseCoords.y >= rect.y &&
			mouseCoords.y <= rect.y + rect.height) ||
		(mouseCoords.y >= rect.y - 5 &&
			mouseCoords.y <= rect.y + 5 &&
			mouseCoords.x >= rect.x &&
			mouseCoords.x <= rect.x + rect.width) ||
		(mouseCoords.y >= rect.y + rect.height - 5 &&
			mouseCoords.y <= rect.y + rect.height + 5 &&
			mouseCoords.x >= rect.x &&
			mouseCoords.x <= rect.x + rect.width)
	);
}

// Function to check if mouse is over control point
function isMouseOverControlPoint(mouseCoords: coords, rect: rectangle) {
	let controlSize = 6;
	return (
		(mouseCoords.x >= rect.x - controlSize / 2 &&
			mouseCoords.x <= rect.x + controlSize / 2 &&
			mouseCoords.y >= rect.y - controlSize / 2 &&
			mouseCoords.y <= rect.y + controlSize / 2) ||
		(mouseCoords.x >= rect.x + rect.width / 2 - controlSize / 2 &&
			mouseCoords.x <= rect.x + rect.width / 2 + controlSize / 2 &&
			mouseCoords.y >= rect.y - controlSize / 2 &&
			mouseCoords.y <= rect.y + controlSize / 2) ||
		(mouseCoords.x >= rect.x + rect.width - controlSize / 2 &&
			mouseCoords.x <= rect.x + rect.width + controlSize / 2 &&
			mouseCoords.y >= rect.y - controlSize / 2 &&
			mouseCoords.y <= rect.y + controlSize / 2) ||
		(mouseCoords.x >= rect.x + rect.width - controlSize / 2 &&
			mouseCoords.x <= rect.x + rect.width + controlSize / 2 &&
			mouseCoords.y >= rect.y + rect.height / 2 - controlSize / 2 &&
			mouseCoords.y <= rect.y + rect.height / 2 + controlSize / 2) ||
		(mouseCoords.x >= rect.x + rect.width - controlSize / 2 &&
			mouseCoords.x <= rect.x + rect.width + controlSize / 2 &&
			mouseCoords.y >= rect.y + rect.height - controlSize / 2 &&
			mouseCoords.y <= rect.y + rect.height + controlSize / 2) ||
		(mouseCoords.x >= rect.x + rect.width / 2 - controlSize / 2 &&
			mouseCoords.x <= rect.x + rect.width / 2 + controlSize / 2 &&
			mouseCoords.y >= rect.y + rect.height - controlSize / 2 &&
			mouseCoords.y <= rect.y + rect.height + controlSize / 2) ||
		(mouseCoords.x >= rect.x - controlSize / 2 &&
			mouseCoords.x <= rect.x + controlSize / 2 &&
			mouseCoords.y >= rect.y + rect.height - controlSize / 2 &&
			mouseCoords.y <= rect.y + rect.height + controlSize / 2) ||
		(mouseCoords.x >= rect.x - controlSize / 2 &&
			mouseCoords.x <= rect.x + controlSize / 2 &&
			mouseCoords.y >= rect.y + rect.height / 2 - controlSize / 2 &&
			mouseCoords.y <= rect.y + rect.height / 2 + controlSize / 2)
	);
}

// Function to get cursor style based on resize edge
function getCursorStyle(edge: resizeEdgeT) {
	switch (edge) {
		case "left":
		case "right":
			return "ew-resize"; // Horizontal resize
		case "top":
		case "bottom":
			return "ns-resize"; // Vertical resize
		default:
			return "auto";
	}
}

// Function to get resize edge based on mouse position
function getResizeEdge(mouseCoords: coords, rect: rectangle): resizeEdgeT {
	if (mouseCoords.x >= rect.x - 5 && mouseCoords.x <= rect.x + 5) return "left";
	if (
		mouseCoords.x >= rect.x + rect.width - 5 &&
		mouseCoords.x <= rect.x + rect.width + 5
	)
		return "right";
	if (mouseCoords.y >= rect.y - 5 && mouseCoords.y <= rect.y + 5) return "top";
	if (
		mouseCoords.y >= rect.y + rect.height - 5 &&
		mouseCoords.y <= rect.y + rect.height + 5
	)
		return "bottom";
	return "";
}

// Function to get mouse coordinates relative to canvas
function getMouseCoords(canvas: HTMLCanvasElement, e: Event) {
	let x, y;

	if (e instanceof MouseEvent) {
		x = e.clientX;
		y = e.clientY;
	} else if (e instanceof TouchEvent) {
		x = e.changedTouches[0].clientX;
		y = e.changedTouches[0].clientY;
	} else {
		return { x: 0, y: 0 }; // Default to (0, 0) if event type is unknown
	}

	const rect = canvas.getBoundingClientRect();
	const scaleX = canvas.width / rect.width;
	const scaleY = canvas.height / rect.height;

	return {
		x: Math.round((x - rect.left) * scaleX),
		y: Math.round((y - rect.top) * scaleY),
	};
}

// Function to resize rectangle based on mouse movement
function resizeRectangle(mouseCoords: coords, rect: rectangle, edge: string) {
	switch (edge) {
		case "left":
			rect.width += rect.x - mouseCoords.x;
			rect.x = mouseCoords.x;
			break;
		case "right":
			rect.width = mouseCoords.x - rect.x;
			break;
		case "top":
			rect.height += rect.y - mouseCoords.y;
			rect.y = mouseCoords.y;
			break;
		case "bottom":
			rect.height = mouseCoords.y - rect.y;
			break;
	}
}

// a function to register mouse event listener
export function mouseEventsListeners(
	ctx: CanvasRenderingContext2D,
	canvas: HTMLCanvasElement,
	img: HTMLImageElement
) {
	let isDrawing = false;
	let isMoving = false;
	let isResizing = false;
	let isDeleting = false;
	let startCoords = { x: 0, y: 0 };
	let selectedRectangle: rectangle | null = null;
	let offsetX: number, offsetY: number;
	let rectangles = data.rectangles;

	function isMultiTouch(e: Event): boolean {
		if (!(e instanceof TouchEvent)) return false;
		// Check if event is a touch event
		if (e.touches && e.touches.length > 1) {
			// Minimum duration for multitouch detection (adjustable)
			var minDuration = 100; // milliseconds

			// Minimum distance between touches for multitouch detection (adjustable)
			var minDistance = 10; // pixels

			// Timestamp of the initial touch
			var touchStartTimestamp = Date.now();

			// Coordinates of the initial touch
			var initialTouch = {
				x: e.touches[0].clientX,
				y: e.touches[0].clientY,
			};

			// Check if touches remain consistent over time
			var touchesConsistent = true;

			// Check if touches meet additional criteria (distance, duration, direction)
			for (var i = 1; i < e.touches.length; i++) {
				var touch = e.touches[i];
				var distance = Math.sqrt(
					Math.pow(touch.clientX - initialTouch.x, 2) +
						Math.pow(touch.clientY - initialTouch.y, 2)
				);
				if (distance < minDistance) {
					touchesConsistent = false;
					break;
				}
			}

			// Return true if multitouch criteria are met
			if (touchesConsistent && Date.now() - touchStartTimestamp < minDuration) {
				return true;
			}
		}

		// Return false if not multitouch or criteria not met
		return false;
	}

	function setToDefault() {
		isDrawing = isMoving = isResizing = isDeleting = false;
		selectedRectangle = null;
	}

	const down: EventListener = function (e: Event) {
		let mouseCoords = getMouseCoords(canvas, e);
		let drawT: "shades" | "teeth" = "shades";
		for (drawT in rectangles) {
			for (let i = rectangles[drawT].length - 1; i >= 0; i--) {
				let rect: rectangle = rectangles[drawT][i];
				if (isMouseOverDelete(mouseCoords, rect)) {
					isDeleting = true;
					isDrawing = false;
					rectangles[drawT].splice(i, 1);
					draw(ctx, canvas, img);
					break;
				} else if (isMouseOverRectEdge(mouseCoords, rect)) {
					isResizing = true;
					resizeEdge = getResizeEdge(mouseCoords, rect);
					selectedRectangle = rect;
					break;
				} else if (isMouseOverControlPoint(mouseCoords, rect)) {
					isResizing = true;
					isMoving = true;
					resizeEdge = "corner";
					selectedRectangle = rect;
					offsetX = mouseCoords.x - rect.x;
					offsetY = mouseCoords.y - rect.y;
					break;
				} else if (
					mouseCoords.x >= rect.x &&
					mouseCoords.x <= rect.x + rect.width &&
					mouseCoords.y >= rect.y &&
					mouseCoords.y <= rect.y + rect.height
				) {
					isMoving = true;
					offsetX = mouseCoords.x - rect.x;
					offsetY = mouseCoords.y - rect.y;
					selectedRectangle = rect;
					break;
				}
			}
			if (isResizing || isMoving || isDeleting) break;
		}
		if (
			!isResizing &&
			!isMoving &&
			!isDeleting &&
			data.currentDraw !== ""
		) {
			isDrawing = true;
			startCoords = mouseCoords;
		}
	};

	const end: EventListener = function (e: Event) {
		if (isMultiTouch(e)) return setToDefault();
		if (isDrawing) {
			isDrawing = false;
			let endCoords = getMouseCoords(canvas, e);
			let rect = {
				x: Math.min(startCoords.x, endCoords.x),
				y: Math.min(startCoords.y, endCoords.y),
				width: Math.abs(startCoords.x - endCoords.x),
				height: Math.abs(startCoords.y - endCoords.y),
			};
			if (rect.width === 0 || rect.height === 0) {
				rect = rectOnTap(startCoords.x, startCoords.y);
			}
			if ((rect.width || rect.height) && data.currentDraw !== "")
				data.rectangles[data.currentDraw].push(rect);
			draw(ctx, canvas, img);
		}
		isMoving = false;
		isResizing = false;
		isDeleting = false;
		selectedRectangle = null;
		resizeEdge = "";
	};

	const move: EventListener = function (e: Event) {
		if (isMultiTouch(e)) return setToDefault();
		let mouseCoords = getMouseCoords(canvas, e);
		if (isResizing && selectedRectangle) {
			e.preventDefault();
			if (resizeEdge === "corner") {
				selectedRectangle.width = mouseCoords.x - selectedRectangle.x;
				selectedRectangle.height = mouseCoords.y - selectedRectangle.y;
			} else {
				resizeRectangle(mouseCoords, selectedRectangle, resizeEdge);
			}
			draw(ctx, canvas, img);
		} else if (isMoving && selectedRectangle) {
			e.preventDefault();
			selectedRectangle.x = mouseCoords.x - offsetX;
			selectedRectangle.y = mouseCoords.y - offsetY;
			draw(ctx, canvas, img);
		} else if (isDrawing) {
			e.preventDefault();
			draw(ctx, canvas, img);

			let endCoords = mouseCoords;
			ctx.strokeStyle = data.currentDraw === "shades" ? "red" : "blue";
			ctx.strokeRect(
				startCoords.x,
				startCoords.y,
				endCoords.x - startCoords.x,
				endCoords.y - startCoords.y
			);
		} else {
			// Change cursor style if mouse is over a rectangle or edge
			let cursorStyle = "crosshair";
			let drawT: "shades" | "teeth" = "shades";
			for (drawT in rectangles) {
				for (let i = rectangles[drawT].length - 1; i >= 0; i--) {
					let rect = rectangles[drawT][i];
					if (isMouseOverDelete(mouseCoords, rect)) {
						cursorStyle = "pointer";
						break;
					} else if (isMouseOverRectEdge(mouseCoords, rect)) {
						cursorStyle = getCursorStyle(getResizeEdge(mouseCoords, rect));
						break;
					} else if (isMouseOverControlPoint(mouseCoords, rect)) {
						cursorStyle = "nwse-resize";
						break;
					} else if (
						mouseCoords.x >= rect.x &&
						mouseCoords.x <= rect.x + rect.width &&
						mouseCoords.y >= rect.y &&
						mouseCoords.y <= rect.y + rect.height
					) {
						cursorStyle = "move";
						break;
					}
				}
				if (cursorStyle !== "crosshair") break; // Break outer loop if cursor style changed
			}
			canvas.style.cursor = cursorStyle;
		}
	};

	/**
	 * This function would generate a rectangle just by taping (clicking)
	 * basically it selects pixels using the flood fill algorithm
	 * then it returns a rectangle props that would encircle all the selected pixels
	 */
	function rectOnTap(x: number, y: number): rectangle {
		const tolerance = 2.8;
		const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
		const data = imageData.data;
		const visited = new Set();
		const pixelData = ctx.getImageData(x, y, 1, 1).data;
		let minX = x;
		let minY = y;
		let maxX = x;
		let maxY = y;
		const basicColor: ColorTuple = [pixelData[0], pixelData[1], pixelData[2]];
		let counter = 0;

		const queue = [[x, y]];
		while (queue.length > 0) {
			counter++;
			if (counter > 80 * 1000) {
				// protect against uncontrolled filling (slow)
				minX = 0;
				maxX = 0;
				minY = 0;
				maxY = 0;
				break;
			}
			const [currentX, currentY] = queue.shift()!;
			if (
				currentX >= 0 &&
				currentX < canvas.width &&
				currentY >= 0 &&
				currentY < canvas.height &&
				!visited.has(`${currentX}-${currentY}`)
			) {
				visited.add(`${currentX}-${currentY}`);

				const neighbors = [
					[currentX - 1, currentY],
					[currentX + 1, currentY],
					[currentX, currentY - 1],
					[currentX, currentY + 1],
				];

				for (const neighbor of neighbors) {
					const [neighborX, neighborY] = neighbor;
					if (
						neighborX >= 0 &&
						neighborX < canvas.width &&
						neighborY >= 0 &&
						neighborY < canvas.height
					) {
						const neighborPixelIndex =
							(neighborY * canvas.width + neighborX) * 4;
						const neighborColor: ColorTuple = [
							data[neighborPixelIndex],
							data[neighborPixelIndex + 1],
							data[neighborPixelIndex + 2],
						];

						const difference = deltaE2000(basicColor, neighborColor);
						if (difference <= tolerance) {
							queue.push(neighbor);
							if (maxX < neighbor[0]) maxX = neighbor[0];
							if (minX > neighbor[0]) minX = neighbor[0];
							if (maxY < neighbor[1]) maxY = neighbor[1];
							if (minY > neighbor[1]) minY = neighbor[1];
						}
					}
				}
			}
		}

		if (counter < 500) {
			// protect against small fillings
			minX = 0;
			maxX = 0;
			minY = 0;
			maxY = 0;
		}

		let RWidth = maxX - minX;
		let RHeight = maxY - minY;

		const rect: rectangle = {
			x: minX,
			y: minY,
			width: RWidth,
			height: RHeight,
		};
		return rect;
	}

	let ts = 0;
	function handleOnce<T extends EventListener>(handler: T): EventListener {
		return function (event: Event) {
			if (event.timeStamp - ts > 100) {
				ts = event.timeStamp;
				handler(event);
			}
		};
	}

	canvas.addEventListener("mousedown", handleOnce(down));
	canvas.addEventListener("touchstart", handleOnce(down));

	canvas.addEventListener("mouseup", end);
	canvas.addEventListener("touchend", end);

	canvas.addEventListener("mousemove", move);
	canvas.addEventListener("touchmove", move);
}

// a function to draw a mark on the winning shade
export function drawWinner(ctx: CanvasRenderingContext2D, rect: rectangle) {
	let buttonSize = 15;
	let buttonX = rect.x + 1;
	let buttonY = rect.y + 1;
	ctx.fillStyle = "green";
	ctx.fillRect(buttonX, buttonY, buttonSize, buttonSize);
	ctx.fillStyle = "white";
	ctx.font = "bold 12px Arial";
	ctx.fillText("✓", buttonX + 4, buttonY + 12);
}

// the main drawing function, draws every rectangle with its control points and delete button
// then it calculates rectangle to decide a winner
export function draw(
	ctx: CanvasRenderingContext2D,
	canvas: HTMLCanvasElement,
	img: HTMLImageElement
) {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.drawImage(img, 0, 0);

	// Draw red rectangles
	ctx.strokeStyle = "red";
	data.rectangles.shades.forEach((rect) => {
		ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);
		drawControlPoints(ctx, rect);
		drawDeleteButton(ctx, rect);
	});

	// Draw blue rectangles
	ctx.strokeStyle = "blue";
	data.rectangles.teeth.forEach((rect) => {
		ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);
		drawControlPoints(ctx, rect);
		drawDeleteButton(ctx, rect);
	});

	// calculate
	debouncedCalculation(ctx);
}

// function to draw delete button for deleting a rectangle
function drawDeleteButton(ctx: CanvasRenderingContext2D, rect: rectangle) {
	let buttonHeight = 15;
	let buttonX = rect.x;
	let buttonY = rect.y + rect.height - buttonHeight;
	let c = hexToRGBA(ctx.strokeStyle as string);
	ctx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},0.6)`;
	ctx.fillRect(buttonX, buttonY, rect.width, buttonHeight);
	ctx.fillStyle = "white";
	ctx.font = "bold 12px monospace";
	ctx.fillText("X", buttonX + rect.width / 2 - 4, buttonY + 12);
}

// Function to draw control points for resizing
function drawControlPoints(ctx: CanvasRenderingContext2D, rect: rectangle) {
	let controlSize = 6;
	ctx.fillStyle = "black";
	ctx.fillRect(
		rect.x - controlSize / 2,
		rect.y - controlSize / 2,
		controlSize,
		controlSize
	);
	ctx.fillRect(
		rect.x + rect.width / 2 - controlSize / 2,
		rect.y - controlSize / 2,
		controlSize,
		controlSize
	);
	ctx.fillRect(
		rect.x + rect.width - controlSize / 2,
		rect.y - controlSize / 2,
		controlSize,
		controlSize
	);
	ctx.fillRect(
		rect.x + rect.width - controlSize / 2,
		rect.y + rect.height / 2 - controlSize / 2,
		controlSize,
		controlSize
	);
	ctx.fillRect(
		rect.x + rect.width - controlSize / 2,
		rect.y + rect.height - controlSize / 2,
		controlSize,
		controlSize
	);
	ctx.fillRect(
		rect.x + rect.width / 2 - controlSize / 2,
		rect.y + rect.height - controlSize / 2,
		controlSize,
		controlSize
	);
	ctx.fillRect(
		rect.x - controlSize / 2,
		rect.y + rect.height - controlSize / 2,
		controlSize,
		controlSize
	);
	ctx.fillRect(
		rect.x - controlSize / 2,
		rect.y + rect.height / 2 - controlSize / 2,
		controlSize,
		controlSize
	);
}
