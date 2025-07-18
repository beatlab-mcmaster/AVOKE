# audio-visual-response plugin

This plugin allows for displaying an image and playing an audio file simultaneously, and records responses generated with a button click. The included parameters allow for adjustment of trial duration, visual stimuli size, time delay before the button can be interacted with and more. The trial can be set to end when a button response is received or after the audio stimulus is finished playing.

## Using a Plugin

Please visit [this jsPsych tutorial](https://www.jspsych.org/v8/overview/plugins/) to learn the basics of setting up a jsPsych plugin. Feel free to cross-reference our [demo code](https://github.com/beatlab-mcmaster/AVOKE/blob/main/plugin-audio-visual-response/examples/index.html) to get a better idea of how to implement this plugin in a working demo experiment. You'll find further detail about parameters and data output below.

## Parameters

In addition to the [parameters available in all plugins](https://www.jspsych.org/latest/overview/plugins/#parameters-available-in-all-plugins), this plugin accepts the following parameters. Parameters with a default value of undefined must be specified. Other parameters can be left unspecified if the default value is acceptable.

| Parameter           | Type             | Default Value      | Description                              |
| ------------------- | ---------------- | ------------------ | ---------------------------------------- |
|audio_stimulus|audio file|undefined|The filepath of the audio stimulus to be played.|
|image_stimulus|image file|undefined|The filepath of the visual stimulus to be displayed.|
|stimulus_height|numeric|512|Set the image height in pixels.|
|stimulus_width|numeric|512|Set the image width in pixels.|
|maintain_aspect_ratio|boolean|true|Maintain the aspect ratio if width or height are being changed.|
|choices|array of strings|undefined|Array containing the label(s) for the button(s).|
|button_html|HTML string|`'<button class="form-btn">%choice%</button>'`|The HTML for creating button. Can create own style. Use the "%choice%" string to indicate where the label from the choices parameter should be inserted. `'form-btn'` class included in CSS stylesheet.|
|button_activate_time|numeric|5000|Time delay until the button can be interacted with in milliseconds.|
|prompt|HTML string|null|Any content provided in this HTML string will be displayed below the stimulus.|
|trial_duration|numeric|null|The maximum duration the trial will wait for a response from the participant in milliseconds.|
|response_ends_trial|boolean|true|If true, the trial will end when the participant makes a response.|
|trial_ends_after_audio|boolean|false|If true, the trial will end after the audio file finishes playing.|
|response_allowed_while_playing|boolean|true|If true, then responses are allowed while the audio stimulus is playing. If false, then the audio must finish playing before a response is accepted.|
|render_on_canvas|boolean|true|If true, the image stimulus will be drawn onto a canvas element (prevents blank screen between consecutive images in some browsers). If false, the image will be shown via an img element.|
|use_date_now|boolean|false|If true, use Date.now() for timestamps; otherwise use performance.now(). Note that this does not affect the default `'rt'` and `'time_elapsed'` fields recorded by jsPsych.|
|show_slider|boolean|false|If true, show a continuous response slider above the buttons.|
|slider_prompt|string|"How confident are you?"|Text to display above the slider.|
|slider_min|numeric|0|Minimum value of the slider.|
|slider_max|numeric|100|Maximum value of the slider.|
|slider_start|numeric|50|Starting value of the slider.|
|slider_step|numeric|1|Step size of the slider.|
|slider_labels|array of strings|[]|Array of labels to display under the slider (e.g., ["Not at all", "Very much"]).|
|multi_button_response|boolean|false|Allows participants to respond with multiple buttons and responses will not end the trial.|

## Data Generated

In addition to the [default data collected by all plugins](https://www.jspsych.org/latest/overview/plugins/#data-collected-by-all-plugins), this plugin collects the following data for each trial.

| Name      | Type    | Value                                    |
| --------- | ------- | ---------------------------------------- |
|rt|numeric|The time in milliseconds, between when the trial began and when the participant clicked the button. When using an audio context, this data field is the time between when the audio has begun to when the button is pressed.|
|stimulus_audio|string|The filepath of the audio stimulus.|
|stimulus_image|string|The filepath of the image stimulus.|
|response|numeric|A number corresponding to the choices array defined in the plugin parameters.|
|imageDisplayTime|numeric|The high resolution timestamp in milliseconds (`'performance.now()'`) that the image stimuli was presented.|
|audioStartTime|numeric|The high resolution timestamp in milliseconds (`'performance.now()'`) that the audio stimuli started playing.|
|audioEndTime|numeric|The high resolution timestamp in milliseconds (`'performance.now()'`) that the audio stimuli stopped playing.|
|buttonClickTime|numeric|The high resolution timestamp in milliseconds (`'performance.now()'`) that the participant selected the button.|
|slider_value|numeric|The value of the slider input by the participant.|
|maintain_aspect_ratio|boolean|Whether or not the aspect ratio for the image is maintained.|
|stimulus_width|numeric|The width of the image stimulus.|
|stimulus_height|numeric|The height of the image stimulus.|
|trial_duration|numeric|The duration of the trial.|
|multi_button_responses|array of dictionaries|Records data respective to multiple button responses.|
|multi_button_responses:button_index|numeric|The array index of the corresponding button used to respond.|
|multi_button_responses:button_text|string|The text of the corresponding button used to respond.|
|multi_button_responses:timestamp|numeric|The timestamp of when the corresponding button was pressed.|

<!-- ## Install

Using the CDN-hosted JavaScript file:

```js
<script src="https://unpkg.com/@AVOKE/plugin-audio-visual-response"></script>
```

Using the JavaScript file downloaded from a GitHub release dist archive:

```js
<script src="AVOKE/plugin-audio-visual-response.js"></script>
```

Using NPM:

```
npm install @AVOKE/plugin-audio-visual-response
```

```js
import {jsPsychAudioVisualResponse} from '@AVOKE/plugin-audio-visual-response';
``` -->

## Examples

### Trial Example

```javascript
var trial = {
  type: jsPsychAudioVisualResponse,
  audio_stimulus: "assets/audio/example.wav", // filepath for audio stimulus
  image_stimulus: "assets/image/example.png", // filepath for image stimulus
  stimulus_height: 1080, // image height in pixels
  stimulus_width: 1920, // image width in pixels
  choices: ["Next"], // array of button choice text
  button_activate_time: 100 // time interval before button is interactable, in milliseconds
}
```

## Known Issues

**In cases where audio and image are not working as intended, please try to use the [jsPsych Preload](https://www.jspsych.org/latest/plugins/preload/) trial and make sure the audio-visual-response trial is not the first trial in the experiment timeline.**