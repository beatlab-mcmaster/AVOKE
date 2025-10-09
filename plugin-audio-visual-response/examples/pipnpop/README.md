# Pip and Pop Experiment

This folder contains a classic "pip and pop" audiovisual attention experiment implementation using the AVOKE audio-visual-response plugin.

## What is the Pip and Pop Effect?

The pip and pop effect is a phenomenon in audiovisual perception where a brief sound (a "pip") that occurs simultaneously with a visual change makes that change more salient and easier to detect. The visual change appears to "pop out" from the display when accompanied by sound.

## Experiment Design

### Stimuli
- **Visual**: A 4×4 grid of colored circles that change color over time
- **Audio**: A brief "pip" sound (tone) that may or may not coincide with visual changes

### Conditions
1. **Synchronous**: Sound plays exactly when a target circle changes color
2. **Sound-only**: Sound plays but no visual change occurs at that moment
3. **Visual-only**: A circle changes color but no sound accompanies it

### Task
Participants must identify which circle changed color when they heard the sound. If no circle changed synchronously with the sound, they should indicate "No synchronous change."

## Files

- `index_run.html`: Interactive version of the experiment
- `index_simulate.html`: Automated test/simulation version
- `pip_pop_grid.svg`: Visual stimulus showing the circle grid
- `pip_audio_placeholder.txt`: Instructions for creating the audio stimulus

## Usage

### Running the Experiment
Open `index_run.html` in a web browser. The experiment includes:
- Instructions explaining the task
- Multiple trials with different audiovisual conditions
- Response collection via mouse clicks
- Results display at the end

### Testing/Simulation
Open `index_simulate.html` to run automated tests that verify:
- Plugin functionality
- Stimulus loading
- Response recording
- Timing accuracy

## Audio File Requirements

You'll need to create a `pip.wav` file containing a brief (50-100ms) tone. This can be:
- A sine wave at ~1000Hz
- A brief "beep" or "click" sound
- Generated using audio software like Audacity

## Expected Results

Participants typically show:
- **Faster responses** when sound and visual change are synchronous
- **Higher accuracy** in identifying the target circle when sound is present
- **More false alarms** (incorrect detections) in sound-only trials
- Demonstration of cross-modal attention and temporal binding

This experiment is useful for studying:
- Audiovisual integration
- Cross-modal attention
- Temporal binding
- Multisensory processing
