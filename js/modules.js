var song_url;


function getSongFromURL() {
  var hash = window.location.hash;
  var song = hash.substring(1);

  if (song == "") {
    song = 'https://soundcloud.com/lidogotsongs/feel-it-still-lido-remix';
  }

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
$('.js-pause').on('click', function() {
  var status = $(this).text();
   if(Audio && status == "Pause"){
     audio.pause();
     this.innerHTML = 'Play';
   }
   else if (status == "Play"){
     audio.play();
     this.innerHTML = 'Pause';
   }
 });

var song = getSongFromURL();

require('soundcloud-badge')({
    client_id: '69c7d2345ab042057a4f19617b8028bb'
  , song: song
  , dark: true
  , getFonts: true
}, function(err, src, data, div) {
  if (err) { 
    alert("Error: Unable to load song.  Please note that some Soundcloud songs have playback disabled on other sites.");
  }

  song_url = src;
  init()

})

var init = function() {
  audio  = new Audio
  audio.crossOrigin = 'Anonymous'
  audio.src = song_url
  audio.loop = true
  audio.controls = true
  document.body.appendChild(audio);

  var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  analyser = audioCtx.createAnalyser();

  var source = audioCtx.createMediaElementSource(audio);
  source.connect(analyser);

  analyser.fftSize = 2*bins;
  analyser.smoothingTimeConstant = smoothing;
  bufferLength = analyser.frequencyBinCount;
  waveArray = new Uint8Array(bufferLength);
  freqArray = new Uint8Array(bufferLength);

  source.connect(audioCtx.destination);
  canPlay = true;
  audio.play();

}
