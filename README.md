# CS 4621 - Music Visualizer

Final project for CS 4621 @ Cornell.

### Changes Since Project Submitted
- Made canvas responsive, so the projection matrix and background will update when window is resized.
- Fixed shadow block artifacts bug (although there's still a small bug where black spots pop up in the lighter themes).

### To Run
Should run out of the box.  Runs best on latest version of Chrome locally.  Requires internet connection to play music, better internet connection will allow for better performance.

To rebuild `js/modules.js`:
`npm install -g browserify`
`npm install soundcloud-badge`
`make`


### Website
Project hosted at <a href="https://amg445.github.io/cs4621_final/">https://amg445.github.io/cs4621_final/</a>


### Note
Not all soundcloud songs work for some reason.  There is a known error in our vizualization where shadow block artifacts appear.  However, this has only been observed on certain computers.
