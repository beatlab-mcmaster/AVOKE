var jsPsychPathAnimationDisplay = (function (jspsych) {
    'use strict';

    const info = {
        name: "path-animation-display",
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
            /** Set the desired path for the target to travel */
            path_shape: {
                type: jspsych.ParameterType.STRING,
                pretty_name: "Path shape",
                default: "rectangle", //or line
            },
            /** Breadth/Height of the path (only used for rectangle path) */
            path_breadth: {
                type: jspsych.ParameterType.INT,
                pretty_name: "Path breadth/height",
                default: 800,
            },
            /** Length/Width of the path  */
            path_length: {
                type: jspsych.ParameterType.INT,
                pretty_name: "Path length/width",
                default: 600,
            },
            /** Slope of the line in degrees. Only used if path_shape is 'line' */   
            path_slope: {
                type: jspsych.ParameterType.FLOAT,
                pretty_name: "Line slope",
                default: 0, 
            },
            /** Set the number of repetitions for the animation */
            repetitions: {
                type: jspsych.ParameterType.INT,
                pretty_name: "Repetitions",
                default: 1,
            },
            /** Whether to move the target clockwise or anti-clockwise */
            clockwise: {
                type: jspsych.ParameterType.BOOL,
                pretty_name: "Clockwise",
                default: true,
            },
            /* Duration of animation path */
            animation_duration: {
                type: jspsych.ParameterType.INT,
                pretty_name: 'Animation duration',
                default: 1000,
            },
            /** Array containing the key(s) the subject is allowed to press to respond to the stimulus. */
            choices: {
                type: jspsych.ParameterType.KEYS,
                pretty_name: "Choices",
                default: "ALL_KEYS",
            },
            /** Whether to store timestamps and locations of each target presentation */
            save_presentation_locations: {
                type: jspsych.ParameterType.BOOL,
                pretty_name: "Save presentation locations",
                default: false,
            },
            /** Whether to display cursor on the screen or not */
            disable_cursor: {
                type: jspsych.ParameterType.BOOL,
                pretty_name: "Disable cursor on screen",
                default: true,
            },
            /** Optional custom function for path coordinates. Should accept (progress, trial) and return [x, y] */
            custom_path_function: {
                type: jspsych.ParameterType.FUNCTION,
                pretty_name: "Custom path function",
                default: null,
            },
        },
    };
    /**
     * **path-animation-display**
     *
     * Use this plugin for implementing a path-animation-display.
     * The trial presents a target that moves along a pre-defined or custom path.
     *
     * 
     * @author Shreshth Saxena, Jackson Shi
     * @see {@link {https://github.com/beatlab-mcmaster/AVOKE/blob/main/plugin-path-animation-display/docs/jspsych-path-animation-display.md}}
     */
    class PathAnimationDisplayPlugin {
        constructor(jsPsych) {
            this.jsPsych = jsPsych;
        }

        trial(display_element, trial) {

            let start_time = null;
            let response = { key: null, rt: null };
            let target_presentation_time = [];
            let current_repetition = 1;
            const first_vertex = trial.clockwise ? trial.path_length : trial.path_breadth;
            const second_vertex = trial.clockwise ? trial.path_breadth : trial.path_length;
            const total_length = trial.path_shape == "line" ? 2 * trial.path_length : 2 * (trial.path_length + trial.path_breadth)
            const radians = trial.path_slope * (Math.PI / 180);

            // function to calculate coordinates of the target at a given progress
            const location_coordinates = (progress) => {
                // if a custom path function is provided, use it
                if (typeof trial.custom_path_function === "function") {
                    return trial.custom_path_function(progress, trial);
                }

                // otherwise, use the default rectangle or line path logic
                let perimeter = progress * total_length;
                let coords = []
                switch (trial.path_shape) {
                    case "rectangle":
                        if (progress > 0.5) {
                            perimeter -= (total_length / 2);
                            if (perimeter > first_vertex) {
                                // fourth quarter of the path
                                coords = [0, ((total_length / 2) - perimeter)]
                            } else {
                                // third quarter of the path
                                coords = [first_vertex - perimeter, second_vertex]
                            }
                        } else {
                            if (perimeter > first_vertex) {
                                // second quarter of the path
                                coords = [first_vertex, (perimeter - first_vertex)]
                            } else {
                                // first quarter of the path
                                coords = [perimeter, 0]
                            }   
                        }
                        return trial.clockwise ? coords : [coords[1], coords[0]]; //reverse x and y coordinates if anti-clockwise
                    case "line":
                        if (progress >= 0.25 && progress <= 0.75){
                            // second and third quarter of the path
                            perimeter = (total_length / 2) - perimeter;
                        } else if (progress > 0.75){
                            // fourth quarter of the path
                            perimeter -= total_length                             
                        }
                        coords =  [perimeter * Math.cos(radians), - (perimeter * Math.sin(radians))]
                        if (!trial.clockwise) coords = coords.map(x => -x);
                        return coords

                    default:
                        console.error("Invalid path shape specified. Use 'rectangle' or 'line'.");
                        return [0, 0];
                }
            }

            if (trial.disable_cursor) {
                // disable cursor visibility
                document.documentElement.style.cursor = "none";
            }

            // update the page content
            let html = '<div class="virtual-window"><img src="' + trial.stimulus + '" id="path-animation-display-target"> </div>';
            display_element.innerHTML = html;
            let img = display_element.querySelector("#path-animation-display-target");
            img.style.position = 'absolute';
            img.style.left = trial.starting_location[0] + 'px';
            img.style.top = trial.starting_location[1] + 'px';
            img.style.height = trial.stimulus_height + 'px';
            img.style.width = trial.stimulus_width + 'px';
            img.style.willChange = 'transform';

            const end_trial = (end_time) => {
                // kill any remaining setTimeout handlers
                this.jsPsych.pluginAPI.clearAllTimeouts();
                if (typeof keyboardListener !== "undefined") {
                    this.jsPsych.pluginAPI.cancelKeyboardResponse(keyboardListener);
                }
                // gather the data to store for the trial
                const trial_data = {
                    response: response,
                    target_presentation_time: trial.save_presentation_locations ? target_presentation_time : "NA",
                    path_shape: trial.path_shape,
                    repetitions_set: trial.repetitions,
                    path_length: trial.path_length,
                    path_breadth: trial.path_breadth,
                    animation_duration: trial.animation_duration,
                    start_time: start_time,
                    end_time: end_time
                };
                // clear the display
                display_element.innerHTML = "";

                if (trial.disable_cursor) {
                    //enable cursor again
                    document.documentElement.style.cursor = "auto";
                }
                // move on to the next trial
                this.jsPsych.finishTrial(trial_data);
            };

            // function to animate the target along the path
            let animate = () => {

                const elapsed_time = performance.now() - start_time;
                let progress = elapsed_time / trial.animation_duration;

                const location = location_coordinates(progress)
                img.style.transform = `translate(${Math.floor( location[0])}px, ${Math.floor( location[1])}px)`;

                if (trial.save_presentation_locations) {
                    // save the target presentation time and location
                    target_presentation_time.push({
                        repetition: current_repetition,
                        repetition_start_time: start_time,
                        repetition_elapsed_time: elapsed_time,
                        ratio: progress,
                        loc: location,
                    });
                }
                
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
                display_element.querySelector("#path-animation-display-target").className +=
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
              path_shape: trial.path_shape,
              repetitions_set: trial.repetitions,
              path_length: trial.path_length,
              path_breadth: trial.path_breadth,
              animation_duration: trial.animation_duration,
              start_time: performance.now(),
              end_time: performance.now() + trial.animation_duration,
            };
            const data = this.jsPsych.pluginAPI.mergeSimulationData(default_data, simulation_options);
            this.jsPsych.pluginAPI.ensureSimulationDataConsistency(trial, data);
            return data;
          }
          
          generate_target_presentation_time(trial) {
            let target_presentation_time = [];
            const total_length = 2 * (trial.path_length + trial.path_breadth);
          
            const location_coordinates = (progress) => {
              let perimeter = progress * total_length;
              if (progress > 0.5) {
                perimeter -= (total_length / 2);
                if (perimeter > trial.path_length) {
                  return [0, ((total_length / 2) - perimeter)];
                } else {
                  return [trial.path_length - perimeter, trial.path_breadth];
                }
              } else {
                if (perimeter > trial.path_length) {
                  return [trial.path_length, (perimeter - trial.path_length)];
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
                repetition: Math.floor(Math.random() * trial.repetitions) + 1,
                repetition_start_time: performance.now(),
                repetition_elapsed_time: elapsed_time,
                ratio: ratio,
                loc: location,
              });
            }
          
            return target_presentation_time;
          }
          
        }
    PathAnimationDisplayPlugin.info = info;

    return PathAnimationDisplayPlugin;

})(jsPsychModule);
