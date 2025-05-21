var jspsychVideoCaptureSetupPlugin = (function (jspsych) {
    "use strict";

    const info = {
        name: "video-capture-setup",
        parameters: {
            /** The HTML instructions to be displayed */
            instructions: {
                type: jspsych.ParameterType.HTML_STRING,
                pretty_name: "Instructions",
                default: ` Below you'll see the output of recorded video. Please ensure that your face is clearly visible and you're in the center of the screen `,
            },

            /*Error message to be displayed if webcam stream is faulty*/
            error_message: {
                type: jspsych.ParameterType.STRING,
                pretty_name: "Error Message",
                default: ` The camera capture cannot be retrieved. Please try another device.`,
            },

            /*Text to display on the button*/
            button_text: {
                type: jspsych.ParameterType.STRING,
                pretty_name: "Button Text",
                default: "Continue",
            },

        },
    };

    /**
     * **video-capture-setup**
     *
     * Use this plugin to setup video recording parameters for the jsPsychVideoCapture extension
     *
     * @author Shreshth Saxena, Jackson Shi
     * @see {@link {https://github.com/beatlab-mcmaster/AVOKE/blob/main/plugin-video-capture-setup/docs/jspsych-video-capture-setup.md}}
     */

    class VideoCaptureSetupPlugin {
        constructor(jsPsych) {
            this.jsPsych = jsPsych;
            this.webcamRecord = jsPsych.extensions.webcamRecord
        }

        trial(display_element, trial) {

            if (this.webcamRecord.initialized) {
                var webcam_devices = this.webcamRecord.deviceIds
                const virtual_window_container = document.createElement("div");
                virtual_window_container.align = "left";
                var instructions = trial.instructions;
                if (webcam_devices.length > 0) {
                    const multi_dev_instruction = `<p><b>Note:</b> If you have multiple webcams connected to your laptop, please select the integrated webcam device from the dropdown list below.</p>`
                    instructions = instructions.concat('', multi_dev_instruction)
                }
                virtual_window_container.innerHTML = instructions;

                //div for webcam select and video preview 
                const flex_center = document.createElement("div");
                flex_center.style.display = "flex";
                flex_center.style.justifyContent = "center";
                flex_center.style.position = "relative";
                flex_center.innerHTML = `
                <center><p id="error-message" style="display: flex; color: red; padding: 0; margin: 0;">Loading webcam stream, please wait...</p>
                <video id="webcam-video"></video></center>
                `
                virtual_window_container.appendChild(flex_center)
                display_element.appendChild(virtual_window_container)

                // update UI elements
                var video = document.getElementById("webcam-video")
                var errorMessage = document.getElementById("error-message")
                video.onloadedmetadata = function (ev) {
                    video.play();
                }

                // CHOOSE DEVICE
                console.log("available devices:", webcam_devices)
                if (webcam_devices.length > 0) {
                    var sel = document.createElement("select");
                    for (let i = 0; i < webcam_devices.length; i++) {
                        const option = document.createElement('option');
                        option.value = webcam_devices[i];
                        // option.text = webcam_devices.deviceNames[i];
                        option.text = "device_" + i; //// in case the deviceNames are weird
                        sel.appendChild(option, null)

                        //update stream if another device is selected
                        sel.addEventListener('change', (event) => {
                            this.webcamRecord.constraintObj.video.deviceId = event.target.value;
                            navigator.mediaDevices.getUserMedia(this.webcamRecord.constraintObj)
                                .then((stream) => {
                                    this.webcamRecord.streamObj = stream;
                                    video.style.visibility = "visible";
                                    errorMessage.style.visibility = "hidden";
                                    if ("srcObject" in video) {
                                        video.srcObject = this.webcamRecord.streamObj;
                                    } else { video.src = window.URL.createObjectURL(this.webcamRecord.streamObj) }; //old version
                                })
                                .catch((err) => {
                                    errorMessage.style.visibility = "visible";
                                    video.style.visibility = "hidden";
                                });
                        })
                    }
                    virtual_window_container.appendChild(sel);
                }


                //show output from first option
                this.webcamRecord.constraintObj.video.deviceId = webcam_devices[0];
                navigator.mediaDevices.getUserMedia(this.webcamRecord.constraintObj)
                    .then((stream) => {
                        this.webcamRecord.streamObj = stream
                        video.style.visibility = "visible";
                        errorMessage.style.visibility = "hidden";
                        if ("srcObject" in video) {
                            video.srcObject = this.webcamRecord.streamObj;
                        } else { video.src = window.URL.createObjectURL(this.webcamRecord.streamObj) }; //old version
                    })
                    .catch((err) => {
                        errorMessage.style.visibility = "visible";
                        video.style.visibility = "hidden";
                    })
                    .finally(() => errorMessage.textContent = trial.error_message);

                const verify_btn = document.createElement("button"); //create a button
                flex_center.appendChild(verify_btn); //append it to the div element
                verify_btn.style.position = "absolute"; //position the button to bottom-right of the div
                verify_btn.style.bottom = "10px";
                verify_btn.style.right = "10px";
                verify_btn.innerHTML = trial.button_text;
                //add event listener to the button to verify the selected camera stream
                verify_btn.addEventListener("click", (e) => {
                    if (errorMessage.style.visibility === "visible") {
                        console.log("ending experiment since stream couldn't be fetched")
                        end_experiment()
                    }
                    else {
                        console.log("WEBCAM: successfully set stream from webcam-setup plugin")
                        end_trial()
                    }
                });

                virtual_window_container.appendChild(flex_center)
                display_element.appendChild(virtual_window_container)


                const end_trial = () => {
                    this.jsPsych.pluginAPI.clearAllTimeouts();

                    const trial_data = { webcam_params: JSON.stringify(this.webcamRecord.streamObj.getVideoTracks()[0].getSettings()) };
                    // clear the display
                    display_element.innerHTML = "";
                    // move on to the next trial
                    this.jsPsych.finishTrial(trial_data)
                };

                const end_experiment = () => {
                    alert(`We are not able to fetch your camera stream. Please retry the experiment link after closing all background processes or use a different laptop.`)
                    virtual_window_container.remove();
                    this.jsPsych.abortExperiment("unable to get camera stream", { error_data: "unable to get camera stream" });
                }
            } else {
                alert("Webcam Extension was not initialized before starting the plugin. Please retry the study or report this error to the researchers.")
            }
        }
        simulate(trial, simulation_mode, simulation_options, load_callback) {
            // Ensure deviceIds and deviceNames are present for simulation
            if (this.webcamRecord) {
                console.log(this.webcamRecord)
                if (!this.webcamRecord.deviceIds || this.webcamRecord.deviceIds.length === 0) {
                    this.webcamRecord.deviceIds
                }
                if (!this.webcamRecord.deviceNames || this.webcamRecord.deviceNames.length === 0) {
                    this.webcamRecord.deviceNames
                }
            }
            console.log(this.webcamRecord.deviceNames)
            console.log(this.webcamRecord.deviceIds)

            // Mock the mediaRecorder on both the plugin and the extension to prevent errors
            this.mediaRecorder = {
                stop: function () {
                    console.log("Simulated mediaRecorder.stop() called (plugin).");
                }
            };
            if (this.webcamRecord) {
                this.webcamRecord.mediaRecorder = {
                    stop: function () {
                        console.log("Simulated mediaRecorder.stop() called (extension).");
                    }
                };
            }

            if (simulation_mode == "data-only") {
                load_callback();
                this.simulate_data_only(trial, simulation_options); // If using async, add 'await' if simulate is async
            }
            if (simulation_mode == "visual") {
                this.simulate_visual(trial, simulation_options, load_callback);
            }
        }
        async simulate_data_only(trial, simulation_options) {
            // Wait until deviceIds are populated
            await this.waitForDevices();
            const data = this.create_simulation_data(trial, simulation_options);
            this.jsPsych.finishTrial(data);
        }

        // Helper function to wait for deviceIds to be populated
        waitForDevices(timeout = 2000) {
            return new Promise((resolve) => {
                const interval = 50;
                let waited = 0;
                const check = () => {
                    if (this.webcamRecord.deviceIds && this.webcamRecord.deviceIds.length > 0) {
                        resolve();
                    } else if (waited >= timeout) {
                        // Timeout: proceed anyway
                        resolve();
                    } else {
                        waited += interval;
                        setTimeout(check, interval);
                    }
                };
                check();
            });
        }

        simulate_visual(trial, simulation_options, load_callback) {
            const data = this.create_simulation_data(trial, simulation_options);
            const display_element = this.jsPsych.getDisplayElement();
            this.trial(display_element, trial);
            load_callback();
            if (data.rt !== null) {
                this.jsPsych.pluginAPI.pressKey(data.response, data.rt);
            }
        }
        create_simulation_data(trial, simulation_options) {
            // Mock webcam settings as would be returned by getSettings()
            const mockWebcamSettings = {
                deviceId: "simulated-device-id",
                width: 640,
                height: 480,
                frameRate: 30,
                facingMode: "user"
            };

            // Add device info from the extension (populated by search_webcam_devices)
            const deviceIds = this.webcamRecord && this.webcamRecord.deviceIds ? this.webcamRecord.deviceIds : [];
            const deviceNames = this.webcamRecord && this.webcamRecord.deviceNames ? this.webcamRecord.deviceNames : [];

            const default_data = {
                choice: trial.button_text,
                webcam_params: JSON.stringify(mockWebcamSettings),
                webcam_device_ids: this.webcamRecord.deviceIds,
                webcam_device_names: this.webcamRecord.deviceNames,
            };
            const data = this.jsPsych.pluginAPI.mergeSimulationData(default_data, simulation_options);
            this.jsPsych.pluginAPI.ensureSimulationDataConsistency(trial, data);
            return data;
        }
    }
    VideoCaptureSetupPlugin.info = info;

    return VideoCaptureSetupPlugin;
})(jsPsychModule);