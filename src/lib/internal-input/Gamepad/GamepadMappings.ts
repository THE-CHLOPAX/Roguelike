/**
 * Standard Gamepad button mappings based on the W3C Gamepad API standard
 * https://www.w3.org/TR/gamepad/#remapping
 */

export type GamepadButton = 
	| 'A' | 'B' | 'X' | 'Y'
	| 'LB' | 'RB' | 'LT' | 'RT'
	| 'SELECT' | 'START'
	| 'L3' | 'R3'
	| 'DPAD_UP' | 'DPAD_DOWN' | 'DPAD_LEFT' | 'DPAD_RIGHT';

export type GamepadAxis = 
	| 'LEFT_STICK_X' | 'LEFT_STICK_Y'
	| 'RIGHT_STICK_X' | 'RIGHT_STICK_Y';

/**
 * Standard gamepad button indices (Xbox layout)
 * This follows the W3C standard mapping used by most modern controllers
 */
export const GAMEPAD_BUTTON_MAPPING: Record<GamepadButton, number> = {
	// Face buttons (right side)
	'A': 0,           // Bottom button (Xbox A, PS Cross)
	'B': 1,           // Right button (Xbox B, PS Circle)
	'X': 2,           // Left button (Xbox X, PS Square)
	'Y': 3,           // Top button (Xbox Y, PS Triangle)
	
	// Shoulder buttons
	'LB': 4,          // Left bumper (L1)
	'RB': 5,          // Right bumper (R1)
	'LT': 6,          // Left trigger (L2)
	'RT': 7,          // Right trigger (R2)
	
	// Center buttons
	'SELECT': 8,      // Select/Back/Share button
	'START': 9,       // Start/Options button
	
	// Stick buttons
	'L3': 10,         // Left stick press
	'R3': 11,         // Right stick press
	
	// D-Pad
	'DPAD_UP': 12,
	'DPAD_DOWN': 13,
	'DPAD_LEFT': 14,
	'DPAD_RIGHT': 15,
};

/**
 * Standard gamepad axis indices
 */
export const GAMEPAD_AXIS_MAPPING: Record<GamepadAxis, number> = {
	'LEFT_STICK_X': 0,   // Left stick horizontal (-1 = left, +1 = right)
	'LEFT_STICK_Y': 1,   // Left stick vertical (-1 = up, +1 = down)
	'RIGHT_STICK_X': 2,  // Right stick horizontal (-1 = left, +1 = right)
	'RIGHT_STICK_Y': 3,  // Right stick vertical (-1 = up, +1 = down)
};

/**
 * Reverse mapping for button indices to names
 */
export const GAMEPAD_BUTTON_INDEX_TO_NAME: Record<number, GamepadButton> = 
	Object.fromEntries(
		Object.entries(GAMEPAD_BUTTON_MAPPING).map(([name, index]) => [index, name as GamepadButton])
	) as Record<number, GamepadButton>;

/**
 * Reverse mapping for axis indices to names
 */
export const GAMEPAD_AXIS_INDEX_TO_NAME: Record<number, GamepadAxis> = 
	Object.fromEntries(
		Object.entries(GAMEPAD_AXIS_MAPPING).map(([name, index]) => [index, name as GamepadAxis])
	) as Record<number, GamepadAxis>;
