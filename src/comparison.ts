import { rgbToLab } from "./conversion";
import { dE00 } from "./deltae2000";
import { sortColorsByLightness } from "./sorting";
import { ColorTuple } from "./types";

/**
 * A simple function to calculate an average of an array of numbers
 */
function average(arr: number[]): number {
	const totalSum: number = arr.reduce((sum, num) => sum + num, 0);
	const average: number = totalSum / arr.length;
	return average;
}

/**
 * Euclidean distance for color comparison
 * abandoned in favor of DeltaE2000
 * kept for future further development
 */
function euclideanDistance(color1: ColorTuple, color2: ColorTuple): number {
	return Math.sqrt(
		color1.reduce((acc, val, index) => acc + (val - color2[index]) ** 2, 0)
	);
}

/**
 * This application uses the deltaE2000 algorithm for color comparison
 * This is a javascript implementation
 */
export function deltaE2000(color1: ColorTuple, color2: ColorTuple): number {
	color1 = rgbToLab(color1);
	color2 = rgbToLab(color2);

	let d = new dE00(
		{ L: color1[0], A: color1[1], B: color1[2] },
		{ L: color2[0], A: color2[1], B: color2[2] }
	);

	return d.getDeltaE();
}

/**
 *
 * The following two functions are part of the DeltaE2000 algorithm
 */
function calculateLabAngle(b: number, a: number): number {
	const radian = Math.atan2(b, a);
	let angle = radian * (180 / Math.PI);
	if (angle < 0) {
		angle += 360;
	}
	return angle;
}

function calculateDeltaHPrime(
	h1prime: number,
	h2prime: number,
	C1prime: number,
	C2prime: number
): number {
	let deltaHPrime = h2prime - h1prime;
	if (C1prime * C2prime === 0) {
		return 0;
	} else if (Math.abs(deltaHPrime) <= 180) {
		return deltaHPrime;
	} else if (deltaHPrime > 180) {
		return deltaHPrime - 360;
	} else {
		return deltaHPrime + 360;
	}
}

/**
 * This function is used to compare two groups of colors
 * and give the average difference between them
 */
export function deltaE2000Groups(groupA: ColorTuple[], groupB: ColorTuple[]) {
	groupA = sortColorsByLightness(groupA);
	groupB = sortColorsByLightness(groupB);

	const diffValues: number[] = [];
	const minLength = Math.min(groupA.length, groupB.length);
	const maxLength = Math.max(groupA.length, groupB.length);
	
	// Calculate the midpoint of the longer array
	const midPoint = Math.floor(maxLength / 2);
	
	for (let index = -midPoint; index < minLength - midPoint; index++) {
		const color1 = groupA[index + midPoint] || groupA[groupA.length - 1]; // Adjust for shorter array
		const color2 = groupB[index + midPoint] || groupB[groupB.length - 1]; // Adjust for shorter array
		diffValues.push(deltaE2000(color1, color2));
	}

	return average(diffValues);
}
