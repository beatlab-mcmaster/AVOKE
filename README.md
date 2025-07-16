# "AVOKE: an open-source web-based experimentation toolbox for evoking audiovisual responses"

**Contributors:** Jackson Shi, Shreshth Saxena, Lauren Fink

## Demo
Example trials for each plugin and extension. 

<a href="https://beatlab-mcmaster.github.io/AVOKE/">View Demo </a>

## About the project
As web-based experiments become increasingly popular, the need for accessible, efficient research methods is greater than ever. However, current open-source frameworks sometimes lack detailed documentation, leaving many novice researchers struggling to create their experiments without significant time investments in learning the required technical skills. To meet this demand and further the capabilities of web-based experiments, we propose AVOKE—a diverse set of experimentation plugins and extensions built on top of jsPsych, an open-source JavaScript library for web-based behavioural experiments. AVOKE includes the code and documentation needed for novice researchers to easily integrate a variety of audiovisual stimuli in their experiments. Currently, AVOKE supports temporally-precise presentation of audiovisual stimuli (e.g., external media sources like YouTube, moving objects, etc.), as well as the collection of behavioural responses, like keypresses and video capture (e.g., for recording face videos or participants). All features have been developed according to jsPsych standards and validated through numerous tests developed in Jest—an established open-source JavaScript testing framework.  

Upon finalization, we plan to integrate AVOKE into the official jsPsych library. As an open-source package, we hope for others to contribute to AVOKE as we continue to push the boundaries of web-based audiovisual experiments.

## Documentation
The `docs` folder for each plugin or extension contains its own README file documenting usage. These docs are also linked below for easy reference: 

<a href="https://github.com/beatlab-mcmaster/AVOKE/blob/main/extension-video-capture/docs/jspsych-video-capture.md">extension-video-capture </a>

<a href="https://github.com/beatlab-mcmaster/AVOKE/blob/main/plugin-audio-visual-button-response/docs/jspsych-audio-visual-response.md">plugin-audiovisual-response </a>

<a href="https://github.com/beatlab-mcmaster/AVOKE/blob/main/plugin-stimulus-matrix-display/docs/jspsych-stimulus-matrix-display.md">plugin-stimulus-matrix-display</a>

<a href="https://github.com/beatlab-mcmaster/AVOKE/blob/main/plugin-path-animation-display/docs/jspsych-path-animation-display.md">plugin-path-animation-display </a>

<a href="https://github.com/beatlab-mcmaster/AVOKE/blob/main/plugin-video-capture-setup/docs/jspsych-video-capture-setup.md">plugin-video-capture-setup </a>

<a href="https://github.com/beatlab-mcmaster/AVOKE/blob/main/plugin-youtube-button-response/docs/jspsych-youtube-button-response.md">plugin-youtube-button-response </a>

## Example Stimuli

AVOKE examples use standardized research databases to ensure reproducibility and scientific validity:

### Face Stimuli
- **Chicago Face Database (CFD)**: A validated set of high-resolution face photographs with norming data
  - Citation: Ma, D. S., Correll, J., & Wittenbrink, B. (2015). The Chicago face database: A free stimulus set of faces and norming data. *Behavior Research Methods*, 47(4), 1122-1135.
  - Available at: https://www.chicagofacedb.org/

### Visual Stimuli  
- **The Unexpected Visitor**: Oil on canvas painting by Ilya Rezpin, 1884–88. 
  - Available through: www.ilyarepin.org/

- **International Affective Picture System (IAPS)**: Standardized emotional images for research
  - Citation: Lang, P. J., Bradley, M. M., & Cuthbert, B. N. (2008). International affective picture system (IAPS): Affective ratings of pictures and instruction manual. *Technical Report A-8*, University of Florida, Gainesville, FL.
  - Available through: https://csea.phhp.ufl.edu/media.html

**Note**: Researchers should obtain proper licenses for these databases before using them in their studies. The example file names provided in AVOKE are for demonstration purposes only.

## Citation

This repository contains a [CITATION.cff](./CITATION.cff) file. If you use this project, please cite it using the information in the file or use the "Cite this repository" button on GitHub for citation info.
