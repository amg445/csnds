var song_url;
var audio;

var analyze = require('web-audio-analyser');


function getSongFromURL() {
  var hash = window.location.hash;
  var song = hash.substring(1);

  if (song == "") {
    song = 'https://soundcloud.com/verzache/conscious';
  }

  console.log(song);

  $('#js-songs option').each(function(){
    var val = this.value;
    if (val == song) {
      this.selected = true;
    }
  })
  return song;
}

//TODO: Make it play again...
// only pauses for now bc its annoying listen to 1000 times
$('#js-pause').on('click', function() { console.log('p'); if(Audio){audio.pause();} });

var song = getSongFromURL();

require('soundcloud-badge')({
    client_id: '69c7d2345ab042057a4f19617b8028bb'
  , song: song
  , dark: true
  , getFonts: true
}, function(err, src, data, div) {
  if (err) throw err

  song_url = src;
  init()

})


function init() {
  audio  = new Audio
  audio.crossOrigin = 'Anonymous'
  audio.src = song_url
  audio.loop = true
  dogs = true;

  audio.addEventListener('canplay', function() {
    console.log('playing!')
    analyzer = analyze(audio, { audible: true, stereo: false })
    var waves = analyzer.waveform();
    var spec = waves.map(function(m) {
      var val = m/255; return val; });
    audio.play()
  })
}

// function updateWebGL(time) {
//   gl.clearColor(0.13, 0.13, 0.13, 1.0);
//   gl.clear(gl.COLOR_BUFFER_BIT);
//
//   if(analyzer){
//     var waves = analyzer.waveform();
//     var spec = waves.map(function(m) {
//       var val = m/255; return val; });
//     console.log(spec);
//     updateScene(scene, waves, spec, scaleFactor,threshold);
//   }
//
//   // Update Scene based on song data
//   if (fft != null && sound != null && sound.isPlaying()) {
//     // Song is playing
//     var spectrum = fft.analyze();
//     console.log(spectrum);
//     var waveform = fft.waveform();
//     updateScene(scene, spectrum, waveform, scaleFactor,threshold);
//
//     //var s = Math.abs(fft.waveform()[0]) * 10;
//     //scene.particles.scale = [s, s, s];
//     //updateToWorldMatrix(scene.particles);
//   }
//
//   // Draw Scene
//   drawScene(gl, scene);
//
//   // Reschedule the next frame.
//   window.requestAnimationFrame(updateWebGL);
// }
// window.requestAnimationFrame(updateWebGL);
