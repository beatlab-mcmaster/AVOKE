var jsPsychAudioVisualResponse = (function (jspsych) {
  "use strict";

  const info = {
    name: "audio-visual-response",
    parameters: {
      /** The audio to be played. */
      audio_stimulus: {
        type: jspsych.ParameterType.AUDIO,
        pretty_name: "Stimulus",
        default: undefined,
      },
      /** The image to be displayed */
      image_stimulus: {
        type: jspsych.ParameterType.IMAGE,
        pretty_name: "Stimulus",
        default: undefined,
      },
      /** Set the image height in pixels */
      stimulus_height: {
        type: jspsych.ParameterType.INT,
        pretty_name: "Image height",
        default: 512,
      },
      /** Set the image width in pixels */
      stimulus_width: {
        type: jspsych.ParameterType.INT,
        pretty_name: "Image width",
        default: 512,
      },
      /** Maintain the aspect ratio after setting width or height */
      maintain_aspect_ratio: {
        type: jspsych.ParameterType.BOOL,
        pretty_name: "Maintain aspect ratio",
        default: true,
      },
      /** Array containing the label(s) for the button(s). */
      choices: {
        type: jspsych.ParameterType.STRING,
        pretty_name: "Choices",
        default: undefined,
        array: true,
      },
      /** The HTML for creating button. Can create own style. Use the "%choice%" string to indicate where the label from the choices parameter should be inserted. */
      button_html: {
        type: jspsych.ParameterType.FUNCTION,
        default: function (choice, choice_index) {
          return '<button class="form-btn" id="button-' + choice_index + '" style="visibility: hidden;">' + choice + '</button>';
        },
      },
      /* Time delay for the button to activate, in ms*/
      button_activate_time: {
        type: jspsych.ParameterType.INT,
        pretty_name: "Button activate time",
        default: 0,
      },
      /** Any content here will be displayed below the stimulus. */
      prompt: {
        type: jspsych.ParameterType.HTML_STRING,
        pretty_name: "Prompt",
        default: null,
      },
      /** The maximum duration to wait for a response. */
      trial_duration: {
        type: jspsych.ParameterType.INT,
        pretty_name: "Trial duration",
        default: null,
      },
      /** If true, the trial will end when user makes a response. */
      response_ends_trial: {
        type: jspsych.ParameterType.BOOL,
        pretty_name: "Response ends trial",
        default: true,
      },
      /** If true, then the trial will end as soon as the audio file finishes playing. */
      trial_ends_after_audio: {
        type: jspsych.ParameterType.BOOL,
        pretty_name: "Trial ends after audio",
        default: false,
      },
      /**
       * If true, then responses are allowed while the audio is playing.
       * If false, then the audio must finish playing before a response is accepted.
       */
      response_allowed_while_playing: {
        type: jspsych.ParameterType.BOOL,
        pretty_name: "Response allowed while playing",
        default: true,
      },
      /**
       * If true, the image will be drawn onto a canvas element (prevents blank screen between consecutive images in some browsers).
       * If false, the image will be shown via an img element.
       */
      render_on_canvas: {
        type: jspsych.ParameterType.BOOL,
        pretty_name: "Render on canvas",
        default: true, //need to check scaling logic for img render
      },
      /**
       * If true, use Date.now() for timestamps; otherwise use performance.now().
       */
      use_date_now: {
        type: jspsych.ParameterType.BOOL,
        pretty_name: "Use Date.now() for timestamps",
        default: false,
      },
      /**
       * If true, show a continuous response slider above the buttons.
       */
      show_slider: {
        type: jspsych.ParameterType.BOOL,
        pretty_name: "Show slider",
        default: false,
      },
      /**
       * Text to display above the slider.
       */
      slider_prompt: {
        type: jspsych.ParameterType.HTML_STRING,
        pretty_name: "Slider prompt",
        default: "How confident are you?",
      },
      /**
       * Minimum value of the slider.
       */
      slider_min: {
        type: jspsych.ParameterType.INT,
        pretty_name: "Slider minimum",
        default: 0,
      },
      /**
       * Maximum value of the slider.
       */
      slider_max: {
        type: jspsych.ParameterType.INT,
        pretty_name: "Slider maximum",
        default: 100,
      },
      /**
       * Starting value of the slider.
       */
      slider_start: {
        type: jspsych.ParameterType.INT,
        pretty_name: "Slider start",
        default: 50,
      },
      /**
       * Step size of the slider.
       */
      slider_step: {
        type: jspsych.ParameterType.INT,
        pretty_name: "Slider step",
        default: 1,
      },
      /**
       * Array of labels to display under the slider (e.g., ["Not at all", "Very much"]).
       */
      slider_labels: {
        type: jspsych.ParameterType.STRING,
        pretty_name: "Slider labels",
        default: [],
        array: true,
      },
      /** Enable multi-button response logging (does not end trial on click). */
      multi_button_response: {
        type: jspsych.ParameterType.BOOL,
        pretty_name: "Multi-button response",
        default: false,
      },
    },
  };

  /**
       * **audio-visual-response**
       *
       * This plugin allows for displaying an image and playing an audio file simultaneously, and records responses generated with a button click.
       * The included parameters allow for adjustment of trial duration, visual stimuli size, time delay before the button can be interacted with and more.
       * The trial can be set to end when a button response is received or after the audio stimuli is finished playing.
       * 
       * @author Shreshth Saxena, Jackson Shi
       * @see {@link https://github.com/beatlab-mcmaster/AVOKE/blob/main/plugin-audio-visual-response/docs/jspsych-audio-visual-response.md}
       */
  class AudioVisualResponsePlugin {
    constructor(jsPsych) {
      this.jsPsych = jsPsych;
    }

    // helper function to get timestamp based on user preference
    getTimestamp(use_date_now) {
      return use_date_now ? Date.now() : performance.now();
    }

    async trial(display_element, trial, on_load) {

      function getSliderHTML() {
        if (!trial.show_slider) return "";
        let slider_html = `<div id="jspsych-av-slider-container" style="text-align: center;">`;
        if (trial.slider_prompt) {
          slider_html += `<div id="jspsych-av-slider-prompt" style="margin-bottom: 0.5em;">${trial.slider_prompt}</div>`;
        }
        slider_html += `
          <input type="range" id="jspsych-av-slider" 
            min="${trial.slider_min}" 
            max="${trial.slider_max}" 
            value="${trial.slider_start}" 
            step="${trial.slider_step}" 
            style="width: 60%;">
          <div id="jspsych-av-slider-value" style="font-size: 1.1em;">${trial.slider_start}</div>
        `;
        // Add labels if provided
        if (trial.slider_labels && trial.slider_labels.length > 0) {
          slider_html += `<div style="display: flex; justify-content: space-between; width: 60%; margin: 0 auto; font-size: 0.9em;">`;
          for (let i = 0; i < trial.slider_labels.length; i++) {
            slider_html += `<span>${trial.slider_labels[i]}</span>`;
          }
          slider_html += `</div>`;
        }
        slider_html += `</div>`;
        return slider_html;
      }

      function createButtonGroup(parent) {
        // display buttons
        const buttonGroupElement = document.createElement("div");
        buttonGroupElement.id = "jspsych-av-response-btngroup";
        buttonGroupElement.style.position = "absolute";
        buttonGroupElement.style.bottom = "10px";
        buttonGroupElement.style.right = "10px";

        if (trial.button_layout === "grid") {
          buttonGroupElement.classList.add("jspsych-btn-group-grid");
          if (trial.grid_rows === null && trial.grid_columns === null) {
            throw new Error(
              "You cannot set `grid_rows` to `null` without providing a value for `grid_columns`."
            );
          }
          const n_cols =
            trial.grid_columns === null
              ? Math.ceil(trial.choices.length / trial.grid_rows)
              : trial.grid_columns;
          const n_rows =
            trial.grid_rows === null
              ? Math.ceil(trial.choices.length / trial.grid_columns)
              : trial.grid_rows;
          buttonGroupElement.style.gridTemplateColumns = `repeat(${n_cols}, 1fr)`;
          buttonGroupElement.style.gridTemplateRows = `repeat(${n_rows}, 1fr)`;
        } else if (trial.button_layout === "flex") {
          buttonGroupElement.classList.add("jspsych-btn-group-flex");
        }

        for (let choiceIndex = 0; choiceIndex < trial.choices.length; choiceIndex++) {
          const choice = trial.choices[choiceIndex];
          buttonGroupElement.insertAdjacentHTML("beforeend", trial.button_html(choice, choiceIndex));
          const buttonElement = buttonGroupElement.lastChild;
          buttonElement.setAttribute("data-choice", choiceIndex.toString());
          buttonElement.addEventListener("click", function () {
            after_response(choiceIndex);
          });
        }

        parent.appendChild(buttonGroupElement);
        return buttonGroupElement;
      }

      let trial_complete;
      // setup stimulus
      let context = this.jsPsych.pluginAPI.audioContext();
      // store response
      let response = {
        rt: null,
        button: null,
        imageDisplayTime: null,
        audioStartTime: null,
        audioEndTime: null,
        buttonClickTime: null,
        slider_value: null,
      };
      let buttonsEnabled = false;
      let multiButtonResponses = []; // Store all button responses if enabled

      // Helper for timestamp
      const getTimestamp = () => this.getTimestamp(trial.use_date_now);

      //setup image display
      let height, width;
      let html;

      if (trial.render_on_canvas) {
        let image_drawn = false;
        // first clear the display element (because the render_on_canvas method appends to display_element instead of overwriting it with .innerHTML)
        if (display_element.hasChildNodes()) {
          while (display_element.firstChild) {
            display_element.removeChild(display_element.firstChild);
          }
        }

        // create canvas element and image
        let new_html = `<div id="virtual-window-content">
        <canvas id="jspsych-image-response-stimulus"></canvas>
        </div>`;

        // draw and start trial
        display_element.innerHTML = new_html;
        let canvas = document.getElementById("jspsych-image-response-stimulus");
        canvas.style.margin = "0";
        canvas.style.padding = "0";
        let ctx = canvas.getContext("2d");
        let img = new Image();
        img.onload = () => {
          // if image wasn't preloaded, then it will need to be drawn whenever it finishes loading
          if (!image_drawn) {
            console.log("image loaded")
            getHeightWidth(); // only possible to get width/height after image loads
            response.imageDisplayTime = getTimestamp();
            ctx.drawImage(img, 0, 0, width, height);
          }
        };
        img.src = trial.image_stimulus;
        // get/set image height and width - this can only be done after image loads because uses image's naturalWidth/naturalHeight properties
        const getHeightWidth = () => {
          if (trial.maintain_aspect_ratio) {
            const widthRatio = trial.stimulus_width / img.naturalWidth;
            const heightRatio = trial.stimulus_height / img.naturalHeight;
            const scale_factor = Math.min(widthRatio, heightRatio);

            width = img.naturalWidth * scale_factor;
            height = img.naturalHeight * scale_factor;
          } else {
            height = trial.stimulus_height;
            width = trial.stimulus_width;
          }
          canvas.height = height;
          canvas.width = width;
        };
        getHeightWidth(); // call now, in case image loads immediately (is cached)

        // add canvas to screen and draw image
        if (img.complete && Number.isFinite(width) && Number.isFinite(height)) {
          // if image has loaded and width/height have been set, then draw it now
          // (don't rely on img onload function to draw image when image is in the cache, because that causes a delay in the image presentation)
          response.imageDisplayTime = getTimestamp();
          ctx.drawImage(img, 0, 0, width, height);
          image_drawn = true;
        }

        // add buttons to screen
        const buttonGroupElement = createButtonGroup(display_element);
        const parentDiv = document.getElementById('virtual-window-content');
        parentDiv.insertBefore(buttonGroupElement, canvas.nextElementSibling);

        // insert slider below buttons if enabled
        if (trial.show_slider) {
          parentDiv.insertAdjacentHTML("beforeend", getSliderHTML());
        }
        // add prompt if there is one
        if (trial.prompt !== null) {
          display_element.insertAdjacentHTML("beforeend", trial.prompt);
        }
      } else {

        // display stimulus as an image element
        html = '<div id="virtual-window-content"><img src="' + trial.image_stimulus + '" id="jspsych-av-response-stimulus"></div>';
        
        // insert slider below buttons if enabled
        if (trial.show_slider) {
          html += getSliderHTML();
        }
        // show prompt if there is one
        if (trial.prompt !== null) {
          html += trial.prompt;
        }
        display_element.innerHTML = html;
        
        const parentDiv = document.getElementById('virtual-window-content');
        const sliderElement = document.getElementById('jspsych-av-slider');
        // create the buttons and insert before the slider (if slider exists)
        const buttonGroupElement = createButtonGroup(parentDiv);
        if (sliderElement) {
          parentDiv.insertBefore(buttonGroupElement, sliderElement);
        } else {
          parentDiv.appendChild(buttonGroupElement);
        }

        // set image dimensions after image has loaded (so that we have access to naturalHeight/naturalWidth)
        let img = display_element.querySelector("#jspsych-av-response-stimulus");
        
        img.onload = () => {
          if (trial.maintain_aspect_ratio) {
            const widthRatio = trial.stimulus_width / img.naturalWidth;
            const heightRatio = trial.stimulus_height / img.naturalHeight;
            const scale_factor = Math.min(widthRatio, heightRatio);

            width = img.naturalWidth * scale_factor;
            height = img.naturalHeight * scale_factor;
          } else {
            height = trial.stimulus_height;
            width = trial.stimulus_width;
          }

          img.style.width = `${width}px`;
          img.style.height = `${height}px`;
          response.imageDisplayTime = getTimestamp();
        };
        
      }

      // add slider value update event listener
      if (trial.show_slider) {
        // Use setTimeout to ensure the slider is in the DOM
        setTimeout(() => {
          const slider = document.getElementById("jspsych-av-slider");
          const sliderValue = document.getElementById("jspsych-av-slider-value");
          if (slider && sliderValue) {
            slider.addEventListener("input", function() {
              sliderValue.textContent = slider.value;
            });
          }
        }, 0);
      }

      // record webaudio context start time
      let startTime;
      // load audio file
      this.audio = await this.jsPsych.pluginAPI.getAudioPlayer(trial.audio_stimulus)

      const end_trial = () => {
        // kill any remaining setTimeout handlers
        this.jsPsych.pluginAPI.clearAllTimeouts();
        // stop the audio file if it is playing
        // remove end event listeners if they exist
        response.audioEndTime = getTimestamp();
        if (context !== null) {
          this.audio.stop();
        }
        this.audio.removeEventListener("ended", end_trial);
        this.audio.removeEventListener("ended", enable_buttons);
        if (trial.show_slider) {
          const slider = document.getElementById("jspsych-av-slider");
          if (slider) {
            response.slider_value = slider.value;
          }
        }
        // gather the data to store for the trial
        const trial_data = {
          rt: response.rt,
          stimulus_audio: trial.audio_stimulus,
          stimulus_image: trial.image_stimulus,
          response: response.button,
          imageDisplayTime: response.imageDisplayTime,
          audioStartTime: response.audioStartTime,
          audioEndTime: response.audioEndTime,
          buttonClickTime: response.buttonClickTime,
          slider_value: response.slider_value,
          maintain_aspect_ratio: trial.maintain_aspect_ratio,
          stimulus_width: width,
          stimulus_height: height,
          trial_duration: trial.trial_duration,
          multi_button_responses: trial.multi_button_response ? multiButtonResponses : undefined
        };
        console.log("trial_data", JSON.stringify(trial_data));
        // clear the display
        display_element.innerHTML = "";
        // move on to the next trial
        this.jsPsych.finishTrial(trial_data);
        trial_complete();
      };

      // end trial after audio ends if necessary
      if (trial.trial_ends_after_audio) {
        this.audio.addEventListener("ended", end_trial);
      }
      // enable buttons after audio ends if necessary
      if (!trial.response_allowed_while_playing && !trial.trial_ends_after_audio) {
        this.audio.addEventListener("ended", enable_buttons);
      }

      if (trial.response_allowed_while_playing) {
        enable_buttons();
        // setTimeout(enable_buttons, trial.button_activate_time);
      } else {
        disable_buttons();
      }
      
      // start time
      startTime = getTimestamp();
      response.audioStartTime = startTime;
      // start audio
      if (context !== null) {
        startTime = context.currentTime;
      }

      // start audio
      this.audio.play();


      // end trial if time limit is set
      if (trial.trial_duration !== null) {
        this.jsPsych.pluginAPI.setTimeout(() => {
          end_trial();
        }, trial.trial_duration);
      }
      on_load();
    
      // function to handle responses by the subject
      function after_response(choice, buttonGroupElement) {
        let endTime = getTimestamp();
        let rt = Math.round(endTime - startTime);
        if (context !== null) {
          endTime = context.currentTime;
          rt = Math.round((endTime - startTime) * 1000);
        }
        // Multi-button response logic
        if (trial.multi_button_response) {
          multiButtonResponses.push({
            button: parseInt(choice),
            button_text: trial.choices[choice],
            timestamp: getTimestamp(),
          });
        } else {
          response.button = parseInt(choice);
          response.rt = rt;
          response.buttonClickTime = endTime;
          // capture slider value
          if (trial.show_slider) {
            const slider = document.getElementById("jspsych-av-slider");
            if (slider) {
              response.slider_value = slider.value;
            }
          }
          disable_buttons(); // disable all the buttons after a response
          // End trial if response_ends_trial is True
          if (trial.response_ends_trial) {
            end_trial();
          }
        }
      }

      function button_response(e) {
        let choice = e.currentTarget.getAttribute("data-choice"); // don't use dataset for jsdom compatibility
        after_response(choice);
      }

      function disable_buttons() {
        const buttonGroupElement = document.getElementById("jspsych-av-response-btngroup");
        if (buttonGroupElement) {
          for (const button of buttonGroupElement.children) {
            button.setAttribute("disabled", "disabled");
          }
        } else {
          console.error("Button group element not found.");
        }
      }


      function enable_buttons() {
        if (buttonsEnabled) return; // Prevent multiple calls
        buttonsEnabled = true;
      
        let buttons = document.querySelectorAll(".form-btn");
        buttons.forEach((button) => {
          button.style.visibility = "hidden";
          button.disabled = true;
        });
      
        jsPsych.pluginAPI.setTimeout(() => {
          buttons.forEach((button) => {
            button.style.visibility = "visible";
            button.disabled = false;
          });
          console.log("buttons enabled", performance.now());
        }, trial.button_activate_time);
      }
      return new Promise((resolve) => {
        trial_complete = resolve;
      });

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
    async create_simulation_data(trial, simulation_options) {
      const dimensions = await this.generate_image_dimensions(trial);
      const width = dimensions.width;
      const height = dimensions.height;
      console.log("width", width);
      console.log("height", height);
      const default_data = {
        rt: this.jsPsych.randomization.sampleExGaussian(500, 50, 1 / 150, true),
        stimulus_audio: trial.audio_stimulus,
        stimulus_image: trial.image_stimulus,
        response: this.jsPsych.randomization.randomInt(0, trial.choices.length - 1),
        imageDisplayTime: this.jsPsych.randomization.sampleExGaussian(500, 50, 1 / 150, true),
        audioStartTime: this.jsPsych.randomization.sampleExGaussian(500, 50, 1 / 150, true),
        audioEndTime: this.jsPsych.randomization.sampleExGaussian(500, 50, 1 / 150, true),
        buttonClickTime: this.jsPsych.randomization.sampleExGaussian(500, 50, 1 / 150, true),
        maintain_aspect_ratio: trial.maintain_aspect_ratio,
        stimulus_width: width,
        stimulus_height: height,
        trial_duration: trial.trial_duration,
      };
      const data = this.jsPsych.pluginAPI.mergeSimulationData(default_data, simulation_options);
      this.jsPsych.pluginAPI.ensureSimulationDataConsistency(trial, data);
      return data;
    }
    simulate_data_only(trial, simulation_options) {
      const data = this.create_simulation_data(trial, simulation_options);
      this.jsPsych.finishTrial(data);
    }
    simulate_visual(trial, simulation_options, load_callback) {
      const data = this.create_simulation_data(trial, simulation_options);
      const display_element = this.jsPsych.getDisplayElement();
      const respond = () => {
        if (data.rt !== null) {
          this.jsPsych.pluginAPI.clickTarget(display_element.querySelector(`div[data-choice="${data.response}"] button`), data.rt);
        }
      };
      this.trial(display_element, trial, () => {
        load_callback();
        if (!trial.response_allowed_while_playing) {
          this.audio.addEventListener("ended", respond);
        } else {
          respond();
        }
      });
    }
    generate_image_dimensions(trial) {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = trial.image_stimulus;
        img.onload = () => {
          let height, width;

          if (trial.maintain_aspect_ratio) {
            const widthRatio = trial.stimulus_width / img.naturalWidth;
            const heightRatio = trial.stimulus_height / img.naturalHeight;
            const scale_factor = Math.min(widthRatio, heightRatio);            

            width = img.naturalWidth * scale_factor;
            height = img.naturalHeight * scale_factor;
          } else {
            height = trial.stimulus_height || img.naturalHeight;
            width = trial.stimulus_width || img.naturalWidth;
          }

          console.log(img.naturalWidth, img.naturalHeight);
          resolve({ width, height });
        };

        img.onerror = () => {
          reject(new Error(`Failed to load image: ${trial.image_stimulus}`));
        };
      });
}
  }
  AudioVisualResponsePlugin.info = info;

  return AudioVisualResponsePlugin;

})(jsPsychModule);
