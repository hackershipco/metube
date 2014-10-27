var _run, makeVideoPlayer
$(function() {
  window.ytPlayerLoaded = false;
  makeVideoPlayer = function(video) {
    var player_wrapper;
    if (!window.ytPlayerLoaded) {
      player_wrapper = $('#player-wrapper');
      player_wrapper.append('<div id="ytPlayer"><p>Loading player...</p></div>');
      window.ytplayer = new YT.Player('ytPlayer', {
        width: '100%',
        height: player_wrapper.width() / 1.777777777,
        videoId: video,
        playerVars: {
          wmode: 'opaque',
          autoplay: 0,
          modestbranding: 1
        },
        events: {
          'onReady': function() {
            return window.ytPlayerLoaded = true;
            window.ytplayer.playVideo();
          },
          'onError': function(errorCode) {
            return alert("We are sorry, but the following error occured: " + errorCode);
          }
        }
      });
    } else {
      window.ytplayer.loadVideoById(video);
      window.ytplayer.pauseVideo();
    }
  };
});



_run = function() {
  $('.preview').first().click();
};

google.setOnLoadCallback(_run);

$('.preview').click(function() {
  return makeVideoPlayer($(this).data('uid'));
});
