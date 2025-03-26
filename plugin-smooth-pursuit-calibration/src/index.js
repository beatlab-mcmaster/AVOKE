var jsPsychSmoothPursuitCalibration = (function (jspsych) {
    'use strict';

    const info = {
        name: "smooth-pursuit-calibration",
        parameters: {
            /** Filepath to image. */
            stimulus: {
                type: jspsych.ParameterType.IMAGE,
                pretty_name: "Stimulus",
                default: undefined,
            },
            /** Set the image height in pixels */
            stimulus_height: {
                type: jspsych.ParameterType.INT,
                pretty_name: "Image height",
                default: 40,
            },
            /** Set the image width in pixels */
            stimulus_width: {
                type: jspsych.ParameterType.INT,
                pretty_name: "Image width",
                default: 40,
            },
            /** Set the starting location for the animation */
            starting_location: {
                type: jspsych.ParameterType.OBJECT,
                pretty_name: "Starting location",
                default: [0,0],
            },
            /** Set the number of repetitions for the animation */
            repetitions: {
                type: jspsych.ParameterType.INT,
                pretty_name: "Repetitions",
                default: 1,
            },
            /** Set the desired path for the target to travel */
            path_shape: {
                type: jspsych.ParameterType.STRING,
                pretty_name: "Path shape",
                default: "rectangle", //or line
            },
            /** Maintain the aspect ratio after setting width or height */
            maintain_aspect_ratio: {
                type: jspsych.ParameterType.BOOL,
                pretty_name: "Maintain aspect ratio",
                default: true,
            },
            /* Duration of smooth pursuit path */
            animation_duration: {
                type: jspsych.ParameterType.INT,
                pretty_name: 'Animation duration',
                default: 1000,
            },
            /** Array containing the key(s) the subject is allowed to press to respond to the stimulus. */
            /**
             * This array contains the key(s) that the participant is allowed to press in order to start
             * to the animation. Keys should be specified as characters (e.g., `'a'`, `'q'`, `' '`, `'Enter'`, `'ArrowDown'`) - see
             * {@link https://developer.mozilla.org/en-US/docs/Web/API/UI_Events/Keyboard_event_key_values this page}
             * and
             * {@link https://www.freecodecamp.org/news/javascript-keycode-list-keypress-event-key-codes/ this page (event.key column)}
             * for more examples. Any key presses that are not listed in the
             * array will be ignored. The default value of `"ALL_KEYS"` means that all keys will be accepted as valid responses.
             * Specifying `"NO_KEYS"` will mean that no responses are allowed.
             */
            choices: {
                type: jspsych.ParameterType.KEYS,
                pretty_name: "Choices",
                default: "ALL_KEYS",
            },
            /** Height of the rectangular path */
            path_height: {
                type: jspsych.ParameterType.INT,
                pretty_name: "Image width",
                default: 800,
            },
            /** Width of the rectangular path */
            path_width: {
                type: jspsych.ParameterType.INT,
                pretty_name: "Image width",
                default: 600,
            },
        },
    };
    /**
     * **smooth-pursuit-calibration**
     *
     * Use this plugin for implementing a smooth-pursuit calibration in eyetracking studies.
     * The calibration trial presents a target that moves along a rectangular path.
     *
     * 
     * @author Shreshth Saxena, Jackson Shi
     * @see {@link {https://github.com/beatlab-mcmaster/AVOKE/blob/main/plugin-smooth-pursuit-calibration/docs/jspsych-smooth-pursuit-calibration.md}}
     */
    class SmoothPursuitCalibrationPlugin {
        constructor(jsPsych) {
            this.jsPsych = jsPsych;
        }

        trial(display_element, trial) {

            let start_time = null;
            let response = { key: null, rt: null };
            let target_presentation_time = [];
            let current_repetition = 1;
            const path_length = trial.path_shape == "line" ? 2*trial.path_width : 2 * (trial.path_width + trial.path_height)
            
            // function to calculate coordinates of the target at a given progress
            const location_coordinates = (progress) => {
                let perimeter = progress * path_length;
                if (trial.path_shape == "rectangle"){
                    if (progress > 0.5) {
                        perimeter -= (path_length / 2);
                        if (perimeter > trial.path_width) {
                            return [0, ((path_length / 2) - perimeter)]
                        } else {
                            return [trial.path_width - perimeter, trial.path_height]
                        }
                    } else {
                        if (perimeter > trial.path_width) {
                            return [trial.path_width, (perimeter - trial.path_width)]
                        } else {
                            return [perimeter, 0]
                        }
                    }
                } else if (trial.path_shape == "line"){
                    // move first quarter to the right, then reverse and move last quarter of the path to the right as well.
                    if (progress >= 0.25 && progress <= 0.75){
                        // moving to the left 
                        return [trial.path_width - (perimeter-0.5*trial.path_width), 0]
                    } else if (progress < 0.25){
                        //moving to the right for the first quarter
                        return [trial.path_width/2 + perimeter, 0]
                    } else {
                        //moving to the right for the last quarter
                        return [perimeter - 0.75*path_length, 0]
                    }
                }
            }

            // disable cursor visibility
            document.documentElement.style.cursor = "none";

            let html = '<div class="virtual-window"><img src="' + trial.stimulus + '" id="smooth-pursuit-target"> </div>';
            // update the page content
            display_element.innerHTML = html;
            let img = display_element.querySelector("#smooth-pursuit-target");
            img.style.position = 'absolute';
            img.style.left = trial.starting_location[0] + 'px';
            img.style.top = trial.starting_location[1] + 'px';
            img.style.height = trial.stimulus_height + 'px';
            img.style.width = trial.stimulus_width + 'px';

            // function to end trial when it is time
            const end_trial = (end_time) => {
                // kill any remaining setTimeout handlers
                this.jsPsych.pluginAPI.clearAllTimeouts();
                // kill keyboard listeners
                if (typeof keyboardListener !== "undefined") {
                    this.jsPsych.pluginAPI.cancelKeyboardResponse(keyboardListener);
                }
                // gather the data to store for the trial
                const trial_data = {
                    response: response,
                    target_presentation_time: target_presentation_time,
                    start_time: start_time,
                    end_time: end_time
                };
                // clear the display
                display_element.innerHTML = "";
                //enable cursor again
                document.documentElement.style.cursor = "auto";
                // move on to the next trial
                this.jsPsych.finishTrial(trial_data);
            };

            // function to animate the target along the path
            let animate = () => {

                const elapsed_time = performance.now() - start_time;
                let progress = elapsed_time / trial.animation_duration;

                const location = location_coordinates(progress)
                const x_pad = trial.path_shape == "line" ? trial.starting_location[0] - (trial.path_width/2) : trial.starting_location[0]
                img.style.left = (x_pad + location[0]) + 'px'
                img.style.top = (trial.starting_location[1] + location[1]) + 'px'

                target_presentation_time.push({
                    repetition: current_repetition,
                    repetition_start_time: start_time,
                    repetition_elapsed_time: elapsed_time,
                    ratio: progress,
                    loc: location,
                });
                if (progress < 1) {
                    //repetition completed
                    requestAnimationFrame(animate);
                } else if (progress >= 1 && current_repetition < trial.repetitions){
                    //repetition completed but more reps left
                    start_time = performance.now();
                    current_repetition += 1
                    requestAnimationFrame(animate);
                } else {
                    //final repetition completed
                    end_trial(performance.now());
                }
            }

            // function to handle responses by the subject
            let after_response = (info) => {
                // after a valid response, the stimulus will have the CSS class 'responded'
                // which can be used to provide visual feedback that a response was recorded
                display_element.querySelector("#smooth-pursuit-target").className +=
                    " responded";
                // only record the first response
                response = info
                start_time = performance.now();
                animate();
            };

            // start the response listener if selected
            if (trial.choices != "NO_KEYS") {
                var keyboardListener = this.jsPsych.pluginAPI.getKeyboardResponse({
                    callback_function: after_response,
                    valid_responses: trial.choices,
                    rt_method: "performance",
                    persist: false,
                    allow_held_key: false,
                });
            } else {
                start_time = performance.now();
                animate();
            }

        }
        simulate(trial, simulation_mode, simulation_options, load_callback) {
            if (simulation_mode == "data-only") {
                load_callback();
                this.simulate_data_only(trial, simulation_options);
            }
            if (simulation_mode == "visual") {
                this.simulate_visual(trial, simulation_options, load_callback);
            }
        }
        simulate_data_only(trial, simulation_options) {
            const data = this.create_simulation_data(trial, simulation_options);
            this.jsPsych.finishTrial(data);
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
            const default_data = {
              response: {
                key: this.jsPsych.pluginAPI.getValidKey(trial.choices),
                rt: this.jsPsych.randomization.sampleExGaussian(500, 50, 1 / 150, true)
              },
              target_presentation_time: this.generate_target_presentation_time(trial),
              start_time: performance.now()
            };
            const data = this.jsPsych.pluginAPI.mergeSimulationData(default_data, simulation_options);
            this.jsPsych.pluginAPI.ensureSimulationDataConsistency(trial, data);
            return data;
          }
          
          generate_target_presentation_time(trial) {
            let target_presentation_time = [];
            const path_length = 2 * (trial.path_width + trial.path_height);
          
            const location_coordinates = (progress) => {
              let perimeter = progress * path_length;
              if (progress > 0.5) {
                perimeter -= (path_length / 2);
                if (perimeter > trial.path_width) {
                  return [0, ((path_length / 2) - perimeter)];
                } else {
                  return [trial.path_width - perimeter, trial.path_height];
                }
              } else {
                if (perimeter > trial.path_width) {
                  return [trial.path_width, (perimeter - trial.path_width)];
                } else {
                  return [perimeter, 0];
                }
              }
            };
          
            const interval = 7; // Interval in milliseconds
            const steps = Math.floor((trial.animation_duration || 1000) / interval);
            for (let i = 0; i <= steps; i++) {
              const ratio = i / steps;
              const elapsed_time = i * interval; // Calculate elapsed time based on interval and iteration index
              let progress = elapsed_time / (trial.animation_duration || 1000);
              const location = location_coordinates(progress);
          
              target_presentation_time.push({
                // TODO: ADD REPETITION INFO
                ratio: ratio,
                loc: location,
                time: elapsed_time
              });
            }
          
            return target_presentation_time;
          }
          
        }
    SmoothPursuitCalibrationPlugin.info = info;

    return SmoothPursuitCalibrationPlugin;

})(jsPsychModule);
