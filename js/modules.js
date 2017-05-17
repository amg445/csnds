var song_url;


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
$('.js-pause').on('click', function() {
  var status = $(this).text();
  console.log(status);
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
  if (err) throw err

  song_url = src;
  init()

})


function init() {
  audio  = new Audio
  audio.crossOrigin = 'Anonymous'
  audio.src = song_url
  audio.loop = true
  document.body.appendChild(audio);


  audio.addEventListener('canplay', function() {
    console.log('playing!');
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
  })
}
