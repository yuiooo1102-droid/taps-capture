import { Plugin } from "obsidian";
import { CaptureModal } from "./capture-modal";
import { CaptureSettingTab } from "./settings-tab";
import { setLocale } from "./i18n";
import { DEFAULT_SETTINGS, type CaptureSettings } from "./types";

export default class CapturePlugin extends Plugin {
  settings: CaptureSettings = DEFAULT_SETTINGS;

  async onload(): Promise<void> {
    await this.loadSettings();
    setLocale(this.settings.language);

    this.addCommand({
      id: "open-capture",
      name: "Quick capture",
      callback: () => new CaptureModal(this.app, this).open(),
    });

    this.addRibbonIcon("mic", "Quick capture", () => {
      new CaptureModal(this.app, this).open();
    });

    this.addSettingTab(new CaptureSettingTab(this.app, this));
  }

  async loadSettings(): Promise<void> {
    const data = await this.loadData();
    this.settings = { ...DEFAULT_SETTINGS, ...data };
  }

  async saveSettings(): Promise<void> {
    await this.saveData(this.settings);
  }
}
