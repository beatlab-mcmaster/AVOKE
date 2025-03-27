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
            this.downloadLocalOnly;
            this.videoChunks_timeslice = null;
            this.videoChunks_timestamps = []
            this.jsPsych = jsPsych;
            this.constraintObj;
        }

        downloadLocalVideo(fname, blob) {
            // Create a Blob URL for the video chunk
            const videoUrl = URL.createObjectURL(blob);
            
            const a = document.createElement("a");
            a.href = videoUrl;
            a.download = fname + '.mp4';

            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            
            // Revoke the URL after some time to free up memory
            setTimeout(() => URL.revokeObjectURL(videoUrl), 1000);
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
                // this.downloadLocalVideo(fname, blob);
                console.error("JATOS not initialized, please specify an action for recorded video files")
            }
        }

        processVideoChunks(data, filename, timestamp) {
            let blob = new Blob([data], { 'type': 'video/mp4;' });
            if (this.downloadLocalOnly){
                this.downloadLocalVideo(filename+"_"+timestamp, blob)
            } else {
                this.handleRecording(filename+"_"+timestamp, blob);
            }
        }
  
        init_mediaRecorder(filename) {
            console.log("WEBCAM: initializing mediaRecorder")
            this.mediaRecorder = new MediaRecorder(this.streamObj, this.constraintObj);
            this.mediaRecorder.ondataavailable = (ev) => {
                let now = Date.now()
                console.log("WEBCAM: processing ", filename, now)
                this.processVideoChunks(ev.data, filename, now);
                if (this.videoChunks_timeslice != null){
                    this.videoChunks_timestamps.push(now);
                } 
            }
        }

        search_webcam_devices(){           
            // Check if mediaDevices.getUserMedia is available, and if not, polyfill it
            if (navigator.mediaDevices === undefined || !navigator.mediaDevices.getUserMedia) {
                console.log("WEBCAM: getUserMedia is not supported on browser ")
                alert(`Unfortunately, your browser is not supported. Please update or try on a different web browser.`);
                this.jsPsych.endExperiment(false, "WEBCAM: getUserMedia is not supported. ");
            } else {
                let counter = 0;
                navigator.mediaDevices.enumerateDevices()
                    .then((devices) => {
                        devices.forEach(device => {
                            if (device.kind === "videoinput") { // add a select to the camera dropdown list
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
        }
    
        //Called when an instance of jsPsych is first initialized (Once per experiment)
        initialize(params = { "using_setup_plugin": false, "default_camera_options": false, "jatos": null, "download_local_only": true , "video_width": 640, "video_height": 480, "framerate": 26}) {
            
            this.jatosInstance = params.jatos;
            this.downloadLocalOnly = params.download_local_only
            if (params.timeslice){
                this.videoChunks_timeslice = params.timeslice;
            }

            this.constraintObj = {
                audio: false,
                video: {
                    facingMode: "user", 
                    deviceId: 0, //should be updated in webcam-setup-plugin
                    width: { min: params.video_width }, //can also be less flexible exact: 640, ideal: cameraW, max: 1920
                    height: { min: params.video_height },
                    frameRate: { min: 26 }
                }
            };

            this.search_webcam_devices();
            this.initialized = true;
            console.log("Initialized webcam extension")
            return Promise.resolve();
        }
  
        //Called at the start of the plugin execution, prior to calling plugin.trial
        on_start(params) {
            if (!params.setup){
                console.log("WEBCAM: video file will be stored with the name", params.filename)
            }
        }
  
        //where extension can begin actively interacting with the DOM and recording data
        on_load(params) {
            if (!params.setup){
                if (this.streamObj){
                    let now = Date.now();
                    this.init_mediaRecorder(params.filename);
                    //Timestamp and start video recording; on_load starts video recording after a few ms of loading the trial
                    this.recordingStartTime = now;
                    if (this.videoChunks_timeslice != null){
                        this.mediaRecorder.start(this.videoChunks_timeslice); //set timeslice in ms to fire ondataavailable
                    } else {
                        this.mediaRecorder.start();
                    }
                    
                    console.log("WEBCAM: started recording ", this.recordingStartTime);
                } else { //
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
        }

        on_finish(params) {
            if (!params.setup){
                this.recordingStopTime = Date.now()
                this.mediaRecorder.stop();
                console.log("WEBCAM: stopping recording", this.recordingStopTime);

                let extensionData = {
                    videoFile: `${params.filename}.mp4`,
                    webcamRecordStart: this.recordingStartTime,
                    webcamRecordStop: this.recordingStopTime,
                }
                if (this.videoChunks_timeslice != null){
                    extensionData.videoChunks_timestamps = this.videoChunks_timestamps
                }
                return extensionData
            }else {
                return {"webcam setup": true}
            }
        }
    }
  
    VideoCaptureExtension.info = {
        name: "webcamRecord",
    };
  
    return VideoCaptureExtension;
  })(jsPsychModule);