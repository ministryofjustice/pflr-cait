// https://developers.google.com/youtube/iframe_api_reference
jQuery(function () {
  const videos = jQuery('[type=video] iframe')
  if (videos.length) {
    const iframeAPI = document.createElement('script')
    iframeAPI.src = 'https://www.youtube.com/iframe_api'
    const firstScriptElement = document.getElementsByTagName('script')[0]
    firstScriptElement.parentNode.insertBefore(iframeAPI, firstScriptElement)

    const eventState = {
      '0': 'end',
      '1': 'play'
    }
    const onPlayerStateChange = function (event) {
      let eventName = eventState[event.data]
      const videoId = this.id
      if (eventName) {
        if (eventName === 'play') {
          const currentTime = parseInt(window.ytplayers[videoId].getCurrentTime(), 10)
          if (!currentTime) {
            eventName = 'start'
          }
        }

        ga('send', 'event', {
          eventCategory: 'video',
          eventAction: videoId,
          eventLabel: eventName
        })
      }
    }
    window.onYouTubeIframeAPIReady = function () {
      window.ytplayers = {}
      videos.each(function (index, video) {
        window.ytplayers[video.id] = new YT.Player(video.id, {
          events: {
            onStateChange: onPlayerStateChange.bind(video)
          }
        })
      })
    }
  }
})
