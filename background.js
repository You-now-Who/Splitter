chrome.runtime.onMessage.addListener(async (message) => {
    if (message.audioContext) {
      // Initialize TensorFlow.js model for vocal isolation
    //   const model = await tf.loadLayersModel('model/vocal-isolation/model.json');
  
      // Process the audio stream here
      // Example: Use an AnalyserNode to grab real-time audio data
    }
  });
  