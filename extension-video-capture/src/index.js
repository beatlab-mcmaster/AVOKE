var jsPsychVideoCapture = (function(jspsych) {
    "use strict";
  
    /**
     * **video-capture**
     *
     * Extension to record webcam video in JsPsych experiments
     *
     * @author Shreshth Saxena, Jackson Shi
     * @see {@link {https://github.com/beatlab-mcmaster/AVOKE/blob/main/extension-video-capture/docs/jspsych-video-capture.md}
     */
    class VideoCaptureExtension {
        constructor(jsPsych) {
            this.initialized = false;
            this.mediaRecorder;
            this.deviceIds = [];
            this.deviceNames = [];
            this.jatosInstance;
            this.videoChunks_timestamps = []
            this.jsPsych = jsPsych;

            this.constraintObj = {
                audio: false,
                video: {
                    facingMode: "user", 
                    deviceId: 0, //should be updated in webcam-setup-plugin
                    width: { min: 620 }, //can also be less flexible exact: 640, ideal: cameraW, max: 1920
                    height: { min: 480 },
                    frameRate: { min: 26 }
                }
            };
        }
  
        handleRecording(fname, blob) {
            fname = fname+'.mp4';

            if (this.jatosInstance) {
                console.log(`WEBCAM: uploading ${fname}`)
                this.jatosInstance.uploadResultFile(blob, fname)
                    .done(() => { console.log("WEBCAM: video upload successful ", fname) })
                    .fail(() => {
                        console.log("WEBCAM: video upload failed", fname);
                    })
                    .catch((error) => { 
                        console.log("WEBCAM: video upload error", error);
                    })
            } else {
                console.log("WEBCAM: JatosInstance not initialized");
                
                //TODO UPLOADVIDEOCHUNKS
                this.jsPsych.endExperiment("WEBCAM: JatosInstance not initialized", {error_data: "WEBCAM: JatosInstance not initialized"});
            }
        }

        //Called when an instance of jsPsych is first initialized (Once per experiment)
        async initialize(params = { "using_setup_plugin": false, "default_camera_options": false, "jatos": null, timeslice: 10000 }) {
  
            /* Search available devices */
            let counter = 0;
            this.jatosInstance = params.jatos;
            // Check if mediaDevices.getUserMedia is available, and if not, polyfill it
            if (navigator.mediaDevices === undefined || !navigator.mediaDevices.getUserMedia) {
                console.log("WEBCAM: getUserMedia is not supported on browser ")
                alert(`Unfortunately, your browser is not supported. Please update or try on a different web browser.`);
                this.jsPsych.endExperiment(false, "WEBCAM: getUserMedia is not supported. ");
            } else {
                navigator.mediaDevices.enumerateDevices()
                    .then(devices => {
                        devices.forEach(device => {
                            if (device.kind === "videoinput" && device.deviceId !== "") { // add a select to the camera dropdown list
                                this.deviceIds[counter] = (device.deviceId);
                                this.deviceNames[counter] = (device.label);
                                counter++;
                            }
                        })
                    })
                    .catch(err => {
                        console.log(err.name, err.message);
                    })
            }
            
            this.initialized = true;
            console.log("Initialized webcam extension")
            return Promise.resolve();
        }

        uploadVideoChunks(data, filename, timestamp) {
            let blob = new Blob([data], { 'type': 'video/mp4;' });
            this.handleRecording(filename+"_"+timestamp, blob);
        }
  
        init_mediaRecorder(filename) {
            this.mediaRecorder = new MediaRecorder(this.streamObj, this.constraintObj);
            this.mediaRecorder.ondataavailable = (ev) => {
                let now = Date.now()
                console.log("WEBCAM: starting upload for ", filename, now)
                this.uploadVideoChunks(ev.data, filename, now); //send each chunk of data (~30 seconds)\
                this.videoChunks_timestamps.push(now);
            }
        }
  
        //Called at the start of the plugin execution, prior to calling plugin.trial
        on_start(params) {
            console.log("WEBCAM: setup for trial", params.filename)
        }
  
        //where extension can begin actively interacting with the DOM and recording data
        on_load(params) {
            if (this.streamObj){
                let now = Date.now()
                this.init_mediaRecorder(params.filename);
                //Timestamp and start video recording; on_load starts video recording after a few ms of loading the trial
                this.recordingStartTime = now;
                this.mediaRecorder.start(params.timeslice); //set timeslice in ms to fire ondataavailable
                console.log("WEBCAM: starting recording", this.recordingStartTime);
            } else {
                try{
                    navigator.mediaDevices.getUserMedia(this.constraintObj)
                    .then((stream) => this.streamObj=stream);
                } catch(e) {
                    console.log("WEBCAM: streamObj was not initialized, creating new object with default perimeters. Check for validity! "+e)
                    alert(`Unfortunately, we're not able to initiaize your camera stream.`);
                    this.jsPsych.endExperiment("WEBCAM: Webcam streamObj couldn't be initialized.", {error_data: "WEBCAM: Webcam streamObj couldn't be initialized."});
                }
            }
        }

        on_finish(params) {
            this.recordingStopTime = Date.now()
            this.mediaRecorder.stop();
            console.log("WEBCAM: stopping recording", this.recordingStopTime)

            return ({
                videoFile: `${params.filename}.mp4`,
                webcamRecordStart: this.recordingStartTime,
                webcamRecordStop: this.recordingStopTime,
                videoChunks_timestamps: this.videoChunks_timestamps
            })
  
        }
  
    }
  
    VideoCaptureExtension.info = {
        name: "webcamRecord",
    };
  
    return VideoCaptureExtension;
  })(jsPsychModule);