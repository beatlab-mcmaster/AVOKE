var jsPsychYouTubeResponse = (function (jspsych) {
  "use strict";

  const info = {
    name: "youtube-response",
    parameters: {
      /** YouTube link for the livestream/video to be displayed */
      stimulus: {
        type: jspsych.ParameterType.HTML_STRING,
        pretty_name: "Stimulus",
        default: undefined,
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
      /** Any content here will be displayed at the end of the page. */
      prompt: {
        type: jspsych.ParameterType.HTML_STRING,
        pretty_name: "Prompt",
        default: null,
      },
      /** How long to show the stimulus. */
      stimulus_duration: {
        type: jspsych.ParameterType.INT,
        pretty_name: "Stimulus duration",
        default: null,
      },
      /** CASE 1: the trial displays the next button after desired time (in ms) */
      button_disable_time: {
        type: jspsych.ParameterType.INT,
        pretty_name: "Enable button after:",
        default: null,
      },
      /** CASE 2: the trial ends after a set duration (in ms) */
      trial_duration: {
        type: jspsych.ParameterType.INT,
        pretty_name: "Trial duration",
        default: null,
      },
      /** If true, then trial will end when user responds. */
      response_ends_trial: {
        type: jspsych.ParameterType.BOOL,
        pretty_name: "Response ends trial",
        default: true,
      },
      /** Set time intervals for logging youtube player state */
      log_after_every: {
        type: jspsych.ParameterType.INT,
        pretty_name: "Log after every",
        default: 5000,
      },
      /** If true, the YouTube player controls will be enabled. */
      controls: {
        type: jspsych.ParameterType.BOOL,
        pretty_name: "Controls",
        default: true,
      },
      /** If true, the YouTube video will autoplay. */
      autoplay: {
        type: jspsych.ParameterType.BOOL,
        pretty_name: "Autoplay",
        default: false,
      },
      /** If true, the YouTube video will be muted. */
      mute: {
        type: jspsych.ParameterType.BOOL,
        pretty_name: "Mute",
        default: true,
      },
      /** If true, pointer events will be enabled for the iframe. */
      pointer_events: {
        type: jspsych.ParameterType.BOOL,
        pretty_name: "Pointer events",
        default: true,
      },
      /** Background color of the page. */
      background_colour: {
          type: jspsych.ParameterType.STRING,
          pretty_name: "Background colour",
          default: "#111",
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
       * If true, show a continuous response slider below the buttons.
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
      /** Maximum duration (in ms) to allow buffering or paused state before ending trial. Set to null to disable. */
      buffering_timeout: {
        type: jspsych.ParameterType.INT,
        pretty_name: "Buffering/Paused timeout",
        default: 300000, // 5 minutes in milliseconds
      },
    },
  };

  /**
   * **youtube-response**
   *
   * jsPsych plugin for displaying a YouTube stream or video and getting a button response
   * 
   * 
   * @author Shreshth Saxena, Jackson Shi
   * 
   * @see {@link https://github.com/beatlab-mcmaster/AVOKE/blob/main/plugin-youtube-response/docs/jspsych-youtube-response.md}
   */
  class YouTubeResponsePlugin {
    constructor(jsPsych) {
      this.jsPsych = jsPsych;
    }

    // function to get timestamp based on user preference
    getTimestamp(use_date_now) {
      return use_date_now ? Date.now() : performance.now();
    }

    trial(display_element, trial) {
      document.body.style.backgroundColor = trial.background_color;
      const controls_param = trial.controls ? '1' : '0';
      const autoplay_param = trial.autoplay ? '1' : '0';
      const mute_param = trial.mute ? '1' : '0';
      const pointer_events = trial.pointer_events ? 'auto' : 'none';

      let html = `
<div id="jspsych-html-stream-response-stimulus"
     style="background-color: #FFF; width: 100vw; height: 100vh; display: flex; flex-direction: column; align-items: stretch; margin: 0; padding: 0; box-sizing: border-box;">
  <div style="flex: 1 1 auto; display: flex; flex-direction: column; justify-content: flex-start;">
    <div style="width: 100%; height: 100%; max-height: 85vh; aspect-ratio: 16/9; background: #000;">
      <iframe id="ytplayer"
        src="${trial.stimulus}?enablejsapi=1&controls=${controls_param}&autoplay=${autoplay_param}&mute=${mute_param}"
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media;"
        style="pointer-events: ${pointer_events}; width: 100%; height: 100%; border: none; display: block;">
      </iframe>
    </div>
  </div>
`;

if (trial.show_slider) {
  html += `<div style="width: 100%; display: flex; justify-content: center; margin-top: 1em;">${getSliderHTML()}</div>`;
}

      // show prompt if there is one
      if (trial.prompt !== null) {
        html += `<div style="left:0; bottom: 0; position: absolute;">` + trial.prompt + `</div>`;
      }

      function getSliderHTML() {
        if (!trial.show_slider) return "";
        let slider_html = `<div id="jspsych-yt-slider-container" style="text-align: center;">`;
        if (trial.slider_prompt) {
          slider_html += `<div id="jspsych-yt-slider-prompt" style="margin-bottom: 0.5em;">${trial.slider_prompt}</div>`;
        }
        slider_html += `
          <input type="range" id="jspsych-yt-slider" 
            min="${trial.slider_min}" 
            max="${trial.slider_max}" 
            value="${trial.slider_start}" 
            step="${trial.slider_step}" 
            style="width: 60%;">
          <div id="jspsych-yt-slider-value" style="margin-top: 0.5em; font-size: 1.1em;">${trial.slider_start}</div>
        `;
        // labels if provided
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
      display_element.innerHTML = html;

      // display buttons
      const buttonGroupElement = document.createElement("div");
      buttonGroupElement.id = "jspsych-html-stream-response-btngroup";

      buttonGroupElement.style.position = "absolute"; // Use "fixed" if you want it to stay in place during scrolling
      buttonGroupElement.style.bottom = "10px"; // Distance from the bottom of the page
      buttonGroupElement.style.right = "10px"; // Distance from the right of the page

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

      display_element.appendChild(buttonGroupElement);

      if (trial.button_disable_time == null) {
        const buttons = buttonGroupElement.querySelectorAll("button");
        buttons.forEach((button) => {
          button.style.visibility = "visible";
        });
      }

      // slider value update event listener
      if (trial.show_slider) {
        setTimeout(() => {
          const slider = document.getElementById("jspsych-yt-slider");
          const sliderValue = document.getElementById("jspsych-yt-slider-value");
          if (slider && sliderValue) {
            slider.addEventListener("input", function() {
              sliderValue.textContent = slider.value;
            });
          }
        }, 0);
      }

      // Check if YT API is loaded correctly
      var player;
      var playerTime = [];
      // Timer variables for buffering/paused timeout
      var bufferingTimer = null;
      var bufferingStartTime = null;

      if (YT == null) {
        console.log("ERROR: YT API has not loaded properly.")
      } else {
        console.log("YT API loaded", YT)

        // return the current playback quality of the video on every change
        function onPlaybackQualityChange(event) {
          var playbackQuality = event.target.getPlaybackQuality();
          console.log("Playback quality changed to:", playbackQuality);
          playerTime.push({ time: Date.now(), quality: playbackQuality })
        }

        // current state of the player on every change
        function onPlayerStateChange(event) {
          const playerStatus = event.data
          const currentTime = Date.now();
          
          if (playerStatus == -1) {
            playerTime.push({ time: currentTime, state: "unstarted" })
            clearBufferingTimer();
          } else if (playerStatus == 0) {
            playerTime.push({ time: currentTime, state: "ended" })
            clearBufferingTimer();
          } else if (playerStatus == 1) {
            playerTime.push({ time: currentTime, state: "playing" })
            clearBufferingTimer();
          } else if (playerStatus == 2) {
            playerTime.push({ time: currentTime, state: "paused" })
            startBufferingTimer(currentTime);
          } else if (playerStatus == 3) {
            playerTime.push({ time: currentTime, state: "buffering" })
            startBufferingTimer(currentTime);
          } else if (playerStatus == 5) {
            playerTime.push({ time: currentTime, state: "cued" })
            clearBufferingTimer();
          }
          console.log("Event triggered: ", playerTime[playerTime.length - 1]["state"]);
        }

        // Helper functions for buffering timeout
        function startBufferingTimer(startTime) {
          if (trial.buffering_timeout === null) return;
          
          // Clear any existing timer
          clearBufferingTimer();
          
          bufferingStartTime = startTime;
          bufferingTimer = setTimeout(() => {
            console.log("Buffering/paused timeout reached. Ending trial.");
            response.timeout_reason = "buffering_timeout";
            end_trial();
          }, trial.buffering_timeout);
        }

        function clearBufferingTimer() {
          if (bufferingTimer) {
            clearTimeout(bufferingTimer);
            bufferingTimer = null;
            bufferingStartTime = null;
          }
        }

        // initial playback quality of the video
        function onPlayerReady(event) {
          document.getElementById('ytplayer').style.border = '';
          console.log("Initial playback quality:", player.getPlaybackQuality());
        }

        player = new YT.Player('ytplayer', {
          events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange,
            'onPlaybackQualityChange': onPlaybackQualityChange,
            
          }
        });
        
        // Check if player is initialized
        if (player && player.getIframe) {
          console.log("YT.Player initialized successfully.");
        } else {
          console.log("ERROR: YT.Player initialization failed.");
        }

        // log ytplayer state every n secs 
        var playerInfoStates = []
        var log_playerInfo_interval = setInterval(() => {
          try {
            playerInfoStates.push({
              time_on_client: Date.now(),
              stream_currentTime: player.playerInfo.currentTime,
              isAtLiveHead: player.playerInfo.progressState.isAtLiveHead,
              duration: player.playerInfo.progressState.duration
            })
          } catch (error) {
            console.log("Error on playerInfoStates", error)
          }
        }, trial.log_after_every)
      }

      // start time
      const getTimestamp = () => this.getTimestamp(trial.use_date_now);
      const start_time = getTimestamp();

      // store button response data
      var response = {
        condition: null,
        button: null,
        button_press_time: null,
        button_text: null,
        slider_value: null,
      };
      let multiButtonResponses = []; // Store all button responses if enabled

      // function to end trial and store trial_data
      const end_trial = () => {
        // Reset body background 
        document.body.style.backgroundColor = ""
        // measure rt
        const end_time = getTimestamp();
        const rt = Math.round(end_time - start_time);
        // kill any remaining setTimeout handlers
        this.jsPsych.pluginAPI.clearAllTimeouts();
        clearInterval(log_playerInfo_interval);
        // Clear buffering timer if it exists
        if (typeof clearBufferingTimer !== 'undefined') {
          clearBufferingTimer();
        }

        if (trial.show_slider) {
          const slider = document.getElementById("jspsych-yt-slider");
          if (slider) {
            response.slider_value = slider.value;
          }
        }

        // gather the data to store for the trial
        const trial_data = {
          stimulus: trial.stimulus,
          rt: rt,
          buttonResponse: response,
          trial_duration: trial.trial_duration,
          start_time: start_time,
          end_time: end_time,
          log_after_every: trial.log_after_every,
          playerTimestamps: playerTime,
          playerInfo: playerInfoStates,
          slider_value: response.slider_value,
          multi_button_responses: trial.multi_button_response ? multiButtonResponses : undefined,
          buffering_timeout: trial.buffering_timeout,
          buffering_start_time: bufferingStartTime
        };
        // clear the display
        display_element.innerHTML = "";
        // move on to the next trial
        this.jsPsych.finishTrial(trial_data);
      };

      // function to handle responses by the subject
      function after_response(choice) {
        const buttonText = trial.choices[choice];
        if (trial.multi_button_response) {
          multiButtonResponses.push({
            button_index: parseInt(choice),
            button_text: buttonText,
            timestamp: getTimestamp()
          });
        } else {
          response.button = parseInt(choice);
          response.button_text = buttonText;
          response.button_press_time = getTimestamp();
          // capture slider value if present
          if (trial.show_slider) {
            const slider = document.getElementById("jspsych-yt-slider");
            if (slider) {
              response.slider_value = slider.value;
            }
          }
          // after a valid response, the stimulus will have the CSS class 'responded'
          // which can be used to provide visual feedback that a response was recorded
          display_element.querySelector("#jspsych-html-stream-response-stimulus").className +=
            " responded";
          for (const button of buttonGroupElement.children) {
            button.setAttribute("disabled", "disabled");
          }
          if (trial.response_ends_trial) {
            end_trial();
          }
        }
      }

    // hide stimulus if timing is set
    if (trial.stimulus_duration !== null) {
      const stimulusElement = display_element.querySelector("#jspsych-html-stream-response-stimulus");
      if (stimulusElement) {
        this.jsPsych.pluginAPI.setTimeout(() => {
          // stop the YouTube video
          if (player && typeof player.stopVideo === "function") {
            player.stopVideo();
            console.log("YouTube video stopped.");
          } else {
            console.error("YouTube player is not initialized or stopVideo is not available.");
          }
    
          // hide the video player
          stimulusElement.style.visibility = "hidden";
          console.log("Video player hidden.");
        }, trial.stimulus_duration);
      } else {
        console.error("Element #jspsych-html-stream-response-stimulus not found.");
      }

      const buttons = buttonGroupElement.querySelectorAll("button");
      buttons.forEach((button) => {
        button.style.visibility = "visible"; // Ensure buttons are visible by default
      });
    }

    // CASE 1: Display Next button after desired time interval
    else if (trial.button_disable_time !== null) {
      response.condition = "button_disable_time";
      const buttons = buttonGroupElement.querySelectorAll(".form-btn");
      buttons.forEach((button) => {
        button.style.visibility = "hidden"; // Ensure buttons are hidden initially
      });
      jsPsych.pluginAPI.setTimeout(() => {
        buttons.forEach((button) => {
          button.style.visibility = "visible"; // Make buttons visible after the timeout
        });
      }, trial.button_disable_time);
    }

    // CASE 2: End trial if time limit is set
    else if (trial.trial_duration !== null) {
      response.condition = "trial_duration";
      this.jsPsych.pluginAPI.setTimeout(end_trial, trial.trial_duration);
    }

    // CASE 3: User ends trial by clicking button
    else {
      response.condition = "next_button_default";
      const buttons = buttonGroupElement.querySelectorAll("button");
      buttons.forEach((button) => {
        button.style.visibility = "visible"; // Ensure buttons are visible by default
      });
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

    create_simulation_data(trial, simulation_options) {
      // use Date.now() or performance.now() based on parameter
      const getTimestamp = () => trial.use_date_now ? Date.now() : performance.now();
      const default_data = {
        stimulus: trial.stimulus,
        rt: this.jsPsych.randomization.sampleExGaussian(500, 50, 1 / 150, true),
        buttonResponse:{
          condition: trial.button_disable_time !== null ? "button_disable_time" :
              trial.trial_duration !== null ? "trial_duration" :
                "next_button_default",
        button: this.jsPsych.randomization.randomInt(0, trial.choices.length - 1),
        button_press_time: getTimestamp() + (trial.trial_duration || 1000) // Simulated button press time
        },
        trial_duration: trial.trial_duration,
        start_time: getTimestamp(),
        end_time: getTimestamp() + (trial.trial_duration || 1000), // Simulated end time
        log_after_every: trial.log_after_every,
        playerTimestamps: this.generate_player_timestamps(trial),
        playerInfo: this.generate_player_info(trial),
        buffering_timeout: trial.buffering_timeout,
        buffering_start_time: null
      };
      const data = this.jsPsych.pluginAPI.mergeSimulationData(default_data, simulation_options);
      this.jsPsych.pluginAPI.ensureSimulationDataConsistency(trial, data);
      return data;
    }

    generate_player_timestamps(trial) {
      const states = [];
      let currentTime = trial.use_date_now ? Date.now() : performance.now();
      const stateTypes = ['unstarted', 'ended', 'playing', 'paused', 'buffering', 'cued'];
      const qualityTypes = ['small', 'medium', 'large', 'hd720', 'hd1080', 'highres'];
      const stateCount = Math.floor(Math.random() * 10) + 5; // Random number of events between 5 and 15
    
      for (let i = 0; i < stateCount; i++) {
        currentTime += Math.floor(Math.random() * 100) + 50; // Random time increment between 50 and 150ms
        const stateType = stateTypes[Math.floor(Math.random() * stateTypes.length)];
        const state = { time: currentTime, state: stateType };
    
        // Randomly decide whether to include a quality change
        if (Math.random() > 0.5) {
          const quality = qualityTypes[Math.floor(Math.random() * qualityTypes.length)];
          state.quality = quality;
        }
    
        states.push(state);
        if (stateType === 'ended') break; // Ended event should break the loop
      }
    
      return states;
    }
    
    generate_player_info(trial) {
      const duration = trial.trial_duration || 1000; // Example duration    
      return this.generate_player_info_states(duration, trial.log_after_every, trial.use_date_now);
    }
    
    generate_player_info_states(duration, log_after_every, use_date_now) {
      // Generate simulated player info states
      const playerInfoStates = [];
      let currentTime = use_date_now ? Date.now() : performance.now();
      const startTime = currentTime;
    
      while (currentTime - startTime < duration) {
        playerInfoStates.push({
          time_on_client: currentTime,
          stream_currentTime: currentTime - startTime,
          isAtLiveHead: Math.random() > 0.5, // Random boolean
          duration: duration
        });
        currentTime += log_after_every;
      }
      return playerInfoStates;
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
        this.jsPsych.pluginAPI.clickTarget(display_element.querySelector(`div[data-choice="${data.response}"] button`), data.rt);
      }
    }
  }
  YouTubeResponsePlugin.info = info;

  return YouTubeResponsePlugin;
})(jsPsychModule);