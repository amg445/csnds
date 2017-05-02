require('soundcloud-badge')({
    client_id: '69c7d2345ab042057a4f19617b8028bb'
  , song: 'https://soundcloud.com/upcastmusic/echosmith-cool-kids'
  , dark: true
  , getFonts: true
}, function(err, src, data, div) {
  if (err) throw err

  // Play the song on
  // a modern browser
  var audio = new Audio
  audio.src = src
  audio.play()

  // Metadata related to the song
  // retrieved by the API.
  console.log(data)
})
