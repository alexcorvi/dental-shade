import { ColorTuple } from "./types";

/**
 * A function that converts RGB to HEX
 * not used, kept for future development
 */
export function rgbToHex(rgb: ColorTuple) {
	return (
		"#" +
		rgb
			.map((component) => {
				const hex = component.toString(16);
				return hex.length === 1 ? "0" + hex : hex;
			})
			.join("")
	);
}

export function hexToRGBA(hex: string): ColorTuple {
	// Remove '#' if present
	hex = hex.replace("#", "");

	// Convert hex to RGBA
	const bigint = parseInt(hex, 16);
	const r = (bigint >> 16) & 255;
	const g = (bigint >> 8) & 255;
	const b = bigint & 255;

	return [r, g, b];
}

/**
 * A function that converts RGB to HSL
 */
export function rgbToHSL(rgb: ColorTuple): ColorTuple {
	const [r, g, b] = rgb.map((c) => c / 255);

	const max = Math.max(r, g, b);
	const min = Math.min(r, g, b);
	let h: number,
		s: number,
		l: number = (max + min) / 2;

	if (max === min) {
		h = s = 0; // achromatic
	} else {
		const d = max - min;
		s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
		switch (max) {
			case r:
				h = (g - b) / d + (g < b ? 6 : 0);
				break;
			case g:
				h = (b - r) / d + 2;
				break;
			case b:
				h = (r - g) / d + 4;
				break;
			default:
				h = 0;
				break;
		}
		h /= 6;
	}

	return [h, s, l];
}

/**
 * A function that converts RGB to LAB
 */
export function rgbToLab(rgb: ColorTuple): ColorTuple {
	// Convert RGB to linear RGB
	const linearize = (val: number) => {
		val /= 255;
		return val <= 0.04045 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
	};

	let r = linearize(rgb[0]);
	let g = linearize(rgb[1]);
	let b = linearize(rgb[2]);

	// Convert to XYZ color space
	const xyzMatrix = [
		[0.4124564, 0.3575761, 0.1804375],
		[0.2126729, 0.7151522, 0.072175],
		[0.0193339, 0.119192, 0.9503041],
	];

	let x = xyzMatrix[0][0] * r + xyzMatrix[0][1] * g + xyzMatrix[0][2] * b;
	let y = xyzMatrix[1][0] * r + xyzMatrix[1][1] * g + xyzMatrix[1][2] * b;
	let z = xyzMatrix[2][0] * r + xyzMatrix[2][1] * g + xyzMatrix[2][2] * b;

	// Clamp XYZ values to ensure they are within valid range
	x = Math.max(0, Math.min(x, 0.95047));
	y = Math.max(0, Math.min(y, 1.0));
	z = Math.max(0, Math.min(z, 1.08883));

	// Convert to LAB color space
	const epsilon = 0.008856;
	const kappa = 903.3;

	const fy = y > epsilon ? Math.pow(y, 1 / 3) : (kappa * y + 16) / 116;
	const fx = x > epsilon ? Math.pow(x, 1 / 3) : (kappa * x + 16) / 116;
	const fz = z > epsilon ? Math.pow(z, 1 / 3) : (kappa * z + 16) / 116;

	const L = 116 * fy - 16;
	const A = 500 * (fx - fy);
	const B = 200 * (fy - fz);

	return [L, A, B];
}
