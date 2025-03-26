# fix-point-calibration plugin

This plugin implements a fix-point calibration trial used for eyetracking experiments. A target ('E' by default) appears in random locations on a blank canvas based on whether the canvas is split into a 3x3 or 4x4 grid. The target will appear in random orientations of 0, 90, 180, and 270 degrees. The participant must look at the target and respond with an arrow key by default, with the correct direction corresponding to where to lines of the 'E' are headed. After a correct response, a new target will appear. If using a 3x3 grid, 9 targets will be presented. If using a 4x4 grid, 16 targets will be presented.

## Parameters

In addition to the [parameters available in all plugins](https://www.jspsych.org/latest/overview/plugins/#parameters-available-in-all-plugins), this plugin accepts the following parameters. Parameters with a default value of undefined must be specified. Other parameters can be left unspecified if the default value is acceptable.

| Parameter           | Type             | Default Value      | Description                              |
| ------------------- | ---------------- | ------------------ | ---------------------------------------- |
|stimulus|function|undefined|The drawing function to apply to the canvas. Should take the canvas object as argument.|
|choices|array of keyboard buttons|["ArrowDown", "ArrowUp", "ArrowRight", "ArrowLeft"]|Array containing the key(s) that the subject is allowed to press to respond to the stimulus.|
|fixation_target|string|"E"|The string that will be displayed as the target.|
|target_size|numeric|41|The size of the fixation target, in pixels.|
|grid_4x4|boolean|true|Choose between 3x3 and 4x4 grid size. If using a 3x3 grid, 9 targets will be presented. If using a 4x4 grid, 16 targets will be presented.|
|canvas_size|array of numbers|[166, 296]|Array containing the height (first value) and width (second value) of the canvas element, in pixels.|

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

```javascript
  // drawing function to be used in the calibration trial, draws the target 'E' on the canvas
  function drawE(c, target, location, text_size, degree = 0) {
    let ctx = c.getContext("2d");
    ctx.clearRect(0, 0, c.width, c.height)
    ctx.save()
    ctx.translate(location[0], location[1]);
    ctx.rotate((degree * Math.PI) / 180)
    ctx.translate(-location[0], -location[1]);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = text_size + "px Arial";
    ctx.fillText(target, location[0], location[1]);
    ctx.restore()
  };

  var trial = {
    type: jsPsychFixPointCalibration,
    stimulus: drawE, // reference to the drawing function
    canvas_size: [window.innerHeight - 120, window.innerWidth - 120], // size of the canvas with 120px margin
  };

```