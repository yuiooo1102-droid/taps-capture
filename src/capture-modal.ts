import { Modal, Notice, setIcon, TFile, type App } from "obsidian";
import { AudioRecorder } from "./audio-recorder";
import { t } from "./i18n";
import type CapturePlugin from "./main";

export class CaptureModal extends Modal {
  private plugin: CapturePlugin;
  private recorder: AudioRecorder;
  private selectedTag: string;

  private textArea: HTMLTextAreaElement | null = null;
  private audioSection: HTMLElement | null = null;
  private tagContainer: HTMLElement | null = null;
  private submitBtn: HTMLButtonElement | null = null;

  constructor(app: App, plugin: CapturePlugin) {
    super(app);
    this.plugin = plugin;
    this.selectedTag = plugin.settings.defaultTag;
    this.recorder = new AudioRecorder(() => this.renderAudioSection());
  }

  onOpen(): void {
    this.blurInput();

    const { contentEl } = this;
    contentEl.addClass("taps-capture-modal");

    contentEl.createEl("h3", { text: t("quickCapture") });

    const inputGroup = contentEl.createDiv({ cls: "taps-input-group" });

    this.textArea = inputGroup.createEl("textarea", {
      cls: "taps-textarea",
      attr: { placeholder: t("placeholder"), rows: "3" },
    });

    this.audioSection = inputGroup.createDiv({ cls: "taps-audio-section" });
    this.renderAudioSection();

    this.tagContainer = contentEl.createDiv({ cls: "taps-tag-container" });
    this.renderTags();

    this.submitBtn = contentEl.createEl("button", {
      text: t("save"),
      cls: "taps-submit-btn",
    });
    this.submitBtn.addEventListener("click", () => {
      this.blurInput();
      void this.handleSubmit();
    });

    this.textArea.addEventListener("input", () => this.updateSubmitState());
  }

  private blurInput(): void {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  }

  onClose(): void {
    this.recorder.destroy();
    this.contentEl.empty();
  }

  private updateSubmitState(): void {
    if (!this.submitBtn) return;
    const hasText = (this.textArea?.value.trim().length ?? 0) > 0;
    const hasAudio = this.recorder.audioBlob !== null;
    this.submitBtn.toggleClass("taps-submit-active", hasText || hasAudio);
  }

  private renderAudioSection(): void {
    const el = this.audioSection;
    if (!el) return;
    el.empty();

    const { state } = this.recorder;

    if (state === "idle") {
      const btn = el.createEl("button", { cls: "taps-audio-btn" });
      const iconEl = btn.createSpan({ cls: "taps-btn-icon" });
      setIcon(iconEl, "mic");
      btn.createSpan({ text: t("record"), cls: "taps-btn-text" });
      btn.addEventListener("click", () => { void this.startRecording(); });
    }

    if (state === "recording") {
      const col = el.createEl("button", { cls: "taps-recording-col" });

      col.createEl("span", { cls: "taps-recording-pulse" });

      col.createEl("span", {
        cls: "taps-recording-label",
        text: this.recorder.formatElapsed(),
      });

      col.createEl("span", { cls: "taps-stop-hint", text: t("stop") });
      col.addEventListener("click", () => this.recorder.stop());
    }

    if (state === "done") {
      const col = el.createDiv({ cls: "taps-done-col" });

      const iconEl = col.createSpan({ cls: "taps-done-icon" });
      setIcon(iconEl, "volume-2");

      col.createEl("span", {
        cls: "taps-done-label",
        text: this.recorder.formatElapsed(),
      });

      const actions = col.createDiv({ cls: "taps-done-actions" });

      const deleteBtn = actions.createEl("button", {
        cls: "taps-icon-btn",
        attr: { "aria-label": t("deleteRecording") },
      });
      setIcon(deleteBtn, "trash-2");
      deleteBtn.addEventListener("click", () => this.recorder.reset());

      const retryBtn = actions.createEl("button", {
        cls: "taps-icon-btn",
        attr: { "aria-label": t("reRecord") },
      });
      setIcon(retryBtn, "rotate-ccw");
      retryBtn.addEventListener("click", () => {
        this.recorder.reset();
        void this.startRecording();
      });
    }

    this.updateSubmitState();
  }

  private renderTags(): void {
    const el = this.tagContainer;
    if (!el) return;
    el.empty();

    el.createEl("span", { text: t("tagLabel"), cls: "taps-tag-label" });

    for (const tag of this.plugin.settings.tags) {
      const btn = el.createEl("button", {
        text: tag,
        cls: `taps-tag-btn ${tag === this.selectedTag ? "taps-tag-active" : ""}`,
      });
      btn.addEventListener("click", () => {
        this.selectedTag = tag;
        this.renderTags();
      });
    }
  }

  private async startRecording(): Promise<void> {
    this.blurInput();
    try {
      await this.recorder.start();
    } catch {
      new Notice(t("micError"));
    }
  }

  private async handleSubmit(): Promise<void> {
    const text = this.textArea?.value.trim() ?? "";
    const hasAudio = this.recorder.audioBlob !== null;

    if (!text && !hasAudio) {
      new Notice(t("noContent"));
      return;
    }

    try {
      let audioPath = "";
      if (hasAudio && this.recorder.audioBlob) {
        audioPath = await this.saveAudio(this.recorder.audioBlob);
      }

      await this.appendToDailyNote(text, audioPath);
      new Notice(`${t("saved")} #${this.selectedTag}`);
      this.close();
    } catch (e) {
      new Notice(`${t("saveFailed")}: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  private async saveAudio(blob: Blob): Promise<string> {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    const stamp =
      `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}` +
      `-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
    const ext = this.recorder.getExtension();
    const fileName = `rec-${stamp}.${ext}`;
    const folder = this.plugin.settings.audioFolder;
    const filePath = `${folder}/${fileName}`;

    const buffer = await blob.arrayBuffer();

    const folderExists = this.app.vault.getAbstractFileByPath(folder);
    if (!folderExists) {
      await this.app.vault.createFolder(folder);
    }

    await this.app.vault.createBinary(filePath, buffer);
    return fileName;
  }

  private async appendToDailyNote(
    text: string,
    audioPath: string,
  ): Promise<void> {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    const time = `${pad(now.getHours())}:${pad(now.getMinutes())}`;

    const parts: string[] = [];
    parts.push(`\n### ${time} #${this.selectedTag}\n`);
    if (text) parts.push(`\n${text}\n`);
    if (audioPath) {
      parts.push(`\n![[${audioPath}]]\n`);
      const stem = audioPath.replace(/\.[^.]+$/, "");
      parts.push(`![[${stem}]]\n`);
    }

    const block = parts.join("");
    const dailyNote = await this.getOrCreateDailyNote();
    await this.app.vault.append(dailyNote, block);
  }

  private async getOrCreateDailyNote(): Promise<TFile> {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    const dateStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

    const folder = this.plugin.settings.dailyNoteFolder;
    const filePath = `${folder}/${dateStr}.md`;

    const existing = this.app.vault.getAbstractFileByPath(filePath);
    if (existing instanceof TFile) return existing;

    const folderExists = this.app.vault.getAbstractFileByPath(folder);
    if (!folderExists) {
      await this.app.vault.createFolder(folder);
    }

    const header = `---\ndate: ${dateStr}\ntags: [journal]\n---\n\n# ${dateStr}\n`;
    return await this.app.vault.create(filePath, header);
  }
}
