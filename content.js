if (!window.twitchVocalFilterInitialized) {
  window.twitchVocalFilterInitialized = true;

  let audioContext, sourceNode, analyserNode;
  let bandpassFilters = [];
  let gainNodes = [];
  let analysisInterval;
  const initialAnalysisTime = 10 * 1000; // 10 seconds for analysis

  console.log("🔄 Twitch Vocal Filter: Initializing...");

  // Setup Audio Processing
  async function setupAudioProcessing(videoElement) {
    console.log("🎧 Setting up audio processing...");
    if (!videoElement) {
      console.warn("⚠️ No video element found");
      return;
    }

    if (!audioContext) {
      console.log("🎚️ Creating a new AudioContext...");
      audioContext = new AudioContext();
    }

    if (audioContext.state === 'suspended') {
      console.log("⏸️ AudioContext suspended. Resuming...");
      await audioContext.resume();
    }

    try {
      // Create source node from the video element
      sourceNode = audioContext.createMediaElementSource(videoElement);
      analyserNode = audioContext.createAnalyser();
      analyserNode.fftSize = 8192; // Increased for better resolution
      console.log("🔍 Analyser node created with FFT size:", analyserNode.fftSize);

      // Create 20 bandpass filters across the range of 100 Hz to 20,000 Hz
      const numBands = 20;
      const minFrequency = 100; // Minimum frequency for the first band
      const maxFrequency = 20000; // Maximum frequency for the last band
      const frequencyStep = (maxFrequency - minFrequency) / numBands;

      console.log(`🎛️ Creating ${numBands} bandpass filters...`);
      for (let i = 0; i < numBands; i++) {
        const filter = audioContext.createBiquadFilter();
        const gainNode = audioContext.createGain();
        filter.type = 'bandpass';
        filter.frequency.value = minFrequency + i * frequencyStep;
        filter.Q.value = 1.5; // Bandwidth control

        // Connect filter to its own gain node
        filter.connect(gainNode);
        gainNodes.push(gainNode);

        bandpassFilters.push(filter);
        console.log(`🔊 Filter ${i + 1} created with center frequency: ${filter.frequency.value.toFixed(2)} Hz`);
      }

      // Connect each filter in parallel from the source
      bandpassFilters.forEach((filter, index) => {
        sourceNode.connect(filter);
        gainNodes[index].connect(audioContext.destination);
      });

      // Connect source to analyser for frequency analysis
      sourceNode.connect(analyserNode);
      console.log("🔗 Audio routing complete");

      // Start the frequency analysis process
      analyzeFrequencies();
    } catch (error) {
      console.error("Error setting up audio nodes:", error);
    }
  }

  // Analyze Frequencies for 10 seconds and adjust gains
  function analyzeFrequencies() {
    console.log("🔍 Starting frequency analysis...");
    const frequencyData = new Uint8Array(analyserNode.frequencyBinCount);

    let analysisDuration = 0;
    const analysisTimer = setInterval(() => {
      analyserNode.getByteFrequencyData(frequencyData);
      let maxAmplitude = 0;
      let dominantFrequency = 0;

      // Find the dominant frequency and check energy in each band
      let bandEnergy = new Array(bandpassFilters.length).fill(0);

      for (let i = 0; i < frequencyData.length; i++) {
        // Identify which frequency band this index belongs to
        const freqBin = i * (audioContext.sampleRate / 2) / frequencyData.length;

        // Increase energy count for relevant frequency bands
        for (let j = 0; j < bandpassFilters.length; j++) {
          const filterFreq = bandpassFilters[j].frequency.value;
          const bandWidth = 200; // Bandwidth of 200 Hz for each filter
          if (Math.abs(freqBin - filterFreq) < bandWidth) {
            bandEnergy[j] += frequencyData[i];
          }
        }
      }

      // Find the band with maximum energy
      const maxEnergyBand = bandEnergy.indexOf(Math.max(...bandEnergy));
      const dominantFrequencyBand = bandpassFilters[maxEnergyBand].frequency.value;
      console.log(`Dominant frequency band: ${dominantFrequencyBand.toFixed(2)} Hz`);

      analysisDuration += 500; // Increment by 500ms
      if (analysisDuration >= initialAnalysisTime) {
        clearInterval(analysisTimer);
        console.log("✅ Frequency analysis complete. Adjusting gains...");
        
        // Adjust gains based on the analysis of dominant frequencies
        adjustGainBasedOnAnalysis(dominantFrequencyBand);
      }
    }, 500);
  }

  // Adjust gain nodes based on dominant frequency
  function adjustGainBasedOnAnalysis(dominantFrequency) {
    bandpassFilters.forEach((filter, index) => {
      const gainNode = gainNodes[index];
      const freq = filter.frequency.value;

      // Keep speech frequencies intact (around 100 Hz - 3 kHz)
      if (freq >= 100 && freq <= 3000) {
        gainNode.gain.value = 1.0;
        console.log(`🎚️ Keeping gain for band ${index + 1} at ${freq} Hz (speech range)`);
      } else {
        // Reduce gain for non-dominant frequencies
        if (Math.abs(freq - dominantFrequency) < 300) {
          gainNode.gain.value = 1.0; // Maintain dominant band
          console.log(`🎚️ Keeping gain for band ${index + 1} at ${freq} Hz`);
        } else {
          gainNode.gain.value = 0.05; // Aggressively filter out other frequencies
          console.log(`🔉 Reducing gain for band ${index + 1} at ${freq} Hz`);
        }
      }
    });
  }

  // Setup listener for enabling/disabling from popup
  chrome.runtime.onMessage.addListener((message) => {
    if (message.action === 'enableVocalIsolation') {
      console.log('🎛️ Vocal Isolation Enabled');
      const videoElement = document.querySelector('video');
      setupAudioProcessing(videoElement);
    } else if (message.action === 'disableVocalIsolation') {
      console.log('🛑 Vocal Isolation Disabled');
      if (audioContext) {
        audioContext.close();
        window.twitchVocalFilterInitialized = false;
      }
    }
  });
}
