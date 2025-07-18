# stimulus-matrix-display plugin

This plugin implements a stimulus matrix display trial used for eyetracking experiments and other research studies. A target ('E' by default) appears in locations on a blank canvas based on a customizable grid layout. 

**Rotation Control:**
- Use `rotation_angles` to randomly sample rotation angles for each target
- Use `rotation_sequence` to specify exact rotations for each target in order  
- `rotation_sequence` takes priority over `rotation_angles` when both are provided

**Location Control:**
- Use `target_locations` to specify exact presentation order of grid positions
- If empty array, locations will be randomized automatically

The participant must look at the target and respond with an arrow key by default, or click on the targets when clickable mode is enabled. When using keyboard responses with rotation, the correct direction corresponds to where the lines of the 'E' are headed (0° = Right, 90° = Down, 180° = Left, 270° = Up). After a correct response, a new target will appear. The plugin supports flexible grid sizes (e.g., 3x3, 4x4, 5x3, etc.) and can use either text characters or images as targets. When using time-based display, targets automatically advance after a specified duration without requiring user input.

## Using a Plugin

Please visit [this jsPsych tutorial](https://www.jspsych.org/v8/overview/plugins/) to learn the basics of setting up a jsPsych plugin. Feel free to cross-reference our [demo code](https://github.com/beatlab-mcmaster/AVOKE/blob/main/plugin-stimulus-matrix-display/examples/index.html) to get a better idea of how to implement this plugin in a working demo experiment. You'll find further detail about parameters and data output below.

## Parameters

In addition to the [parameters available in all plugins](https://www.jspsych.org/latest/overview/plugins/#parameters-available-in-all-plugins), this plugin accepts the following parameters. Parameters with a default value of undefined must be specified. Other parameters can be left unspecified if the default value is acceptable.

| Parameter           | Type             | Default Value      | Description                              |
| ------------------- | ---------------- | ------------------ | ---------------------------------------- |
|stimulus|function|null|Optional custom drawing function to apply to the canvas. If not provided, the plugin uses a built-in function that handles both text and image targets automatically.|
|choices|array of keyboard buttons|["ArrowDown", "ArrowUp", "ArrowRight", "ArrowLeft"]|Array containing the key(s) that the subject is allowed to press to respond to the stimulus.|
|fixation_target|string|"E"|The string that will be displayed as the target when not using an image.|
|target_image|string|null|Path to an image file to use as the target instead of text. When provided, this overrides the fixation_target parameter.|
|target_size|numeric|41|The size of the target, in pixels.|
|target_duration|numeric|null|When set to a number (milliseconds), targets automatically advance after that duration. When null (default), targets wait for user response indefinitely.|
|grid_rows|numeric|3|Number of rows in the display grid. Combined with grid_cols, determines the total number of targets (grid_rows × grid_cols).|
|grid_cols|numeric|3|Number of columns in the display grid. Combined with grid_rows, determines the total number of targets (grid_rows × grid_cols).|
|canvas_size|array of numbers|[166, 296]|Array containing the height (first value) and width (second value) of the canvas element, in pixels.|
|clickable_targets|boolean|false|If true, the targets can be interacted with using a left-click of the mouse.|
|rotation_angles|array of numbers|[]|Array of rotation angles (in degrees) to randomly sample from for each target. If empty array (default), no rotation is applied. Each target gets a randomly selected angle from this array. Example: [0, 90, 180, 270] will randomly assign one of these rotations to each target.|
|target_locations|array of numbers|[]|Array specifying the order of target locations using 0-indexed grid positions. If empty array (default), locations will be randomized. If provided, should contain indices from 0 to (grid_rows × grid_cols - 1). Example: [4, 0, 8, 2] for a 3×3 grid.|
|rotation_sequence|array of numbers|[]|Array of predetermined rotation angles (in degrees) for each target in sequence. If empty array (default), uses rotation_angles behavior. If provided, should contain one rotation value for each target. Takes priority over rotation_angles when both are specified. Example: [0, 90, 0, 180] for specific rotations.|
|require_direction_match|boolean|false|If true, requires user to press arrow key corresponding to target rotation direction. Only works with keyboard input (not clickable targets). When enabled, only the correct directional key will advance to the next target.|

## Data Generated

In addition to the [default data collected by all plugins](https://www.jspsych.org/latest/overview/plugins/#data-collected-by-all-plugins), this plugin collects the following data for each trial.

| Name      | Type    | Value                                    |
| --------- | ------- | ---------------------------------------- |
|responses|dictionary|This dictionary contains a variety of information about the participant's responses. Specific details on each entry are listed below.|
|responses:key_press|string|Contains the keyboard key that the participant pressed.|
|responses:rt|numeric|The time in milliseconds, between when the target appeared and when the participant clicked the button.|
|responses:input_time|numeric|The exact time at which the correct input occurred.|
|responses:wrong_inputs|numeric|Keeps a count of the number of wrong inputs made by the participant for that specific stimulus presentation.|
|presentation|dictionary|This dictionary contains a variety of information about where, when, and what orientation the target is presented in. Specific details on each entry are listed below.|
|presentation:index|numeric|The value is corresponding to the order in which sequential targets are presented.|
|presentation:loc|array of numbers|The coordinate pair corresponding to the location at which the target is presented.|
|presentation:rotation|numeric|The rotation angle in degrees that the target was presented with (e.g., 0, 90, 180, 270).|
|presentation:time|numeric|A high resolution timestamp of when the target is presented in milliseconds, produced via `'performance.now()'`.|
|total_wrong_inputs|numeric|The total number of wrong inputs made by the participant throughout the entire trial.|
|target_duration|numeric|When set to a number, targets automatically advance after this duration. When null, targets wait for user response.|
|target_type|string|Indicates whether the trial used 'text' or 'image' targets.|
|target_content|string|The actual content used - either the text character or image file path.|
|grid_rows|numeric|Number of rows in the display grid used for this trial.|
|grid_cols|numeric|Number of columns in the display grid used for this trial.|

<!-- ## Install

Using the CDN-hosted JavaScript file:

```js
<script src="https://unpkg.com/@avoke/plugin-stimulus-matrix-display"></script>
```

Using the JavaScript file downloaded from a GitHub release dist archive:

```js
<script src="jspsych/plugin-stimulus-matrix-display.js"></script>
```

Using NPM:

```
npm install @jspsych-contrib/plugin-stimulus-matrix-display
```

```js
import {jsPsychStimulusMatrixDisplay} from '@jspsych-contrib/plugin-stimulus-matrix-display';
``` -->

## Examples

### Trial Example
The plugin now includes built-in drawing capabilities, making it extremely easy to use without writing any custom functions:

### Text Targets
```javascript
{
  type: jsPsychStimulusMatrixDisplay,
  canvas_size: [500, 800],
  fixation_target: "★", // Any text character
  target_size: 50,
  target_duration: 2000, // 2 seconds per target
  grid_rows: 3, // 3x3 grid (9 targets total)
  grid_cols: 3
}
```

### Image Targets
```javascript
{
  type: jsPsychStimulusMatrixDisplay,
  canvas_size: [500, 800],
  target_image: './path/to/your/image.png',
  target_size: 60,
  target_duration: 3000, // 3 seconds per target
  grid_rows: 4, // 4x4 grid (16 targets total)
  grid_cols: 4
}
```

### Custom Grid Sizes
```javascript
// Wide horizontal display (5 columns, 2 rows = 10 targets)
{
  type: jsPsychStimulusMatrixDisplay,
  canvas_size: [400, 1000],
  fixation_target: "+",
  target_size: 40,
  grid_rows: 2,
  grid_cols: 5
}

// Tall vertical display (3 columns, 6 rows = 18 targets)
{
  type: jsPsychStimulusMatrixDisplay,
  canvas_size: [600, 400],
  fixation_target: "○",
  target_size: 35,
  grid_rows: 6,
  grid_cols: 3
}
```

### Interactive vs Time-based Display
```javascript
// Interactive display (wait for user response)
{
  type: jsPsychStimulusMatrixDisplay,
  fixation_target: "E",
  target_duration: null, // Wait for user input
  grid_rows: 3,
  grid_cols: 3
}

// Time-based display (auto-advance)
{
  type: jsPsychStimulusMatrixDisplay,
  fixation_target: "E",
  target_duration: 1500, // Auto-advance after 1.5 seconds
  grid_rows: 3,
  grid_cols: 3
}
```

### Clickable Targets
```javascript
// Clickable targets instead of keyboard responses
{
  type: jsPsychStimulusMatrixDisplay,
  fixation_target: "●",
  target_size: 50,
  clickable_targets: true, // Enable click interactions
  grid_rows: 3,
  grid_cols: 3
}
```

### Rotation Control
```javascript
// No rotation (default)
{
  type: jsPsychStimulusMatrixDisplay,
  fixation_target: "E",
  // rotation_angles: [], // No rotation applied (default - can be omitted)
  grid_rows: 3,
  grid_cols: 3
}

// Classic 4-direction rotation
{
  type: jsPsychStimulusMatrixDisplay,
  fixation_target: "E",
  rotation_angles: [0, 90, 180, 270], // Cardinal directions
  grid_rows: 3,
  grid_cols: 3
}

// Custom 8-direction rotation
{
  type: jsPsychStimulusMatrixDisplay,
  fixation_target: "E",
  rotation_angles: [0, 45, 90, 135, 180, 225, 270, 315], // 8 directions
  grid_rows: 2,
  grid_cols: 2
}

// Randomized rotation order (external randomization)
{
  type: jsPsychStimulusMatrixDisplay,
  fixation_target: "E",
  rotation_angles: jsPsych.randomization.shuffle([0, 90, 180, 270]),
  grid_rows: 3,
  grid_cols: 3
}

// Fixed rotation (all targets at same angle)
{
  type: jsPsychStimulusMatrixDisplay,
  fixation_target: "E",
  rotation_angles: [45], // All targets at 45 degrees
  grid_rows: 3,
  grid_cols: 3
}
```

### Direction Matching (Directional Response Required)
```javascript
// Basic direction matching - requires correct arrow key for each rotation
{
  type: jsPsychStimulusMatrixDisplay,
  fixation_target: "E",
  rotation_angles: [0, 90, 180, 270], // 4 cardinal directions
  require_direction_match: true, // Must press matching arrow key
  grid_rows: 3,
  grid_cols: 3
}

// Advanced direction matching with 8 directions
{
  type: jsPsychStimulusMatrixDisplay,
  fixation_target: "E",
  rotation_angles: [0, 45, 90, 135, 180, 225, 270, 315],
  require_direction_match: true,
  target_size: 60, // Larger size for better visibility of rotation
  grid_rows: 2,
  grid_cols: 2
}

// Direction matching with custom target
{
  type: jsPsychStimulusMatrixDisplay,
  fixation_target: "→", // Arrow character for clearer direction indication
  rotation_angles: [0, 90, 180, 270],
  require_direction_match: true,
  target_size: 50,
  grid_rows: 3,
  grid_cols: 3
}
```

**Direction Mapping for `require_direction_match: true`:**
- 0° (facing right) → Right arrow key
- 90° (facing down) → Down arrow key
- 180° (facing left) → Left arrow key
- 270° (facing up) → Up arrow key
- Other angles are mapped to the nearest cardinal direction

No `stimulus` parameter needed! The plugin handles everything automatically.
