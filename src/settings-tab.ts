import { PluginSettingTab, Setting, type App } from "obsidian";
import { t, setLocale } from "./i18n";
import type CapturePlugin from "./main";

export class CaptureSettingTab extends PluginSettingTab {
  private plugin: CapturePlugin;

  constructor(app: App, plugin: CapturePlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    new Setting(containerEl).setName(t("settingsTitle")).setHeading();

    new Setting(containerEl)
      .setName(t("settingLanguage"))
      .setDesc(t("settingLanguageDesc"))
      .addDropdown((dropdown) =>
        dropdown
          .addOption("en", "English")
          .addOption("zh", "中文")
          .setValue(this.plugin.settings.language)
          .onChange(async (value) => {
            this.plugin.settings = {
              ...this.plugin.settings,
              language: value as "en" | "zh",
            };
            setLocale(value);
            await this.plugin.saveSettings();
            this.display();
          }),
      );

    new Setting(containerEl)
      .setName(t("settingTags"))
      .setDesc(t("settingTagsDesc"))
      .addText((text) =>
        text
          .setPlaceholder("idea, diary, meeting")
          .setValue([...this.plugin.settings.tags].join(","))
          .onChange(async (value) => {
            const tags = value
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean);
            this.plugin.settings = {
              ...this.plugin.settings,
              tags,
            };
            await this.plugin.saveSettings();
          }),
      );

    new Setting(containerEl)
      .setName(t("settingDefaultTag"))
      .setDesc(t("settingDefaultTagDesc"))
      .addDropdown((dropdown) => {
        for (const tag of this.plugin.settings.tags) {
          dropdown.addOption(tag, tag);
        }
        dropdown.setValue(this.plugin.settings.defaultTag);
        dropdown.onChange(async (value) => {
          this.plugin.settings = {
            ...this.plugin.settings,
            defaultTag: value,
          };
          await this.plugin.saveSettings();
        });
      });

    new Setting(containerEl)
      .setName(t("settingDailyFolder"))
      .setDesc(t("settingDailyFolderDesc"))
      .addText((text) =>
        text
          .setPlaceholder("Journal")
          .setValue(this.plugin.settings.dailyNoteFolder)
          .onChange(async (value) => {
            this.plugin.settings = {
              ...this.plugin.settings,
              dailyNoteFolder: value.trim() || "Journal",
            };
            await this.plugin.saveSettings();
          }),
      );

    new Setting(containerEl)
      .setName(t("settingAudioFolder"))
      .setDesc(t("settingAudioFolderDesc"))
      .addText((text) =>
        text
          .setPlaceholder("Audio/inbox")
          .setValue(this.plugin.settings.audioFolder)
          .onChange(async (value) => {
            this.plugin.settings = {
              ...this.plugin.settings,
              audioFolder: value.trim() || "Audio/inbox",
            };
            await this.plugin.saveSettings();
          }),
      );
  }
}
