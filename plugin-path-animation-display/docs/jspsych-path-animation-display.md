# path-animation-display plugin

This plugin presents an image target that moves along a path with a shape and pace determined by the experimenter. The target will begin moving after a keypress and the trial will end when the target finishes travelling along the path.

## Using a Plugin

Please visit [this jsPsych tutorial](https://www.jspsych.org/v8/overview/plugins/) to learn the basics of setting up a jsPsych plugin. Feel free to cross-reference our [demo code](https://github.com/beatlab-mcmaster/AVOKE/blob/main/plugin-path-animation-display/examples/index.html) to get a better idea of how to implement this plugin in a working demo experiment. You'll find further detail about parameters and data output below.

## Parameters

In addition to the [parameters available in all plugins](https://www.jspsych.org/latest/overview/plugins/#parameters-available-in-all-plugins), this plugin accepts the following parameters. Parameters with a default value of undefined must be specified. Other parameters can be left unspecified if the default value is acceptable.

| Parameter           | Type             | Default Value      | Description                              |
| ------------------- | ---------------- | ------------------ | ---------------------------------------- |
|stimulus|image file|undefined|Filepath to image used as target.|
|stimulus_height|numeric|40|Set the image height in pixels.|
|stimulus_width|numeric|40|Set the image width in pixels.|
|starting_location|array of numbers|[0,0]|Set the starting location for the target.|
|repetitions|numeric|1|Set the number of repetitions for the animation to play.|
|path_shape|string|"rectangle"|Set the desired path shape for the target to travel, currently supporting "rectangle" or "line".|
|path_breadth|numeric|800|Height/breadth of the rectangular path in pixels (only used for rectangle path).|
|path_length|numeric|600|Length/width of the path in pixels.|
|path_slope|numeric|0|Slope of the line in degrees. Only used if path_shape is 'line'.|
|clockwise|boolean|true|Whether to move the target clockwise or anti-clockwise around the path.|
|animation_duration|numeric|1000|Set the time it takes for the trial to complete the path.|
|choices|array of strings|"ALL_KEYS"|Array containing the key(s) the subject is allowed to press to begin the trial animation.|
|save_presentation_locations|boolean|false|Whether to store timestamps and locations of each target presentation.|
|disable_cursor|boolean|true|Whether to display cursor on the screen or not.|
|custom_path_function|function|null|Optional custom function for path coordinates. Should accept (progress, trial) and return [x, y].|

## Data Generated

In addition to the [default data collected by all plugins](https://www.jspsych.org/latest/overview/plugins/#data-collected-by-all-plugins), this plugin collects the following data for each trial.

| Name      | Type    | Value                                    |
| --------- | ------- | ---------------------------------------- |
|response|dictionary|Contains the key pressed and response time of the participant.|
|response:key|string|The key that the participant pressed to start the trial.|
|response:rt|numeric|The time between the beginning of the trial and the response in milliseconds.|
|target_presentation_time|array of dictionaries or "NA"|Contains a variety of information about the presentation of the target if save_presentation_locations is true, otherwise "NA". Specific details on each key-value pair is provided below.|
|target_presentation_time:repetition|numeric|The number of repetitions of the path that have been done so far.|
|target_presentation_time:repetition_start_time|numeric|The timestamp in milliseconds when the repetition has been started.|
|target_presentation_time:repetition_elapsed_time|numeric|The time in milliseconds from since the repetition has begun.|
|target_presentation_time:ratio|numeric|This ratio represents how much of the path the target has progressed through so far.|
|target_presentation_time:loc|array of numbers|The coordinates of the target on its path based on the ratio value.|
|path_shape|string|The path shape that the target takes.|
|repetitions_set|numeric|The number of repetitions that were set for the animation.|
|path_length|numeric|The length/width parameter used for the target's path in pixels.|
|path_breadth|numeric|The breadth/height parameter used for the target's path in pixels.|
|animation_duration|numeric|The time length that the target takes to complete its path.|
|start_time|numeric|A high resolution timestamp of when the animation begins in milliseconds, obtained via `performance.now()`.|
|end_time|numeric|A high resolution timestamp of when the animation ends in milliseconds, obtained via `performance.now()`.|

<!-- ## Install

Using the CDN-hosted JavaScript file:

```js
<script src="https://unpkg.com/@jspsych-contrib/plugin-tapath-animation-display"></script>
```

Using the JavaScript file downloaded from a GitHub release dist archive:

```js
<script src="jspsych/plugin-tapath-animation-display.js"></script>
```

Using NPM:

```
npm install @jspsych-contrib/plugin-tapath-animation-display
```

```js
import {jsPsychPathAnimationDisplay} from '@jspsych-contrib/plugin-tapath-animation-display';
``` -->

## Examples

### Trial Example

```javascript
  const trial_rect = {
    type: jsPsychPathAnimationDisplay,
    stimulus: 'SP_target.png', // The path to the target image file
    animation_duration: 5000, // The duration of the animation in milliseconds
    stimulus_width: 40, // The width of the target image in pixels
    stimulus_height: 40, // The height of the target image in pixels
    path_breadth: window.innerHeight - 40, // The height of the path in pixels, with a 40px margin accounting for target size
    path_length: window.innerWidth - 40,  // The width of the path in pixels, with a 40px margin accounting for target size
    repetitions: 1, // The number of times the target will move along the path
    starting_location:[0,0], // The starting location of the target
    clockwise: false, // Whether the target moves clockwise along the path
  };
  timeline.push(trial_rect)

  const trial_line = {
    type: jsPsychPathAnimationDisplay,
    stimulus: 'SP_target.png', // The path to the target image file
    animation_duration: 5000, // The duration of the animation in milliseconds
    stimulus_width: 40, // The width of the target image in pixels
    stimulus_height: 40, // The height of the target image in pixels
    path_shape: "line", // The shape of the path
    path_slope: 0, // The slope of the line in degrees
    path_length: window.innerWidth, // The length of the path in pixels
    repetitions: 2, // The number of times the target will move along the path
    starting_location:[window.innerWidth/2 - 40, window.innerHeight/2 - 40],  // The starting location of the target
    save_presentation_locations: true // Whether to save presentation locations
  };
```