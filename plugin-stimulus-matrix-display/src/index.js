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
                default: "ALL_KEYS",
            },            
            
            /* The target to be displayed */
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

            /* The size of the visual target */
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

            /* Number of rows in the presentation grid */
            grid_rows: {
                type: jspsych.ParameterType.INT,
                pretty_name: "Grid rows",
                default: 3,
            },

            /* Number of columns in the presentation grid */
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
             * Array of rotation angles (in degrees) to randomly sample from for each target. 
             * If empty array, no rotation is applied. Each target gets a randomly selected 
             * angle from this array using jsPsych.randomization.sampleWithReplacement().
             */
            rotation_angles: {
                type: jspsych.ParameterType.INT,
                array: true,
                pretty_name: "Rotation angles pool",
                default: [],
            },
            /**
             * Array specifying the order of target locations (0-indexed grid positions).
             * If empty array, locations will be randomized. If provided, should contain indices
             * corresponding to grid positions (0 to grid_rows*grid_cols-1).
             */
            target_locations: {
                type: jspsych.ParameterType.INT,
                array: true,
                pretty_name: "Target locations",
                default: [],
            },
            /**
             * Array of predetermined rotation angles (in degrees) for each target in sequence.
             * If empty array, uses rotation_angles parameter for random sampling. If provided, should 
             * contain one rotation value for each target in the presentation order.
             * Takes priority over rotation_angles when both are specified.
             */
            rotation_sequence: {
                type: jspsych.ParameterType.INT,
                array: true,
                pretty_name: "Rotation sequence",
                default: [],
            },
            /**
             * If true, requires user to press arrow key corresponding to target rotation direction.
             * Only works with keyboard input (not clickable targets).
             */
            require_direction_match: {
                type: jspsych.ParameterType.BOOL,
                pretty_name: "Require direction match",
                default: false,
            },
            /** Whether to display cursor on the screen or not */
            disable_cursor: {
                type: jspsych.ParameterType.BOOL,
                pretty_name: "Disable cursor on screen",
                default: true,
            },
        },
    };
    /**
     * **stimulus-matrix-display**
     *
     * Use this plugin for implementing matrix-based stimulus display in eyetracking and other studies.
     * The trial presents stimuli on a customizable grid (default 3x3).
     * 
     * Rotation Control:
     * - Use rotation_angles to randomly sample rotation angles for each target
     * - Use rotation_sequence to specify exact rotations for each target in order
     * - rotation_sequence takes priority over rotation_angles when both are provided
     * 
     * Location Control:
     * - Use target_locations to specify exact presentation order of grid positions
     * - If empty array, locations will be randomized automatically
     * 
     * Response Modes:
     * - Keyboard: User responds with arrow keys (optionally matching rotation direction)
     * - Clickable: User clicks directly on targets
     * 
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

        // Helper function to get the correct arrow key for a given rotation
        getDirectionFromRotation(rotation) {
            // Normalize rotation to 0-359 degrees
            const normalizedRotation = ((rotation % 360) + 360) % 360;
            
            // Map rotation to arrow keys (assuming 0° = right-facing)
            if (normalizedRotation >= 315 || normalizedRotation < 45) {
                return "ArrowRight";
            } else if (normalizedRotation >= 45 && normalizedRotation < 135) {
                return "ArrowDown"; 
            } else if (normalizedRotation >= 135 && normalizedRotation < 225) {
                return "ArrowLeft";
            } else if (normalizedRotation >= 225 && normalizedRotation < 315) {
                return "ArrowUp";
            }
            return "ArrowRight"; // Default fallback
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
            
            // Handle target locations - use provided array or randomize if empty
            if (trial.target_locations && trial.target_locations.length > 0) {
                trial_locations = trial.target_locations;
            } else {
                trial_locations = jsPsych.randomization.shuffle([...Array(total_targets).keys()]);
            }
            
            // Handle target rotations - priority: rotation_sequence > rotation_angles > no rotation
            if (trial.rotation_sequence && trial.rotation_sequence.length > 0) {
                trial_rotations = trial.rotation_sequence;
            } else if (!trial.rotation_angles || trial.rotation_angles.length === 0) {
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
                if (trial.disable_cursor && !trial.clickable_targets) {
                    //enable cursor again
                    document.documentElement.style.cursor = "auto";
                }
                
                // move on to the next trial
                this.jsPsych.finishTrial(trial_data);
            };

            // function to handle responses by the subject
            var after_response = (info) => {
                var isValidResponse = false;
                
                if (trial.choices === "ALL_KEYS") {
                    isValidResponse = true;
                } else if (Array.isArray(trial.choices)) {
                    if (trial.require_direction_match && !trial.clickable_targets) {
                        // Check if the pressed key matches the required direction for current target
                        const currentRotation = trial_rotations[i];
                        const requiredKey = this.getDirectionFromRotation(currentRotation);
                        isValidResponse = (info.key).toLowerCase() === requiredKey.toLowerCase();
                    } else {
                        // Accept any valid choice
                        isValidResponse = trial.choices.some(choice => (info.key).toLowerCase() === choice.toLowerCase());
                    }
                }

                if (isValidResponse) {
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
                    key_press: "click",
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

                    if (trial.disable_cursor && !trial.clickable_targets) {
                        document.documentElement.style.cursor = "none";
                    }                    
                    
                    const location = location_cords(trial_locations[i]);
                    
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
                            var keyboardListener = this.jsPsych.pluginAPI.getKeyboardResponse({
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
            
            // Handle target locations - use provided array or randomize if empty
            if (trial.target_locations && trial.target_locations.length > 0) {
                trial_locations = trial.target_locations;
            } else {
                trial_locations = jsPsych.randomization.shuffle([...Array(total_targets).keys()]);
            }
            
            // Handle target rotations - priority: rotation_sequence > rotation_angles > no rotation
            if (trial.rotation_sequence && trial.rotation_sequence.length > 0) {
                trial_rotations = trial.rotation_sequence;
            } else if (!trial.rotation_angles || trial.rotation_angles.length === 0) {
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
                            key_press: "click",
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