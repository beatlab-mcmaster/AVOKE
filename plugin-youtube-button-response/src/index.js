var jsPsychYouTubeButtonResponse = (function (jspsych) {
  "use strict";

  const info = {
    name: "youtube-button-response",
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
        // type: jspsych.ParameterType.HTML_STRING,
        // pretty_name: "Button HTML",
        // default: ['<button class="form-btn">%choice%</button>'],
        // array: true,
        type: jspsych.ParameterType.FUNCTION,
        default: function (choice, choice_index) {
          return '<button class="form-btn" id="button-' + choice_index + '" style="visibility: hidden;">' + choice + '</button>';        },
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
        default: 5,
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
    },
  };

  /**
   * **youtube-button-response**
   *
   * jsPsych plugin for displaying a YouTube stream or video and getting a button response
   * 
   * 
   * @author Shreshth Saxena, Jackson Shi
   * 
   * @see {@link https://github.com/beatlab-mcmaster/AVOKE/blob/main/plugin-youtube-button-response/docs/jspsych-youtube-button-response.md}
   */
  class YouTubeButtonResponsePlugin {
    constructor(jsPsych) {
      this.jsPsych = jsPsych;
    }

    trial(display_element, trial) {
      // Define HTML 
      document.body.style.backgroundColor = trial.background_color;
      const controls_param = trial.controls ? '1' : '0';
      const autoplay_param = trial.autoplay ? '1' : '0';
      const mute_param = trial.mute ? '1' : '0';
      const pointer_events = trial.pointer_events ? 'auto' : 'none';

      let html = `<div id="jspsych-html-stream-response-stimulus" style="background-color: #FFF"> 
      <iframe id="ytplayer" src="${trial.stimulus}?enablejsapi=1&controls=${controls_param}&autoplay=${autoplay_param}&mute=${mute_param}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media;" style="pointer-events: ${pointer_events}; position: absolute; width:100%; height:93%; top:0; left:0;">
      </iframe>`;
      html += "</div>";

      // display buttons
      // let buttons = [];
      // if (Array.isArray(trial.button_html)) {
      //   if (trial.button_html.length == trial.choices.length) {
      //     buttons = trial.button_html;
      //   } else {
      //     console.error("Error in html-stream-response plugin. The length of the button_html array does not equal the length of the choices array");
      //   }
      // } else {
      //   for (let i = 0; i < trial.choices.length; i++) {
      //     buttons.push(trial.button_html);
      //   }
      // }
      // for (let i = 0; i < trial.choices.length; i++) {
      //   let str = buttons[i].replace(/%choice%/g, trial.choices[i]);
      //   html +=
      //     '<div class="form-btn" style="border: none; visibility:hidden; right: 0; bottom: 0; position: absolute;" id="jspsych-html-stream-response-button-' +
      //     i +
      //     '" data-choice="' +
      //     i +
      //     '">' +
      //     str +
      //     "</div>";
      // }

      // show prompt if there is one
      if (trial.prompt !== null) {
        html += `<div style="left:0; bottom: 0; position: absolute;">` + trial.prompt + `</div>`;
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

      // Check if YT API is loaded correctly
      var player;
      var playerTime = [];
      if (YT == null) {
        console.log("ERROR: YT API has not loaded properly.")
      } else {
        console.log("YT API loaded", YT)

        // Define player event listeners

        // Return the current playback quality of the video on every change
        function onPlaybackQualityChange(event) {
          var playbackQuality = event.target.getPlaybackQuality();
          console.log("Playback quality changed to:", playbackQuality);
          playerTime.push({ time: Date.now(), quality: playbackQuality })
        }

        // Return the current state of the player on every change
        function onPlayerStateChange(event) {
          const playerStatus = event.data
          if (playerStatus == -1) {
            playerTime.push({ time: Date.now(), state: "unstarted" })
          } else if (playerStatus == 0) {
            playerTime.push({ time: Date.now(), state: "ended" })
          } else if (playerStatus == 1) {
            playerTime.push({ time: Date.now(), state: "playing" })
          } else if (playerStatus == 2) {
            playerTime.push({ time: Date.now(), state: "paused" })
          } else if (playerStatus == 3) {
            playerTime.push({ time: Date.now(), state: "buffering" })
          } else if (playerStatus == 5) {
            playerTime.push({ time: Date.now(), state: "cued" })
          }
          console.log("Event triggered: ", playerTime[playerTime.length - 1]["state"]);
        }

        // Return the initial playback quality of the video
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
        }, trial.log_after_every*1000)
      }

      // start time
      const start_time = performance.now();
      // add event listeners to buttons
      // for (let i = 0; i < trial.choices.length; i++) {
      //   display_element
      //     .querySelector("#jspsych-html-stream-response-button-" + i)
      //     .addEventListener("click", (e) => {
      //       let btn_el = e.currentTarget;
      //       let choice = btn_el.getAttribute("data-choice"); // don't use dataset for jsdom compatibility
      //       after_response(choiceIndex);
      //     });
      // }

      // store button response data
      var response = {
        condition: null,
        button: null,
        button_press_time: null,
      };

      // function to end trial and store trial_data
      const end_trial = () => {
        // Reset body background 
        document.body.style.backgroundColor = ""
        // measure rt
        const end_time = performance.now();
        const rt = Math.round(end_time - start_time);
        // kill any remaining setTimeout handlers
        this.jsPsych.pluginAPI.clearAllTimeouts();
        clearInterval(log_playerInfo_interval)
        // gather the data to store for the trial
        const trial_data = {
          stimulus: trial.stimulus,
          rt: rt,
          buttonResponse: response,
          playerTimestamps: playerTime,
          playerInfo: playerInfoStates,
        };
        // clear the display
        display_element.innerHTML = "";
        // move on to the next trial
        this.jsPsych.finishTrial(trial_data);
      };

      // function to handle responses by the subject
      function after_response(choice) {
        response.button = parseInt(choice);
        response.button_press_time = Date.now();
        // after a valid response, the stimulus will have the CSS class 'responded'
        // which can be used to provide visual feedback that a response was recorded
        display_element.querySelector("#jspsych-html-stream-response-stimulus").className +=
          " responded";
        // disable all the buttons after a response
        // let btns = document.querySelectorAll(".jspsych-html-stream-response-button");
        // for (let i = 0; i < btns.length; i++) {
        //   //btns[i].removeEventListener('click');
        //   btns[i].setAttribute("disabled", "disabled");
        // }
        for (const button of buttonGroupElement.children) {
          button.setAttribute("disabled", "disabled");
        }
        if (trial.response_ends_trial) {
          end_trial();
        }
      }

    // Hide stimulus if timing is set
    if (trial.stimulus_duration !== null) {
      const stimulusElement = display_element.querySelector("#jspsych-html-stream-response-stimulus");
      if (stimulusElement) {
        this.jsPsych.pluginAPI.setTimeout(() => {
          // Stop the YouTube video
          if (player && typeof player.stopVideo === "function") {
            player.stopVideo();
            console.log("YouTube video stopped.");
          } else {
            console.error("YouTube player is not initialized or stopVideo is not available.");
          }
    
          // Hide the video player
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
      const default_data = {
        stimulus: trial.stimulus,
        rt: this.jsPsych.randomization.sampleExGaussian(500, 50, 1 / 150, true),
        buttonResponse:{
          condition: trial.button_disable_time !== null ? "button_disable_time" :
              trial.trial_duration !== null ? "trial_duration" :
                "next_button_default",
        button: this.jsPsych.randomization.randomInt(0, trial.choices.length - 1),
        button_press_time: Date.now() + (trial.trial_duration || 1000) // Simulated button press time
        },
        playerTimestamps: this.generate_player_timestamps(trial),
        playerInfo: this.generate_player_info(trial)
      };
      const data = this.jsPsych.pluginAPI.mergeSimulationData(default_data, simulation_options);
      this.jsPsych.pluginAPI.ensureSimulationDataConsistency(trial, data);
      return data;
    }

    generate_player_timestamps(trial) {
      const states = [];
      let currentTime = Date.now();
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
      return this.generate_player_info_states(duration);
    }
    
    generate_player_info_states(duration) {
      // Generate simulated player info states
      const playerInfoStates = [];
      let currentTime = Date.now();
      const startTime = currentTime;
    
      while (currentTime - startTime < duration) {
        playerInfoStates.push({
          time_on_client: currentTime,
          stream_currentTime: currentTime - startTime,
          isAtLiveHead: Math.random() > 0.5, // Random boolean
          duration: duration
        });
        currentTime += 33; // Log state every 33ms
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
  YouTubeButtonResponsePlugin.info = info;

  return YouTubeButtonResponsePlugin;
})(jsPsychModule);