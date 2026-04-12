const en = {
  quickCapture: "Quick Capture",
  placeholder: "Write something...",
  record: "Record",
  recording: "Recording",
  stop: "Stop",
  save: "Save",
  deleteRecording: "Delete recording",
  reRecord: "Re-record",
  tagLabel: "Tag: ",
  noContent: "Please enter text or record audio",
  saved: "Saved",
  saveFailed: "Save failed",
  micError: "Cannot access microphone. Check permissions.",
  settingsTitle: "Taps Capture Settings",
  settingTags: "Tags",
  settingTagsDesc: "Comma-separated, e.g.: idea,diary,meeting",
  settingDefaultTag: "Default tag",
  settingDefaultTagDesc: "Pre-selected tag when opening capture",
  settingDailyFolder: "Daily note folder",
  settingDailyFolderDesc: "Subfolder in vault for daily notes",
  settingAudioFolder: "Audio folder",
  settingAudioFolderDesc: "Subfolder in vault for recordings",
  settingLanguage: "Language",
  settingLanguageDesc: "Plugin UI language",
};

const zh: typeof en = {
  quickCapture: "快速捕获",
  placeholder: "写点什么...",
  record: "录音",
  recording: "录音中",
  stop: "停止",
  save: "记录",
  deleteRecording: "删除录音",
  reRecord: "重新录音",
  tagLabel: "Tag: ",
  noContent: "请输入文字或录音",
  saved: "已记录",
  saveFailed: "记录失败",
  micError: "无法访问麦克风，请检查权限设置",
  settingsTitle: "Taps Capture 设置",
  settingTags: "Tag 列表",
  settingTagsDesc: "逗号分隔，例如：灵感,日记,会议",
  settingDefaultTag: "默认 Tag",
  settingDefaultTagDesc: "打开捕获弹窗时默认选中的 tag",
  settingDailyFolder: "Daily Note 目录",
  settingDailyFolderDesc: "日记文件保存到 vault 中的子目录",
  settingAudioFolder: "录音存放目录",
  settingAudioFolderDesc: "录音文件保存到 vault 中的子目录",
  settingLanguage: "语言 / Language",
  settingLanguageDesc: "插件界面语言 / Plugin UI language",
};

const locales: Record<string, typeof en> = { en, zh };

let current: typeof en = en;

export function setLocale(lang: string): void {
  current = locales[lang] ?? en;
}

export function t(key: keyof typeof en): string {
  return current[key];
}
