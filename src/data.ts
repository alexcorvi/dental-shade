import { drawType, rectangle } from "./types";

/**
 * This file contains the state of the application
 */

const rectangles: { [key in "shades" | "teeth"]: rectangle[] } = {
	shades: [],
	teeth: [],
};

export let data: {
	rectangles: { [key in "teeth" | "shades"]: rectangle[] };
	currentDraw: drawType;
} = {
	rectangles,
	currentDraw: "",
};


(window as any).data = data;