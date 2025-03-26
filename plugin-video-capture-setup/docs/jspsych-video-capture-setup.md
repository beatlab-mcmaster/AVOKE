# video-capture-setup plugin

This plugin is to be used alongside the [jsPsychVideoCapture extension](https://github.com/beatlab-mcmaster/AVOKE/blob/main/extension-video-capture/docs/jspsych-video-capture.md) and provides the extension with the required MediaStreamTrack parameters for video capture from any connected device. **In cases where the video input list is not populating correctly, please try to make sure this trial does not come first in the experiment timeline.**

## Using a Plugin

Please visit [this jsPsych tutorial](https://www.jspsych.org/v8/overview/plugins/) to learn the basics of setting up a jsPsych plugin. Feel free to cross-reference our [demo code](https://github.com/beatlab-mcmaster/AVOKE/blob/main/extension-video-capture/examples/index.html) to get a better idea of how to implement this plugin in a working demo experiment. You'll find further detail about parameters and data output below.

## Parameters

In addition to the [parameters available in all plugins](https://www.jspsych.org/latest/overview/plugins/#parameters-available-in-all-plugins), this plugin accepts the following parameters. Parameters with a default value of undefined must be specified. Other parameters can be left unspecified if the default value is acceptable.

| Parameter           | Type             | Default Value      | Description                              |
| ------------------- | ---------------- | ------------------ | ---------------------------------------- |
|instructions|string|` Below you'll see the output of recorded video. Please ensure that your face is clearly visible and you're in the center of the screen `|The HTML instructions that will be displayed above the capture preview.|
|error_message|string|` The camera capture cannot be retrieved. Please try another device.`|Error message to be displayed if the video stream cannot be obtained from the currently select input device.|
|button_text|string|"Continue"|Text to be displayed on the button to proceed.|

## Data Generated

In addition to the [default data collected by all plugins](https://www.jspsych.org/latest/overview/plugins/#data-collected-by-all-plugins), this plugin collects the following data for each trial.

| Name      | Type    | Value                                    |
| --------- | ------- | ---------------------------------------- |
|webcam_params|dictionary|Returns an object containing the current settings of the track, such as resolution, frame rate, and other video-related parameters.|

<!-- ## Install

Using the CDN-hosted JavaScript file:

```js
<script src="https://unpkg.com/@jspsych-contrib/plugin-video-capture-setup"></script>
```

Using the JavaScript file downloaded from a GitHub release dist archive:

```js
<script src="jspsych/plugin-video-capture-setup.js"></script>
```

Using NPM:

```
npm install @jspsych-contrib/plugin-video-capture-setup
```

```js
import {jspsychVideoCaptureSetupPlugin} from '@jspsych-contrib/plugin-video-capture-setup';
``` -->

## Examples

### Title of Example

```javascript
    const trial = {
      type: jspsychVideoCaptureSetupPlugin,
      instructions: `Below you'll see the output of recorded video. Please ensure that your face is clearly visible and you're in the center of the screen.`,
      error_message: `The camera capture cannot be retrieved. Please try another device.`,
      button_text: "Continue",
};
```