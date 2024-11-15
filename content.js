import * as tf from '@tensorflow/tfjs';

// Check if the script has already been injected
if (!window.twitchVocalFilterInitialized) {
    window.twitchVocalFilterInitialized = true;
  
    let audioContext, sourceNode, gainNode;
  
    // Function to initialize the audio context and processing
    async function setupAudioProcessing(videoElement) {
      if (!videoElement) return;
  
      // Create a new AudioContext only if it doesn't exist
      if (!audioContext) {
        audioContext = new AudioContext();
        window.audioContext = audioContext;
      }
  
      // Resume AudioContext if it's suspended (necessary for autoplay policy)
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }
  
      // Avoid re-creating the source node if it already exists
      if (!sourceNode) {
        try {
          // Create MediaElementSourceNode
          sourceNode = audioContext.createMediaElementSource(videoElement);
          gainNode = audioContext.createGain();
          gainNode.gain.value = 1.0; // Set gain to normal level
  
          // Connect the nodes: source -> gain -> destination
          sourceNode.connect(gainNode).connect(audioContext.destination);
          console.log("Audio processing setup complete");
        } catch (error) {
          console.error("Error creating MediaElementSourceNode:", error);
          return;
        }
      }
    }
  
    // Function to observe changes in the DOM for the Twitch player
    function observeTwitchPlayer() {
      const observer = new MutationObserver(() => {
        const videoElement = document.querySelector('video');
  
        // Check if the video element exists and is currently playing
        if (videoElement && !videoElement.audioSetup) {
          videoElement.addEventListener('playing', () => setupAudioProcessing(videoElement), { once: true });
          videoElement.audioSetup = true; // Mark it as processed
        }
      });
  
      // Start observing the Twitch player container
      observer.observe(document.body, { childList: true, subtree: true });
    }
  
    // Function to wait for user interaction to unlock audio (for autoplay policy)
    function enableAudioOnInteraction() {
      if (audioContext && audioContext.state === 'suspended') {
        audioContext.resume();
        console.log('AudioContext resumed due to user interaction');
      }
    }
  
    // Listen for user interactions to activate audio
    window.addEventListener('click', enableAudioOnInteraction);
    window.addEventListener('keydown', enableAudioOnInteraction);
  
    // Start observing the Twitch player
    observeTwitchPlayer();
  }
  