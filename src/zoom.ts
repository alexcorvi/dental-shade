/**
 * Double finger Zooming and panning feature
 * credits: https://github.com/anitasv/zoom
 * Modifications from original code:
 * 1. Typescript conversion
 * 2. Activates on double finger (not single touch)
 */

interface Config {
	rotate: boolean;
	pan: boolean;
	minZoom: number;
	maxZoom: number;
}

// Scalar multiplication
const scalarMultiply = (
	scalar: number,
	vector: [number, number]
): [number, number] => [scalar * vector[0], scalar * vector[1]];

// Vector addition
const vectorAddition = (
	a: [number, number],
	b: [number, number]
): [number, number] => [a[0] + b[0], a[1] + b[1]];

// Vector subtraction
const vectorSubtraction = (
	a: [number, number],
	b: [number, number]
): [number, number] => [a[0] - b[0], a[1] - b[1]];

// Dot product of two vectors
const dotProduct = (a: [number, number], b: [number, number]): number =>
	a[0] * b[0] + a[1] * b[1];

// Wedge product of two vectors
const wedgeProduct = (a: [number, number], b: [number, number]): number =>
	a[0] * b[1] - a[1] * b[0];

// Apply transformation matrix to vector
const applyTransformation = (
	matrix: [[number, number], [number, number]],
	vector: [number, number]
): [number, number] =>
	vectorAddition(
		scalarMultiply(vector[0], matrix[0]),
		scalarMultiply(vector[1], matrix[1])
	);

// Matrix multiplication
const matrixMultiply = (
	A: [[number, number], [number, number]],
	B: [[number, number], [number, number]]
): [[number, number], [number, number]] => [
	applyTransformation(A, B[0]),
	applyTransformation(A, B[1]),
];

class Transform {
	A: [[number, number], [number, number]];
	b: [number, number];

	constructor(
		matrix: [[number, number], [number, number]],
		vector: [number, number]
	) {
		this.A = matrix;
		this.b = vector;
	}

	// Get CSS transform string representation
	css(): string {
		const A = this.A;
		const b = this.b;
		return `matrix(${A[0][0]}, ${A[0][1]}, ${A[1][0]}, ${A[1][1]}, ${b[0]}, ${b[1]})`;
	}

	// Average transformation matrices and vectors
	static average(Z: Transform, I: Transform, progress: number): Transform {
		return new Transform(
			averageMatrix(Z.A, I.A, progress),
			averageVector(Z.b, I.b, progress)
		);
	}
}

// Cascade two transformations
const cascadeTransformations = (T: Transform, U: Transform): Transform =>
	new Transform(
		matrixMultiply(T.A, U.A),
		vectorAddition(applyTransformation(T.A, U.b), T.b)
	);

// Rotate transformation matrix
const rotateMatrix = (
	cosTheta: number,
	sinTheta: number
): [[number, number], [number, number]] => [
	[cosTheta, sinTheta],
	[-sinTheta, cosTheta],
];

// Get rotation and scaling transformation matrix
const rotationScalingMatrix = (
	a: [number, number],
	b: [number, number]
): [[number, number], [number, number]] => {
	const aLength = dotProduct(a, a);
	const dotProductAB = dotProduct(a, b);
	const wedgeProductAB = wedgeProduct(a, b);
	return rotateMatrix(dotProductAB / aLength, wedgeProductAB / aLength);
};

// Get scaling transformation matrix
const justScalingMatrix = (
	a: [number, number],
	b: [number, number]
): [[number, number], [number, number]] => {
	const aLength = Math.sqrt(dotProduct(a, a));
	const bLength = Math.sqrt(dotProduct(b, b));
	const scale = bLength / aLength;
	return rotateMatrix(scale, 0);
};

// Get magnification factor of transformation matrix
const getMagnification = (
	matrix: [[number, number], [number, number]]
): number => Math.abs((matrix[0][0] + matrix[1][1]) / 2);

// Scale transformation matrix by a scalar factor
const scaleMatrix = (
	matrix: [[number, number], [number, number]],
	scalar: number
): [[number, number], [number, number]] => [
	scalarMultiply(scalar, matrix[0]),
	scalarMultiply(scalar, matrix[1]),
];

// Zoom transformation between source and destination points
const zoomTransformation = (
	source: [[number, number], [number, number]],
	destination: [[number, number], [number, number]],
	allowRotation: boolean,
	minZoom: number,
	maxZoom: number
): Transform => {
	const a = vectorSubtraction(source[1], source[0]);
	const b = vectorSubtraction(destination[1], destination[0]);
	let transformationMatrix = allowRotation
		? rotationScalingMatrix(a, b)
		: justScalingMatrix(a, b);

	let magnificationFactor = getMagnification(transformationMatrix);
	if (magnificationFactor < minZoom) {
		transformationMatrix = scaleMatrix(
			transformationMatrix,
			minZoom / magnificationFactor
		);
	} else if (magnificationFactor > maxZoom) {
		transformationMatrix = scaleMatrix(
			transformationMatrix,
			maxZoom / magnificationFactor
		);
	}

	const transformedSource0 = applyTransformation(
		transformationMatrix,
		source[0]
	);
	const translation = vectorSubtraction(destination[0], transformedSource0);

	return new Transform(transformationMatrix, translation);
};

// Average two vectors
const averageVector = (
	u: [number, number],
	v: [number, number],
	progress: number
): [number, number] => {
	const scaledU = scalarMultiply(1 - progress, u);
	const scaledV = scalarMultiply(progress, v);
	return vectorAddition(scaledU, scaledV);
};

// Average two matrices
const averageMatrix = (
	A: [[number, number], [number, number]],
	B: [[number, number], [number, number]],
	progress: number
): [[number, number], [number, number]] => [
	averageVector(A[0], B[0], progress),
	averageVector(A[1], B[1], progress),
];

export class Zoom {
	mayBeDoubleTap: number | null = null;
	isAnimationRunning: boolean = false;
	curTouch: number = 0;
	elem: HTMLElement;
	elemParent: Node;
	activeZoom: Transform = new Transform(
		[
			[1, 0],
			[0, 1],
		],
		[0, 0]
	);
	resultantZoom: Transform = new Transform(
		[
			[1, 0],
			[0, 1],
		],
		[0, 0]
	);
	srcCoords: [[number, number], [number, number]] = [
		[0, 0],
		[0, 0],
	];
	destCoords: [[number, number], [number, number]] = [
		[0, 0],
		[0, 0],
	];
	config: Config;
	wnd: Window;
	_handleZoom: (evt: Event) => void;
	_handleTouchStart: (evt: Event) => void;

	constructor(elem: HTMLElement, config: Partial<Config>, wnd?: Window) {
		this.elem = elem;
		this.elemParent = elem.parentNode!;
		this.config = this.setDefaultConfig(config, {
			rotate: true,
			pan: false,
			minZoom: 0,
			maxZoom: Infinity,
		});

		this.wnd = wnd || window;

		elem.style.willChange = "transform";
		elem.style.transformOrigin = "0 0";

		this._handleZoom = this.handleTouchEvent(this.handleZoom);
		this._handleTouchStart = this.handleTouchEvent(this.handleTouchStart);

		this.elemParent.addEventListener("touchstart", this._handleTouchStart);
		this.elemParent.addEventListener("touchstart", this._handleZoom);
		this.elemParent.addEventListener("touchmove", this._handleZoom);
		this.elemParent.addEventListener("touchend", this._handleZoom);
	}

	destroy(): void {
		this.elemParent.removeEventListener("touchstart", this._handleTouchStart);
		this.elemParent.removeEventListener("touchstart", this._handleZoom);
		this.elemParent.removeEventListener("touchmove", this._handleZoom);
		this.elemParent.removeEventListener("touchend", this._handleZoom);

		this.elem.style.willChange = "";
		this.elem.style.transformOrigin = "";
		this.elem.style.transform = "";
	}

	previewZoom(): void {
		const zoomLevel = getMagnification(this.activeZoom.A);
		const minZoom = this.config.minZoom / zoomLevel;
		const maxZoom = this.config.maxZoom / zoomLevel;

		const additionalZoom = zoomTransformation(
			this.srcCoords,
			this.destCoords,
			this.config.rotate,
			minZoom,
			maxZoom
		);
		this.resultantZoom = cascadeTransformations(
			additionalZoom,
			this.activeZoom
		);
		this.repaint();
	}

	setZoom(newZoom: Transform): void {
		this.resultantZoom = newZoom;
		this.repaint();
	}

	finalize(): void {
		this.activeZoom = this.resultantZoom;
	}

	repaint(): void {
		this.elem.style.transform = this.resultantZoom.css();
	}

	reset(): void {
		if (this.wnd.requestAnimationFrame) {
			this.isAnimationRunning = true;
			const Z = this.activeZoom;
			let startTime: number | null = null;

			const step = (time: number) => {
				if (!startTime) {
					startTime = time;
				}
				const progress = (time - startTime) / 100;
				if (progress >= 1) {
					this.setZoom(
						new Transform(
							[
								[1, 0],
								[0, 1],
							],
							[0, 0]
						)
					);
					this.isAnimationRunning = false;
				} else {
					this.setZoom(
						Transform.average(
							Z,
							new Transform(
								[
									[1, 0],
									[0, 1],
								],
								[0, 0]
							),
							progress
						)
					);
					this.wnd.requestAnimationFrame(step);
				}
			};
			this.wnd.requestAnimationFrame(step);
		} else {
			this.setZoom(
				new Transform(
					[
						[1, 0],
						[0, 1],
					],
					[0, 0]
				)
			);
		}
	}

	handleTouchEvent(cb: (touches: TouchList) => void): (evt: Event) => void {
		return (evt: Event) => {
			if (!(evt instanceof TouchEvent)) return;
			evt.preventDefault();
			if (this.isAnimationRunning) {
				return;
			}
			const touches = evt.touches;
			if (!touches || touches.length < 2) {
				this.mayBeDoubleTap = null;
				this.isAnimationRunning = false;
				this.curTouch = 0;
				this.srcCoords = [
					[0, 0],
					[0, 0],
				];
				this.destCoords = [
					[0, 0],
					[0, 0],
				];
				return;
			}
			cb(touches);
		};
	}

	handleZoom = (touches: TouchList) => {
		const numOfFingers = touches.length;
		if (numOfFingers !== this.curTouch) {
			this.curTouch = numOfFingers;
			this.finalize();
			if (numOfFingers !== 0) {
				this.setSrcAndDest(touches);
			}
		} else {
			this.setDest(touches);
			this.previewZoom();
		}
	};

	handleTouchStart = (touches: TouchList) => {
		if (touches.length === 1) {
			if (this.mayBeDoubleTap !== null) {
				this.wnd.clearTimeout(this.mayBeDoubleTap);
				this.reset();
				this.mayBeDoubleTap = null;
			} else {
				this.mayBeDoubleTap = this.wnd.setTimeout(() => {
					this.mayBeDoubleTap = null;
				}, 300);
			}
		}
	};

	setSrcAndDest(touches: TouchList): void {
		this.srcCoords = this.getCoords(touches);
		this.destCoords = this.srcCoords;
	}

	setDest(touches: TouchList): void {
		this.destCoords = this.getCoords(touches);
	}

	getCoordsDouble(t: TouchList): [[number, number], [number, number]] {
		const parent = this.elem.parentElement;
		const rect = parent!.getBoundingClientRect();
		const offsetX = rect.left;
		const offsetY = rect.top;
		return [
			[t[0].pageX - offsetX, t[0].pageY - offsetY],
			[t[1].pageX - offsetX, t[1].pageY - offsetY],
		];
	}

	getCoordsSingle(t: TouchList): [[number, number], [number, number]] {
		const parent = this.elem.parentElement;
		const rect = parent!.getBoundingClientRect();
		const offsetX = rect.left;
		const offsetY = rect.top;
		const x = t[0].pageX - offsetX;
		const y = t[0].pageY - offsetY;
		return [
			[x, y],
			[x + 1, y + 1],
		];
	}

	getCoords(t: TouchList): [[number, number], [number, number]] {
		return t.length > 1 ? this.getCoordsDouble(t) : this.getCoordsSingle(t);
	}

	setDefaultConfig(
		providedConfig: Partial<Config>,
		defaultConfig: Config
	): Config {
		const newConfig: Config = {
			rotate: this.applyDefaults(providedConfig.rotate, defaultConfig.rotate),
			pan: this.applyDefaults(providedConfig.pan, defaultConfig.pan),
			minZoom: this.applyDefaults(
				providedConfig.minZoom,
				defaultConfig.minZoom
			),
			maxZoom: this.applyDefaults(
				providedConfig.maxZoom,
				defaultConfig.maxZoom
			),
		};
		return newConfig;
	}

	applyDefaults<T>(providedValue: T | undefined, defaultValue: T): T {
		return providedValue === undefined ? defaultValue : providedValue;
	}
}
