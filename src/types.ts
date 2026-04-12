export interface CaptureSettings {
  readonly tags: readonly string[];
  readonly defaultTag: string;
  readonly audioFolder: string;
  readonly dailyNoteFolder: string;
  readonly audioFormat: "webm" | "mp4";
  readonly language: "en" | "zh";
}

export const DEFAULT_SETTINGS: CaptureSettings = {
  tags: ["idea", "diary", "meeting"],
  defaultTag: "idea",
  audioFolder: "Audio/inbox",
  dailyNoteFolder: "Journal",
  audioFormat: "webm",
  language: "en",
};

export type RecordingState = "idle" | "recording" | "done";
