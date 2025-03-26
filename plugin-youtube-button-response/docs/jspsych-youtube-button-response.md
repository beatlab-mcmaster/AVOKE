# youtube-button-response plugin

This plugin is for displaying a YouTube stream or video and records responses generated with a button click.

## Requirements

This plugin uses functions from the YouTube IFrame Player API. The script `'<script src="https://www.youtube.com/iframe_api"></script>'` must be run within the experiment file for plugin functionality. Further documentation is provided [here](https://developers.google.com/youtube/iframe_api_reference#Getting_Started).

## Using a Plugin

Please visit [this jsPsych tutorial](https://www.jspsych.org/v8/overview/plugins/) to learn the basics of setting up a jsPsych plugin. Feel free to cross-reference our [demo code](https://github.com/beatlab-mcmaster/AVOKE/blob/main/plugin-youtube-button-response/examples/index.html) to get a better idea of how to implement this plugin in a working demo experiment. You'll find further detail about parameters and data output below.

## Parameters

In addition to the [parameters available in all plugins](https://www.jspsych.org/latest/overview/plugins/#parameters-available-in-all-plugins), this plugin accepts the following parameters. Parameters with a default value of undefined must be specified. Other parameters can be left unspecified if the default value is acceptable.

| Parameter           | Type             | Default Value      | Description                              |
| ------------------- | ---------------- | ------------------ | ---------------------------------------- |
|stimulus|HTML string|undefined|YouTube link for the livestream/video to be displayed. The easiest way to obtain this is to click Share for any YouTube video, select Embed and from the box that appears, copy only the src for the embed link, which you can then paste into your experiment.|
|choices|array of strings|undefined|Array containing the label(s) for the button(s).|
|button_html|HTML string|`'<button class="form-btn">%choice%</button>'`|The HTML for creating button. Can create own style. Use the "%choice%" string to indicate where the label from the choices parameter should be inserted. `'form-btn'` class included in CSS stylesheet.|
|prompt|HTML string|null|Any content provided in this HTML string will be displayed below the stimulus.|
|stimulus_duration|numeric|null|How long the stimulus should be shown in milliseconds.|
|button_disable_time|numeric|null|The trial displays the next button after desired time in milliseconds.|
|trial_duration|numeric|null|The trial ends after a set duration in milliseconds.|
|response_ends_trial|boolean|true|If true, then trial will end when the participant clicks a button.|
|log_after_every|numeric|5|Set time intervals for logging YouTube player state.
|controls|boolean|true|If true, the YouTube player controls will be enabled.|
|autoplay|boolean|true|If true, the YouTube video will autoplay, to enable this on some browsers, the following `'mute'` parameter must also be true.|
|mute|boolean|true|If true, the YouTube video will be muted.|
|pointer_events|boolean|true|If true, pointer events will be enabled for the iframe.|
|background_colour|string|"#111"|Hexcode for trial background colour.|

## Data Generated

In addition to the [default data collected by all plugins](https://www.jspsych.org/latest/overview/plugins/#data-collected-by-all-plugins), this plugin collects the following data for each trial.

| Name      | Type    | Value                                    |
| --------- | ------- | ---------------------------------------- |
|rt|numeric|The time in milliseconds, between when the trial began and when the participant clicked the button.|
|playerTimestamps|array of dictionaries|Records every change in the state (playing, paused, buffering, etc.) of the YouTube player, with a timestamp created via `'Date.now()'`.|
|playerInfo|array of dictionaries|Records YouTube player state every interval of seconds set by `'log_after_every'` with video timestamps, the current time on the client machine using `'Date.now()'`, the current playback time of the video stream, whether the player is at the live head of the stream, and the total duration of the video stream.|
|buttonResponse|array of button data| Records data about the button described in all following entries.|
|buttonResponse:condition|string|Depending on the values of the `'user_server_signal'`, `'button_disable_time'`, `'trial_duration'`, and `'response_ends_trial'` parameters, this string will contain which of the aforementioned parameters were used during the trial.|
|buttonResponse:button|numeric|The array index corresponding to which value in the `'choices'` parameter the participant selected.|
|buttonResponse:button_press_time|numeric|The time that the button was pressed, determined via `'Date.now()'`.|

<!-- ## Install

Using the CDN-hosted JavaScript file:

```js
<script src="https://unpkg.com/@jspsych-contrib/plugin-youtube-button-response"></script>
```

Using the JavaScript file downloaded from a GitHub release dist archive:

```js
<script src="jspsych/plugin-youtube-button-response.js"></script>
```

Using NPM:

```
npm install @jspsych-contrib/plugin-youtube-button-response
```

```js
import {jsPsychYouTubeButtonResponse} from '@jspsych-contrib/plugin-youtube-button-response';
``` -->

## Examples

### Trial Example

```javascript
  const trial = {
    type: jsPsychYouTubeButtonResponse,
    stimulus: 'https://www.youtube.com/embed/jfKfPfyJRdk', // Example YouTube video URL
    choices: ['Next'], // Button text
    prompt: '<p>Click next to proceed</p>', // Prompt text
    controls: true, // Enable YouTube player controls
    autoplay: true, // Enable autoplay
    pointer_events: true, // Enable pointer events
    background_colour: '#808080' // Set the background colour to black
  };
```

## Known Issues

Our plugin utilizes an embedded YouTube iframe to display video content. **Please be aware that if the source stream or video on YouTube has ads enabled, they may appear during playback.** Unfortunately, there is no way to prevent these ads from being shown through the plugin itself.

If you have control over the source stream or video, **we recommend disabling ads to ensure a seamless experience for your users or participants**.