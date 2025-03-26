# video-capture extension

This extension allows for video recording in jsPsych experiments, particularly designed for webcam eye-tracking. Video files are output in .mp4 format. **In cases where the video input list is not populating correctly, please make sure this trial does not come first in the experiment timeline.** 

## Parameters

### Initialization Parameters

Initialization parameters can be set when calling `initJsPsych()`

```js
initJsPsych({
  extensions: [{
    type: jsPsychVideoCapture,
    params: {
        "using_setup_plugin": true,
        "default_camera_options": true,
    }
}]
})
```

Parameter | Type | Default Value | Description
----------|------|---------------|------------
using_setup_plugin|boolean|false|If using this extension with the [video-capture-setup plugin](https://github.com/beatlab-mcmaster/AVOKE/blob/main/plugin-video-capture-setup/docs/jspsych-video-capture-setup.md), then true.
default_camera_options|boolean|false|If using default camera parameters, then true.
jatos|boolean|null|If used in a JATOS experiment, then true. 

### Trial Parameters

Trial parameters can be set when adding the extension to a trial object.

```js
var trial = {
  type: jsPsych...,
   extensions: [{ type: jsPsychVideoCapture, params:{'filename': 'example'} }, // extension with the filename parameter
      ],
}
```

Parameter | Type | Default Value | Description
----------|------|---------------|------------
filename|string|""|The name of the output video file.

## Data Generated

Name | Type | Value
-----|------|------
videoFile|video file (.mp4)|The .mp4 file of the recorded video.
webcamRecordStart|numeric|The timestamp (`performance.now()`) in milliseconds of when the recording started.
webcamRecordStop|numeric|The timestamp (`performance.now()`) in milliseconds of when the recording ended.

## Functions

If the extension adds any static functions, list them here.

### handleRecording(fname, blob)
If using a JATOS instance, handles the upload of the video file.

### init_mediaRecorder()
Initializes the MediaRecorder object, handles the data collection during recording, and processes the recorded video once the recording is complete.

