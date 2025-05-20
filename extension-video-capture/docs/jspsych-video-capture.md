# video-capture extension

This extension allows for video recording in jsPsych experiments, particularly designed for webcam eye-tracking. Video files are output in .mp4 format.

## Using an Extension
To use this extension, you'll load the [index.js](https://github.com/beatlab-mcmaster/AVOKE/blob/main/extension-video-capture/src/index.js) file via a `<script>` tag (just like adding a plugin) and then initialize the extension in the parameters of initJsPsych().

```
<head>
  <script src="https://unpkg.com/jspsych@8.0.0"></script>
  <script src="index.js"></script>
</head>
```
```
initJsPsych({
  extensions: [
    { type: jsPsychVideoCapture, params: {...} }
  ]
})
```
Then, to enable the extension for a trial, add the `extensions` list for the trial, as well as any parameters.
```
    const trial = {
      extensions: [{ type: jsPsychVideoCapture, params:{'filename': 'demo'} }, // extension with the filename parameter
      ],
    };
```
Read through [this code](https://github.com/beatlab-mcmaster/AVOKE/blob/main/extension-video-capture/examples/index.html) for a better understanding of how to set up your experiment.

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
download_local_only|boolean|true|Whether or not the resulting video should be locally downloaded.
video_width|numeric|640|The width of the video capture in pixels.
video_height|numeric|480|The height of the video capture in pixels.
framerate|numeric|26|The frames per second of the video capture.

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
using_setup_plugin|boolean|false|Whether or not the setup plugin is being used alongside this extension.
default_camera_options|boolean|false|Whether or not the default camera options should be used, or if it should detect the options of the video input device.
jatos|boolean|null|Whether or not JATOS is being used with this extension.
download_local_only|boolean|true|Whether or not the video file should be downloaded locally afterwards.
video_width|numeric|640|The default frame width of the camera.
video_height|numeric|480|The default frame height of the camera.
framerate|numeric|26|The frames per second of the video input device.

## Data Generated

Name | Type | Value
-----|------|------
videoFile|video file (.mp4)|The .mp4 file of the recorded video.
webcamRecordStart|numeric|The timestamp (`performance.now()`) in milliseconds of when the recording started.
webcamRecordStop|numeric|The timestamp (`performance.now()`) in milliseconds of when the recording ended.

## Functions

If the extension adds any static functions, list them here.

### downloadLocalVideo(fname, blob)
Downloads the video locally after the experiment is completed.

### handleRecording(fname, blob)
If using a JATOS instance, handles the upload of the video file.

### processVideoChunks(data, filename, timestamp)
Process the video chunks for local download, if needed.

### init_mediaRecorder()
Initializes the MediaRecorder object, handles the data collection during recording, and processes the recorded video once the recording is complete.

### search_webcam_devices
Checks through all the media devices connected to the device, and adds it to the drop-down menu if it is a video input device.

## Known Issues
**In cases where the video input list is not populating correctly, please make sure this trial does not come first in the experiment timeline.** The media device list will not be able to update early enough to note down all connected capture devices and populate the drop-down menu.