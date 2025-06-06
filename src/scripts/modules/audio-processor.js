class AudioProcessor extends AudioWorkletProcessor {
  process(inputs) {
      const input = inputs[0][0];
      if (input) this.port.postMessage({ buffer: input });
      return true;
  }
}
registerProcessor('audio-processor', AudioProcessor);