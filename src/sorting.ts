import { ColorTuple } from "./types";
import { rgbToHSL } from "./conversion";

/**
 * A function to sort an array of colors by their lightness
 * P.S. the other two function aren't used
 * but are kept for further development
 */
export function sortColorsByLightness(colors: ColorTuple[]) {
	colors.sort((color1, color2) => {
		const lightness1 = rgbToHSL(color1)[2];
		const lightness2 = rgbToHSL(color2)[2];
		return lightness1 - lightness2;
	});
	return colors;
}

export function sortColorsByHue(colors: ColorTuple[]): ColorTuple[] {
	colors.sort((color1, color2) => {
		const hue1 = rgbToHSL(color1)[0];
		const hue2 = rgbToHSL(color2)[0];
		return hue1 - hue2;
	});
	return colors;
}

export function sortColorBySaturation(colors: ColorTuple[]): ColorTuple[] {
	colors.sort((color1, color2) => {
		const hue1 = rgbToHSL(color1)[1];
		const hue2 = rgbToHSL(color2)[1];
		return hue1 - hue2;
	});
	return colors;
}
