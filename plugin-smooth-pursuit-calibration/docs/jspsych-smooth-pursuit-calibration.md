# smooth-pursuit-calibration plugin

This plugin presents an image target that moves along a path with a shape and pace determined by the experimenter. The target will begin moving after a keypress and the trial will end when the target finishes travelling along the path.

## Using a Plugin

Please visit [this jsPsych tutorial](https://www.jspsych.org/v8/overview/plugins/) to learn the basics of setting up a jsPsych plugin. Feel free to cross-reference our [demo code](https://github.com/beatlab-mcmaster/AVOKE/blob/main/plugin-smooth-pursuit-calibration/examples/index.html) to get a better idea of how to implement this plugin in a working demo experiment. You'll find further detail about parameters and data output below.

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
|maintain_aspect_ratio|boolean|true|Maintain the aspect ratio of the image after setting width or height.|
|animation_duration|numeric|1000|Set the time it takes for the trial to complete the rectangular path.|
|choices|array of strings|"ALL_KEYS"|Array containing the key(s) the subject is allowed to press to begin the trial animation.|
|path_height|numeric|800|Height of the rectangular path in pixels.|
|path_width|numeric|600|Width of the rectangular path in pixels.|

## Data Generated

In addition to the [default data collected by all plugins](https://www.jspsych.org/latest/overview/plugins/#data-collected-by-all-plugins), this plugin collects the following data for each trial.

| Name      | Type    | Value                                    |
| --------- | ------- | ---------------------------------------- |
|response|dictionary|Contains the key pressed and response time of the participant.|
|response:key|string|The key that the participant pressed to start the trial.|
|response:rt|numeric|The time between the beginning of the trial and the response in milliseconds. '|
|target_presentation_time|dictionary|Contains a variety of information about the presentation of the target. Specific details on each key-value pair is provided below.|
|target_presentation_time:repetition|numeric|The number of repetitions of the path that have been done so far.
|target_presentation_time:repetition_start_time|The timestamp in milliseconds when the repetition has been started.|
|target_presentation_time:repetition_elapsed_time|The time in milliseconds from since the repetition has begun.|
|target_presentation_time:ratio|numeric|This ratio represents how much of the path the target has progressed through so far.|
|target_presentation_time:loc|array of numbers|The coordinates of the target on its path based on the ratio value.|
|start_time|numeric|A high resolution timestamp of the when the animation begins in milliseconds, obtained via `'performance.now()'`.| 

<!-- ## Install

Using the CDN-hosted JavaScript file:

```js
<script src="https://unpkg.com/@jspsych-contrib/plugin-smooth-pursuit-calibration"></script>
```

Using the JavaScript file downloaded from a GitHub release dist archive:

```js
<script src="jspsych/plugin-smooth-pursuit-calibration.js"></script>
```

Using NPM:

```
npm install @jspsych-contrib/plugin-smooth-pursuit-calibration
```

```js
import {jsPsychSmoothPursuitCalibration} from '@jspsych-contrib/plugin-smooth-pursuit-calibration';
``` -->

## Examples

### Trial Example

```javascript
  const trial_rect = {
    type: jsPsychSmoothPursuitCalibration,
    stimulus: 'SP_target.png', // The path to the target image file
    animation_duration: 10000, // The duration of the animation in milliseconds
    stimulus_width: 40, // The width of the target image in pixels
    stimulus_height: 40, // The height of the target image in pixels
    path_height: window.innerHeight - 40, // The height of the path in pixels, with a 40px margin accounting for target size
    path_width: window.innerWidth - 40,  // The width of the path in pixels, with a 40px margin accounting for target size
    repetitions: 2, // The number of times the target will move along the path
    starting_location:[0,0] // The starting location of the target
  };

  const trial_line = {
    type: jsPsychSmoothPursuitCalibration,
    stimulus: 'SP_target.png', // The path to the target image file
    animation_duration: 10000, // The duration of the animation in milliseconds
    path_shape: "line", // The shape of the path
    path_height: 0, // The height of the path in pixels
    path_width: 1400, // The width of the path in pixels
    repetitions: 5, // The number of times the target will move along the path
    starting_location:[window.innerWidth/2, window.innerHeight/2],  // The starting location of the target
  };
```