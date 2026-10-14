/**
 * VideoRecorder: Captures canvas + Web Audio stream in real-time
 * Exports a crisp WebM / MP4 video file.
 */
export class CanvasVideoRecorder {
  constructor(canvas, audioContext, audioSourceNode) {
    this.canvas = canvas;
    this.ctx = audioContext;
    this.sourceNode = audioSourceNode;
    this.recorder = null;
    this.chunks = [];
    this.isRecording = false;
  }

  start(fps = 60, videoBitrate = 12000000) {
    this.chunks = [];

    // Capture WebGL Canvas stream at 60 FPS
    const canvasStream = this.canvas.captureStream(fps);

    // Capture Web Audio stream
    const audioDestination = this.ctx.createMediaStreamDestination();
    if (this.sourceNode) {
      this.sourceNode.connect(audioDestination);
    }

    // Combine tracks
    const combinedStream = new MediaStream([
      ...canvasStream.getVideoTracks(),
      ...audioDestination.stream.getAudioTracks()
    ]);

    let mimeType = 'video/webm;codecs=vp9,opus';
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      mimeType = 'video/webm';
    }

    this.recorder = new MediaRecorder(combinedStream, {
      mimeType,
      videoBitsPerSecond: videoBitrate
    });

    this.recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) {
        this.chunks.push(e.data);
      }
    };

    this.recorder.start(1000); // 1-second chunks
    this.isRecording = true;
    console.log('[VideoRecorder] Recording started at 60 FPS');
  }

  stop() {
    return new Promise((resolve) => {
      if (!this.recorder || !this.isRecording) {
        resolve(null);
        return;
      }

      this.recorder.onstop = () => {
        this.isRecording = false;
        const blob = new Blob(this.chunks, { type: 'video/webm' });
        console.log(`[VideoRecorder] Finished recording. Total size: ${(blob.size / (1024 * 1024)).toFixed(2)} MB`);
        resolve(blob);
      };

      this.recorder.stop();
    });
  }

  download(blob, filename = 'Aether_EP001_Master.webm') {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
