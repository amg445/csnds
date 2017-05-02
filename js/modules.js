var song_url;
var analyzer;

var analyze = require('web-audio-analyser');

require('soundcloud-badge')({
    client_id: '69c7d2345ab042057a4f19617b8028bb'
  , song: 'https://soundcloud.com/itndylan/lemons-dylan'
  , dark: true
  , getFonts: true
}, function(err, src, data, div) {
  if (err) throw err

  song_url = src;
  init()

  console.log(data)
})


function init() {
  var audio  = new Audio
  audio.crossOrigin = 'Anonymous'
  audio.src = song_url
  audio.loop = true
  dogs = true;

  audio.addEventListener('canplay', function() {
    console.log('playing!')
    analyzer = analyze(audio, { audible: true, stereo: false })
    var waves = analyzer.waveform();
    console.log(waves);
    var spec = waves.map(function(m) {
      var val = m/255; return val; });
    audio.play()
  })
}

function updateWebGL(time) {
  gl.clearColor(0.15, 0.2, 0.5, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  if(analyzer){
    var waves = analyzer.waveform();
    var spec = waves.map(function(m) {
      var val = m/255; return val; });
    updateScene(scene, waves, spec, scaleFactor);
  }

  // Update Scene based on song data
  if (fft != null && sound != null && sound.isPlaying()) {
    // Song is playing
    var spectrum = fft.analyze();
    var waveform = fft.waveform();
    updateScene(scene, spectrum, waveform, scaleFactor);

    //var s = Math.abs(fft.waveform()[0]) * 10;
    //scene.particles.scale = [s, s, s];
    //updateToWorldMatrix(scene.particles);
  }

  // Draw Scene
  drawScene(gl, scene);

  // Reschedule the next frame.
  window.requestAnimationFrame(updateWebGL);
}
window.requestAnimationFrame(updateWebGL);
