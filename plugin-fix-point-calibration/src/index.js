var jsPsychFixPointCalibration = (function (jspsych) {
    'use strict';

    const info = {
        name: "fix-point-calibration",
        parameters: {
            /** The drawing function to apply to the canvas. Should take the canvas object as argument. */
            stimulus: {
                type: jspsych.ParameterType.FUNCTION,
                pretty_name: "Stimulus",
                default: undefined,
            },
            /** Array containing the key(s) the subject is allowed to press to respond to the stimulus. */
            choices: {
                type: jspsych.ParameterType.KEYS,
                pretty_name: "Choices",
                default: ["ArrowDown", "ArrowUp", "ArrowRight", "ArrowLeft"],
            },

            /* The target to be displayed */
            fixation_target: {
                type: jspsych.ParameterType.STRING,
                pretty_name: "Fixation target",
                default: "E",
            },

            /* The size of the fix-point target */
            target_size: {
                type: jspsych.ParameterType.INT,
                pretty_name: "Target size",
                default: 41,
            },

            /* Choose between 3x3 and 4x4 grid size*/
            grid_4x4: {
                type: jspsych.ParameterType.BOOL,
                pretty_name: "set grid to 4x4", //if false: set to 3x3
                default: true,
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
        },
    };
    /**
     * **fix-point-calibration**
     *
     * Use this plugin for implementing a fix-point calibration in eyetracking studies.
     * The calibration trial presents targets on a 4x4 or 3x3 grid (see the grid_4x4 parameter).
     * Targets are randomly presented in one of the four possible orientations (UP, DOWN, LEFT, RIGHT).
     * User responds with the correct direction arrow key.
     * Use the "fixation_target" to change displayed target, default target is the letter 'E'.
     *
     * @author  Shreshth Saxena, Jackson Shi (modified from Josh de Leeuw and Chris Jungerius)
     * @see {@link {https://github.com/beatlab-mcmaster/AVOKE/blob/main/plugin-fix-point-calibration/docs/jspsych-fix-point-calibration.md}}
     */
    class FixPointCalibrationPlugin {
        constructor(jsPsych) {
            this.jsPsych = jsPsych;
            this.wrong_keypresses = 0;
            this.total_wrong_keypresses = 0;
        }

        trial(display_element, trial) {
            // Set choices for clickable or keyboard targets
            if (trial.clickable_targets) {
                trial.choices = ["Click-Up", "Click-Down", "Click-Left", "Click-Right"];
            } else {
                trial.choices = ["ArrowDown", "ArrowUp", "ArrowRight", "ArrowLeft"];
            }

            let target_presentation_time = [];
            var responses = [];
            let h = trial.canvas_size[0];
            let w = trial.canvas_size[1];

            // calculate the coordinates of a point in a grid based on the provided index
            const location_cords = (index) => {
                let gutter = trial.target_size / 2;
                let x, y;

                if (trial.grid_4x4) {
                    let row = Math.floor(index / 4);
                    let col = index % 4;
                    x = (col * w / 3) + gutter * Math.round((1.5 - col) / (1.5)); //gfxps
                    y = (row * h / 3) + gutter * Math.round((1.5 - row) / (1.5));
                } else {
                    let row = Math.floor(index / 3);
                    let col = index % 3;
                    x = (col * w / 2) + gutter * (1 - col); //gfxps
                    y = (row * h / 2) + gutter * (1 - row);
                }
                return [Math.round(x), Math.round(y)];
            }

            let directions = { 'Right': 0, 'Down': 90, 'Left': 180, 'Up': 270 };
            let trial_locations;
            let trial_directions;
            if (trial.grid_4x4) {
                trial_locations = jsPsych.randomization.shuffle([...Array(16).keys()]);
                trial_directions = jsPsych.randomization.sampleWithReplacement(Object.keys(directions), 16);
            } else {
                trial_locations = jsPsych.randomization.shuffle([...Array(9).keys()]);
                trial_directions = jsPsych.randomization.sampleWithReplacement(Object.keys(directions), 9);
            }

            let new_html = '<div id="fix-point-calibration-stimulus">' +
            '<canvas id="fix-point-target" height="' + h + '" width="' + w + '"></canvas>' +
            "</div>";

            // draw and start trial
            display_element.innerHTML = new_html;
            let c = document.getElementById("fix-point-target");
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
                    total_wrong_keypresses: this.total_wrong_keypresses,
                    choices: trial.choices,
                    canvas_size: trial.canvas_size,
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
                if ((info.key).toLowerCase() === ("Arrow" + trial_directions[i]).toLowerCase()) {
                    this.jsPsych.pluginAPI.cancelAllKeyboardResponses();
                    display_element.querySelector("#fix-point-calibration-stimulus").className += " responded";
                    responses.push({
                        key_press: info.key,
                        rt: info.rt,
                        keypress_time: info.keypress_time,
                        wrong_keypresses: this.wrong_keypresses,
                    });
                    i += 1;
                    this.wrong_keypresses = 0;
                    show_next_target();
                } else {
                    this.wrong_keypresses += 1;
                    this.total_wrong_keypresses += 1;
                }
            };

            // function to handle click responses
            var after_click = (event, expected_direction) => {
                responses.push({
                    key_press: "Click-" + expected_direction,
                    rt: performance.now() - target_presentation_time[target_presentation_time.length - 1].time,
                    keypress_time: performance.now(),
                    wrong_keypresses: this.wrong_keypresses,
                });
                i += 1;
                this.wrong_keypresses = 0;
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
                    }

                    const location = location_cords(trial_locations[i]);
                    trial.stimulus(c, trial.fixation_target, location, trial.target_size, directions[trial_directions[i]]);
                    target_presentation_time.push({
                        index: i,
                        loc: location,
                        dir: trial_directions[i],
                        time: performance.now(),
                    });

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
                                after_click(event, trial_directions[i]);
                            } else {
                                this.wrong_keypresses += 1;
                                this.total_wrong_keypresses += 1;
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
        }
        create_simulation_data(trial, simulation_options) {
            const responses = this.generate_responses(trial);

            const default_data = {
                response: responses,
                presentation: this.generate_presentation(trial),
                total_wrong_keypresses: responses.reduce((sum, response) => sum + (response.wrong_keypresses || 0), 0),
                choices: trial.choices,
                canvas_size: trial.canvas_size,
            };
            const data = this.jsPsych.pluginAPI.mergeSimulationData(default_data, simulation_options);
            this.jsPsych.pluginAPI.ensureSimulationDataConsistency(trial, data);
            return data;
        }

        generate_presentation(trial) {
            let target_presentation_time = [];
            let h = trial.canvas_size[0];
            let w = trial.canvas_size[1];

            const location_cords = (index) => {
                let gutter = trial.target_size / 2;
                let x, y;

                if (trial.grid_4x4) {
                    let row = Math.floor(index / 4);
                    let col = index % 4;
                    x = (col * w / 3) + gutter * Math.round((1.5 - col) / (1.5)); //gfxps
                    y = (row * h / 3) + gutter * Math.round((1.5 - row) / (1.5));
                } else {
                    let row = Math.floor(index / 3);
                    let col = index % 3;
                    x = (col * w / 2) + gutter * (1 - col); //gfxps
                    y = (row * h / 2) + gutter * (1 - row);
                }
                return [Math.round(x), Math.round(y)];
            }

            let directions = { 'Right': 0, 'Down': 90, 'Left': 180, 'Up': 270 };
            let trial_locations;
            let trial_directions;
            if (trial.grid_4x4) {
                trial_locations = jsPsych.randomization.shuffle([...Array(16).keys()]);
                trial_directions = jsPsych.randomization.sampleWithReplacement(Object.keys(directions), 16);
            } else {
                trial_locations = jsPsych.randomization.shuffle([...Array(9).keys()]);
                trial_directions = jsPsych.randomization.sampleWithReplacement(Object.keys(directions), 9);
            }
            let max = 0;
            if (trial.grid_4x4) {
                max = 16;
            }
            else {
                max = 9;
            }
            for (let i = 0; i < max; i++) {
                const location = location_cords(trial_locations[i])
                // record when target was shown
                target_presentation_time.push({
                    index: i,
                    loc: location,
                    dir: trial_directions[i],
                    time: performance.now(),
                });
            }


            return target_presentation_time;
        }

        generate_responses(trial) {
            var responses = [];
            let max = 0;
            if (trial.grid_4x4) {
                max = 16;
            }
            else {
                max = 9;
            }
            for (let i = 0; i < max; i++) {
                responses.push({
                    rt: Math.floor(this.jsPsych.randomization.sampleExGaussian(500, 100, 0.01, true)),
                    key_press: this.jsPsych.pluginAPI.getValidKey(trial.choices),
                    wrong_keypresses: Math.floor(Math.random() * 4)
                });

            };
            return responses;
        }
    }
    FixPointCalibrationPlugin.info = info;

    return FixPointCalibrationPlugin;

})(jsPsychModule);