# fix-point-calibration plugin

This plugin implements a fix-point calibration trial used for eyetracking experiments. A target ('E' by default) appears in random locations on a blank canvas based on a customizable grid layout. The target will appear in random orientations of 0, 90, 180, and 270 degrees. The participant must look at the target and respond with an arrow key by default, with the correct direction corresponding to where the lines of the 'E' are headed. After a correct response, a new target will appear. The plugin supports flexible grid sizes (e.g., 3x3, 4x4, 5x3, etc.) and can use either text characters or images as targets. When using time-based calibration, targets automatically advance after a specified duration without requiring user input.

## Using a Plugin

Please visit [this jsPsych tutorial](https://www.jspsych.org/v8/overview/plugins/) to learn the basics of setting up a jsPsych plugin. Feel free to cross-reference our [demo code](https://github.com/beatlab-mcmaster/AVOKE/blob/main/plugin-fix-point-calibration/examples/index.html) to get a better idea of how to implement this plugin in a working demo experiment. You'll find further detail about parameters and data output below.

## Parameters

In addition to the [parameters available in all plugins](https://www.jspsych.org/latest/overview/plugins/#parameters-available-in-all-plugins), this plugin accepts the following parameters. Parameters with a default value of undefined must be specified. Other parameters can be left unspecified if the default value is acceptable.

| Parameter           | Type             | Default Value      | Description                              |
| ------------------- | ---------------- | ------------------ | ---------------------------------------- |
|stimulus|function|null|Optional custom drawing function to apply to the canvas. If not provided, the plugin uses a built-in function that handles both text and image targets automatically.|
|choices|array of keyboard buttons|["ArrowDown", "ArrowUp", "ArrowRight", "ArrowLeft"]|Array containing the key(s) that the subject is allowed to press to respond to the stimulus.|
|fixation_target|string|"E"|The string that will be displayed as the target when not using an image.|
|target_image|string|null|Path to an image file to use as the target instead of text. When provided, this overrides the fixation_target parameter.|
|target_size|numeric|41|The size of the fixation target, in pixels.|
|target_duration|numeric|null|When set to a number (milliseconds), targets automatically advance after that duration. When null (default), targets wait for user response indefinitely.|
|grid_rows|numeric|3|Number of rows in the calibration grid. Combined with grid_cols, determines the total number of targets (grid_rows × grid_cols).|
|grid_cols|numeric|3|Number of columns in the calibration grid. Combined with grid_rows, determines the total number of targets (grid_rows × grid_cols).|
|canvas_size|array of numbers|[166, 296]|Array containing the height (first value) and width (second value) of the canvas element, in pixels.|
|clickable_targets|boolean|false|If true, the targets can be interacted with using a left-click of the mouse.|

## Data Generated

In addition to the [default data collected by all plugins](https://www.jspsych.org/latest/overview/plugins/#data-collected-by-all-plugins), this plugin collects the following data for each trial.

| Name      | Type    | Value                                    |
| --------- | ------- | ---------------------------------------- |
|responses|dictionary|This dictionary contains a variety of information about the participant's responses. Specific details on each entry are listed below.|
|responses:key_press|string|Contains the keyboard key that the participant pressed.|
|responses:rt|numeric|The time in milliseconds, between when the target appeared and when the participant clicked the button.|
|responses:keypress_time|numeric|The exact time at which the correct keypress occurred.|
|responses:wrong_keypresses|numeric|Keeps a count of the number of wrong keypresses made by the participant for that specific stimulus presentation.|
|presentation|dictionary|This dictionary contains a variety of information about where, when, and what orientation the target is presented in. Specific details on each entry are listed below.|
|presentation:index|numeric|The value is corresponding to the order in which sequential targets are presented.|
|presentation:loc|array of numbers|The coordinate pair corresponding to the location at which the target is presented.|
|presentation:dir|dictionary|Key-value pairs of the orientation the target is presented in (ex. `'Right' : 0`).|
|presentation:time|numeric|A high resolution timestamp of when the target is presented in milliseconds, produced via `'performance.now()'`.|
|total_wrong_keypresses|numeric|The total number of wrong keypresses made by the participant throughout the entire trial.|
|target_duration|numeric|When set to a number, targets automatically advance after this duration. When null, targets wait for user response.|
|target_type|string|Indicates whether the trial used 'text' or 'image' targets.|
|target_content|string|The actual content used - either the text character or image file path.|
|grid_rows|numeric|Number of rows in the calibration grid used for this trial.|
|grid_cols|numeric|Number of columns in the calibration grid used for this trial.|

<!-- ## Install

Using the CDN-hosted JavaScript file:

```js
<script src="https://unpkg.com/@avoke/plugin-fix-point-calibration"></script>
```

Using the JavaScript file downloaded from a GitHub release dist archive:

```js
<script src="jspsych/plugin-fix-point-calibration.js"></script>
```

Using NPM:

```
npm install @jspsych-contrib/plugin-fix-point-calibration
```

```js
import {jsPsychFixPointCalibration} from '@jspsych-contrib/plugin-fix-point-calibration';
``` -->

## Examples

### Trial Example
The plugin now includes built-in drawing capabilities, making it extremely easy to use without writing any custom functions:

### Text Targets
```javascript
{
  type: jsPsychFixPointCalibration,
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
  type: jsPsychFixPointCalibration,
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
// Wide horizontal calibration (5 columns, 2 rows = 10 targets)
{
  type: jsPsychFixPointCalibration,
  canvas_size: [400, 1000],
  fixation_target: "+",
  target_size: 40,
  grid_rows: 2,
  grid_cols: 5
}

// Tall vertical calibration (3 columns, 6 rows = 18 targets)
{
  type: jsPsychFixPointCalibration,
  canvas_size: [600, 400],
  fixation_target: "○",
  target_size: 35,
  grid_rows: 6,
  grid_cols: 3
}
```

### Interactive vs Time-based Calibration
```javascript
// Interactive calibration (wait for user response)
{
  type: jsPsychFixPointCalibration,
  fixation_target: "E",
  target_duration: null, // Wait for user input
  grid_rows: 3,
  grid_cols: 3
}

// Time-based calibration (auto-advance)
{
  type: jsPsychFixPointCalibration,
  fixation_target: "E",
  target_duration: 1500, // Auto-advance after 1.5 seconds
  grid_rows: 3,
  grid_cols: 3
}
```

No `stimulus` parameter needed! The plugin handles everything automatically.