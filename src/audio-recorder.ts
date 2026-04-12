import { type RecordingState } from "./types";

export class AudioRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private chunks: Blob[] = [];
  private stream: MediaStream | null = null;
  private startTime = 0;
  private timerHandle = 0;

  state: RecordingState = "idle";
  elapsed = 0;
  audioBlob: Blob | null = null;

  private readonly onStateChange: () => void;

  constructor(onStateChange: () => void) {
    this.onStateChange = onStateChange;
  }

  async start(): Promise<void> {
    this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
      ? "audio/webm;codecs=opus"
      : "audio/mp4";

    this.mediaRecorder = new MediaRecorder(this.stream, { mimeType });
    this.chunks = [];

    this.mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) this.chunks.push(e.data);
    };

    this.mediaRecorder.onstop = () => {
      this.audioBlob = new Blob(this.chunks, {
        type: this.mediaRecorder?.mimeType ?? "audio/webm",
      });
      this.state = "done";
      this.stopTimer();
      this.releaseStream();
      this.onStateChange();
    };

    this.mediaRecorder.start(1000);
    this.startTime = Date.now();
    this.elapsed = 0;
    this.state = "recording";
    this.startTimer();
    this.onStateChange();
  }

  stop(): void {
    if (this.mediaRecorder?.state === "recording") {
      this.mediaRecorder.stop();
    }
  }

  reset(): void {
    this.audioBlob = null;
    this.elapsed = 0;
    this.state = "idle";
    this.stopTimer();
    this.releaseStream();
    this.onStateChange();
  }

  destroy(): void {
    this.stopTimer();
    this.releaseStream();
    if (this.mediaRecorder?.state === "recording") {
      this.mediaRecorder.stop();
    }
  }

  getExtension(): string {
    const mime = this.mediaRecorder?.mimeType ?? "audio/webm";
    return mime.includes("mp4") ? "m4a" : "webm";
  }

  formatElapsed(): string {
    const mins = Math.floor(this.elapsed / 60);
    const secs = this.elapsed % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }

  private startTimer(): void {
    this.timerHandle = window.setInterval(() => {
      this.elapsed = Math.floor((Date.now() - this.startTime) / 1000);
      this.onStateChange();
    }, 1000);
  }

  private stopTimer(): void {
    if (this.timerHandle) {
      window.clearInterval(this.timerHandle);
      this.timerHandle = 0;
    }
  }

  private releaseStream(): void {
    this.stream?.getTracks().forEach((t) => t.stop());
    this.stream = null;
  }
}
