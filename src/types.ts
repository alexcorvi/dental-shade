export type ColorTuple = [number, number, number];

export type coords = { x: number; y: number };

export type drawType = "shades" | "teeth" | "";

export type rectangle = {
	x: number;
	y: number;
	width: number;
	height: number;
};

export type resizeEdgeT = "" | "left" | "right" | "top" | "bottom" | "corner";
