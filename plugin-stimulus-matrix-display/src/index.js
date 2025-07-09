var jsPsychStimulusMatrixDisplay = (function (jspsych) {
    'use strict';

    const info = {
        name: "stimulus-matrix-display",
        parameters: {            /** The drawing function to apply to the canvas. Should take the canvas object as argument. If not provided, a built-in function will be used. */
            stimulus: {
                type: jspsych.ParameterType.FUNCTION,
                pretty_name: "Stimulus",
                default: null,
            },
            /** Array containing the key(s) the subject is allowed to press to respond to the stimulus. */
            choices: {
                type: jspsych.ParameterType.KEYS,
                pretty_name: "Choices",
                default: ["ArrowDown", "ArrowUp", "ArrowRight", "ArrowLeft"],
            },            /* The target to be displayed */
            fixation_target: {
                type: jspsych.ParameterType.STRING,
                pretty_name: "Fixation target",
                default: "E",
            },

            /* Image file to use as target instead of text (overrides fixation_target if provided) */
            target_image: {
                type: jspsych.ParameterType.IMAGE,
                pretty_name: "Target image",
                default: null,
            },

            /* The size of the fix-point target */
            target_size: {
                type: jspsych.ParameterType.INT,
                pretty_name: "Target size",
                default: 41,
            },
            
            /* The duration (in ms) each target is displayed before automatically moving to the next. When active, user inputs are disabled. */
            target_duration: {
                type: jspsych.ParameterType.INT,
                pretty_name: "Target duration",
                default: null,
            },

            /* Number of rows in the calibration grid */
            grid_rows: {
                type: jspsych.ParameterType.INT,
                pretty_name: "Grid rows",
                default: 3,
            },

            /* Number of columns in the calibration grid */
            grid_cols: {
                type: jspsych.ParameterType.INT,
                pretty_name: "Grid columns", 
                default: 3,
            },

            /** Array containing the height (first value) and width (second value) of the canvas element. */
            canvas_size: {
                type: jspsych.ParameterType.INT,
                array: true,
                pretty_name: "Canvas size",
                default: [166, 296],
            },
            /**
             * If true, targets are clickable instead of responding to keyboard.
             */
            clickable_targets: {
                type: jspsych.ParameterType.BOOL,
                pretty_name: "Clickable targets",
                default: false,
            },
            /**
             * Array of rotation angles (in degrees) to apply to targets. If empty array, no rotation is applied.
             * If provided, should contain rotation angles to sample from. Use jsPsych.randomization 
             * functions to randomize order externally if needed.
             */
            rotation_angles: {
                type: jspsych.ParameterType.INT,
                array: true,
                pretty_name: "Rotation angles",
                default: [],
            },
        },
    };
    /**
     * **stimulus-matrix-display**
     *
     * Use this plugin for implementing matrix-based stimulus display in eyetracking and other studies.
     * The trial presents stimuli on a customizable grid (default 3x3).
     * Targets can optionally be rotated using the rotation_angles parameter.
     * User responds with the correct direction arrow key or by clicking on targets.
     * Use the "fixation_target" to change displayed target, default target is the letter 'E'.
     *
     * @author  Shreshth Saxena, Jackson Shi (modified from Josh de Leeuw and Chris Jungerius)
     * @see {@link {https://github.com/beatlab-mcmaster/AVOKE/blob/main/plugin-stimulus-matrix-display/docs/jspsych-stimulus-matrix-display.md}}
     */
    class StimulusMatrixDisplayPlugin {
        constructor(jsPsych) {
            this.jsPsych = jsPsych;
            this.wrong_inputs = 0;
            this.total_wrong_inputs = 0;
        }

        // Built-in drawing function that handles both text and images
        drawTarget(canvas, target, location, target_size, degree = 0, target_type = 'text') {
            let ctx = canvas.getContext("2d");
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            if (target_type === 'image') {
                // Draw image target with proper rotation handling
                const img = new Image();
                img.onload = function() {
                    ctx.save();
                    ctx.translate(location[0], location[1]);
                    ctx.rotate((degree * Math.PI) / 180);
                    ctx.translate(-location[0], -location[1]);
                    
                    const size = target_size;
                    ctx.drawImage(img, location[0] - size/2, location[1] - size/2, size, size);
                    ctx.restore();
                };
                img.src = target;
            } else {
                // Draw text target
                ctx.save();
                ctx.translate(location[0], location[1]);
                ctx.rotate((degree * Math.PI) / 180);
                ctx.translate(-location[0], -location[1]);
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.font = target_size + "px Arial";
                ctx.fillText(target, location[0], location[1]);
                ctx.restore();
            }
        }

        trial(display_element, trial) {
            // Set choices for clickable or keyboard targets
            if (trial.clickable_targets) {
                trial.choices = [];
            } else {
                trial.choices = ["ArrowDown", "ArrowUp", "ArrowRight", "ArrowLeft"];
            }

            let target_presentation_time = [];
            var responses = [];
            let h = trial.canvas_size[0];
            let w = trial.canvas_size[1];            // calculate the coordinates of a point in a grid based on the provided index
            const location_cords = (index) => {
                let row = Math.floor(index / trial.grid_cols);
                let col = index % trial.grid_cols;
                
                // Place targets in center of grid cells
                let x = (col + 0.5) * (w / trial.grid_cols);
                let y = (row + 0.5) * (h / trial.grid_rows);
                
                return [Math.round(x), Math.round(y)];
            }

            let trial_locations;
            let trial_rotations;
            
            const total_targets = trial.grid_rows * trial.grid_cols;
            trial_locations = jsPsych.randomization.shuffle([...Array(total_targets).keys()]);
            
            // Handle rotation angles - if empty array, use no rotation; otherwise sample from provided angles
            if (!trial.rotation_angles || trial.rotation_angles.length === 0) {
                trial_rotations = new Array(total_targets).fill(0);
            } else {
                trial_rotations = jsPsych.randomization.sampleWithReplacement(trial.rotation_angles, total_targets);
            }

            let new_html = '<div id="stimulus-matrix-display-stimulus">' +
            '<canvas id="stimulus-matrix-display-target" height="' + h + '" width="' + w + '"></canvas>' +
            "</div>";

            // draw and start trial
            display_element.innerHTML = new_html;
            let c = document.getElementById("stimulus-matrix-display-target");
            let i = 0;

            // function to end trial when it is time
            const end_trial = () => {
                // kill any remaining setTimeout handlers
                this.jsPsych.pluginAPI.clearAllTimeouts();
                // kill keyboard listeners
                this.jsPsych.pluginAPI.cancelAllKeyboardResponses();
                // gather the data to store for the trial
                const trial_data = {
                    response: responses,
                    presentation: target_presentation_time,
                    total_wrong_inputs: this.total_wrong_inputs,
                    choices: trial.choices,
                    canvas_size: trial.canvas_size,
                    target_duration: trial.target_duration,
                    target_type: trial.target_image !== null ? 'image' : 'text',
                    target_content: trial.target_image !== null ? trial.target_image : trial.fixation_target,
                    grid_rows: trial.grid_rows,
                    grid_cols: trial.grid_cols,
                };
                // clear the display
                display_element.innerHTML = "";
                //enable cursor again
                document.documentElement.style.cursor = "auto";
                // move on to the next trial
                this.jsPsych.finishTrial(trial_data);
            };

            // function to handle responses by the subject
            var after_response = (info) => {
                // Find the expected direction based on the rotation angle
                const rotation_angle = trial_rotations[i];
                let expected_direction = null;
                
                // Map rotation angles to direction names for keyboard responses
                if (rotation_angle === 0) expected_direction = 'Right';
                else if (rotation_angle === 90) expected_direction = 'Down';
                else if (rotation_angle === 180) expected_direction = 'Left';
                else if (rotation_angle === 270) expected_direction = 'Up';
                
                if (expected_direction && (info.key).toLowerCase() === ("Arrow" + expected_direction).toLowerCase()) {
                    this.jsPsych.pluginAPI.cancelAllKeyboardResponses();
                    display_element.querySelector("#stimulus-matrix-display-stimulus").className += " responded";
                    responses.push({
                        key_press: info.key,
                        rt: info.rt,
                        input_time: info.keypress_time,
                        wrong_inputs: this.wrong_inputs,
                    });
                    i += 1;
                    this.wrong_inputs = 0;
                    show_next_target();
                } else {
                    this.wrong_inputs += 1;
                    this.total_wrong_inputs += 1;
                }
            };

            // function to handle click responses
            var after_click = (event) => {
                responses.push({
                    key_press: null,
                    rt: performance.now() - target_presentation_time[target_presentation_time.length - 1].time,
                    input_time: performance.now(),
                    wrong_inputs: this.wrong_inputs,
                });
                i += 1;
                this.wrong_inputs = 0;
                show_next_target();
            };
            
            var show_next_target = () => {
                if (i == trial_locations.length) {
                    end_trial();
                } else {
                    // Always reset handlers for each target
                    c.onclick = null;
                    c.onmousemove = null;

                    if (trial.clickable_targets) {
                        document.documentElement.style.cursor = "default";
                    } else {
                        document.documentElement.style.cursor = "none";
                    }                    const location = location_cords(trial_locations[i]);
                    
                    // Determine target and type
                    const target = trial.target_image !== null ? trial.target_image : trial.fixation_target;
                    const target_type = trial.target_image !== null ? 'image' : 'text';
                    
                    // Use custom stimulus function if provided, otherwise use built-in drawing
                    if (trial.stimulus) {
                        trial.stimulus(c, target, location, trial.target_size, trial_rotations[i], target_type);
                    } else {
                        this.drawTarget(c, target, location, trial.target_size, trial_rotations[i], target_type);
                    }
                    
                    target_presentation_time.push({
                        index: i,
                        loc: location,
                        rotation: trial_rotations[i],
                        time: performance.now(),
                    });

                    // Set up automatic target advance if target_duration is specified
                    if (trial.target_duration !== null) {
                        // Disable inputs during the duration period
                        this.jsPsych.pluginAPI.cancelAllKeyboardResponses();
                        c.onclick = null;
                        c.onmousemove = null;
                        
                        this.jsPsych.pluginAPI.setTimeout(() => {
                            // For fixed duration trials, don't record a response - just advance
                            i += 1;
                            this.wrong_inputs = 0;
                            show_next_target();
                        }, trial.target_duration);
                    } else {
                        // Only set up input handlers if target_duration is null (no auto-advance)
                        if (trial.clickable_targets) {
                            c.onmousemove = (event) => {
                                const rect = c.getBoundingClientRect();
                                const x = event.clientX - rect.left;
                                const y = event.clientY - rect.top;
                                const [targetX, targetY] = location;
                                const r = trial.target_size / 2;
                                const dist = Math.sqrt((x - targetX) ** 2 + (y - targetY) ** 2);
                                c.style.cursor = (dist <= r) ? "pointer" : "default";
                            };
                            c.onclick = (event) => {
                                const rect = c.getBoundingClientRect();
                                const x = event.clientX - rect.left;
                                const y = event.clientY - rect.top;
                                const [targetX, targetY] = location;
                                const r = trial.target_size / 2;
                                const dist = Math.sqrt((x - targetX) ** 2 + (y - targetY) ** 2);
                                if (dist <= r) {
                                    after_click(event);
                                } else {
                                    this.wrong_inputs += 1;
                                    this.total_wrong_inputs += 1;
                                }
                            };
                        } else {
                            let keyboardListener = this.jsPsych.pluginAPI.getKeyboardResponse({
                                callback_function: after_response,
                                rt_method: "performance",
                                persist: true,
                                allow_held_key: false,
                            });
                        }
                    }
                }
            }
            show_next_target();
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
        }        create_simulation_data(trial, simulation_options) {
            const responses = this.generate_responses(trial);

            const default_data = {
                response: responses,
                presentation: this.generate_presentation(trial),
                total_wrong_inputs: responses.reduce((sum, response) => sum + (response.wrong_inputs || 0), 0),
                choices: trial.choices,
                canvas_size: trial.canvas_size,
                target_duration: trial.target_duration,
                target_type: trial.target_image !== null ? 'image' : 'text',
                target_content: trial.target_image !== null ? trial.target_image : trial.fixation_target,
                grid_rows: trial.grid_rows,
                grid_cols: trial.grid_cols,
            };
            const data = this.jsPsych.pluginAPI.mergeSimulationData(default_data, simulation_options);
            this.jsPsych.pluginAPI.ensureSimulationDataConsistency(trial, data);
            return data;
        }

        generate_presentation(trial) {
            let target_presentation_time = [];
            let h = trial.canvas_size[0];
            let w = trial.canvas_size[1];            const location_cords = (index) => {
                let row = Math.floor(index / trial.grid_cols);
                let col = index % trial.grid_cols;
                
                // Place targets in center of grid cells
                let x = (col + 0.5) * (w / trial.grid_cols);
                let y = (row + 0.5) * (h / trial.grid_rows);
                
                return [Math.round(x), Math.round(y)];
            }

            let trial_locations;
            let trial_rotations;
            
            const total_targets = trial.grid_rows * trial.grid_cols;
            trial_locations = jsPsych.randomization.shuffle([...Array(total_targets).keys()]);
            
            // Handle rotation angles - if empty array, use no rotation; otherwise sample from provided angles
            if (!trial.rotation_angles || trial.rotation_angles.length === 0) {
                trial_rotations = new Array(total_targets).fill(0);
            } else {
                trial_rotations = jsPsych.randomization.sampleWithReplacement(trial.rotation_angles, total_targets);
            }
            
            for (let i = 0; i < total_targets; i++) {
                const location = location_cords(trial_locations[i])
                // record when target was shown
                target_presentation_time.push({
                    index: i,
                    loc: location,
                    rotation: trial_rotations[i],
                    time: performance.now(),
                });
            }


            return target_presentation_time;
        }        generate_responses(trial) {
            var responses = [];
            
            // Only generate responses for interactive trials (not fixed duration)
            if (trial.target_duration === null) {
                const total_targets = trial.grid_rows * trial.grid_cols;
                
                for (let i = 0; i < total_targets; i++) {
                    if (trial.clickable_targets) {
                        responses.push({
                            rt: Math.floor(this.jsPsych.randomization.sampleExGaussian(500, 100, 0.01, true)),
                            key_press: null,
                            wrong_inputs: Math.floor(Math.random() * 4)
                        });
                    } else {
                        responses.push({
                            rt: Math.floor(this.jsPsych.randomization.sampleExGaussian(500, 100, 0.01, true)),
                            key_press: this.jsPsych.pluginAPI.getValidKey(trial.choices),
                            wrong_inputs: Math.floor(Math.random() * 4)
                        });
                    }
                }
            }
            // For fixed duration trials, return empty responses array
            return responses;
        }
    }
    StimulusMatrixDisplayPlugin.info = info;

    return StimulusMatrixDisplayPlugin;

})(jsPsychModule);