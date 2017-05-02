var song_url;

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

  audio.addEventListener('canplay', function() {
    console.log('playing!')
    analyser = analyze(audio, { audible: true, stereo: false })
    audio.play()
    console.log(analyser);
  })
}
