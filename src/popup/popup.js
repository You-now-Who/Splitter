document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('start').addEventListener('click', function() {
        navigator.mediaDevices.getUserMedia({ audio: true, video: false })
            .then(function(stream) {
                var audio = document.getElementById('audio');
                audio.srcObject = stream;
                audio.onloadedmetadata = function(e) {
                    audio.play();
                };
            })
            .catch(function(err) {
                console.log(err.name + ": " + err.message);
            });
    });
  });
  