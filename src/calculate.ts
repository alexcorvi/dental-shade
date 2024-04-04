import { deltaE2000, deltaE2000Groups } from "./comparison";
import { data } from "./data";
import { drawWinner } from "./draw";
import { sortColorsByLightness } from "./sorting";
import { rectangle, ColorTuple } from "./types";

/**
 * This function gets all the colors (pixel by pixel)
 * in a defined rectangular area
 */
function rectangle2AllColors(rect: rectangle, ctx: CanvasRenderingContext2D) {
	const allColors: ColorTuple[] = [];
	const data = ctx.getImageData(rect.x, rect.y, rect.width, rect.height).data;
	for (let index = 0; index < data.length; index += 4) {
		allColors.push([data[index], data[index + 1], data[index + 2]]);
	}
	return allColors;
}

/**
 * Same as previous function but:
 * 1. sorts the colors by their lightness
 * 2. prunes colors that are out of the usual range
 */
function rectangle2SortedColors(
	rect: rectangle | rectangle[],
	n: number,
	ctx: CanvasRenderingContext2D
) {
	let allColors: ColorTuple[] = Array.isArray(rect)
		? rect.map((x) => rectangle2AllColors(x, ctx)).flat()
		: rectangle2AllColors(rect, ctx);

	// sort colors
	allColors = sortColorsByLightness(allColors);

	// prune colors that are way out of the range
	const medianColor = allColors[Math.floor(allColors.length / 2)];
	allColors = allColors.filter((color) => deltaE2000(color, medianColor) < 15);
	return allColors;
}

/**
 * A utility function that when given an array of numbers
 * returns the index of the minimum number
 */
function findMinIndex(arr: number[]) {
	return arr.reduce(
		(minIndex, currentValue, currentIndex, array) =>
			currentValue < array[minIndex] ? currentIndex : minIndex,
		0
	);
}

/**
 * This function is used to calculate the most resembling shade to the teeth
 * Actual comparison and calculation occurs here
 */
function findNearestShadeIndex(ctx: CanvasRenderingContext2D) {
	if (data.rectangles.shades.length && data.rectangles.teeth.length) {
		const teethColors = rectangle2SortedColors(data.rectangles.teeth, 10, ctx);
		const shadesColors = data.rectangles.shades.map((shade) =>
			rectangle2SortedColors(shade, 10, ctx)
		);
		const deltas = shadesColors.map((sp) => deltaE2000Groups(teethColors, sp));
		return findMinIndex(deltas);
	}
	return -1;
}

/**
 * Depends on the previous function to give
 * the index of the most resembling rectangle
 */
function calculate(ctx: CanvasRenderingContext2D) {
	const index = findNearestShadeIndex(ctx);
	if (index !== -1) drawWinner(ctx, data.rectangles.shades[index]);
}

/**
 * A utility function that gives a debounced version of any function given to it
 */
function debounce<T extends (...args: any[]) => any>(
	func: T,
	delay: number
): (...args: Parameters<T>) => void {
	let timerId: ReturnType<typeof setTimeout>;

	return function (this: any, ...args: Parameters<T>): void {
		clearTimeout(timerId);
		timerId = setTimeout(() => {
			func.apply(this, args);
		}, delay);
	};
}

/**
 * The only export of this file is a debounced version
 * of the main calculation function
 */
export const debouncedCalculation = debounce(calculate, 300);
