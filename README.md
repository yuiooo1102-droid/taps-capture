# Taps Capture

Capture text and audio to Obsidian daily notes with tag classification. Works on both desktop and mobile.

## Features

- **Text capture** — Quick text input with keyboard or voice dictation
- **Audio recording** — Record voice memos with visual feedback (recording state, timer)
- **Tag system** — Classify entries with customizable tags (e.g. idea, diary, meeting)
- **Daily notes** — All captures append to today's daily note in `### HH:MM #tag` format
- **i18n** — English and Chinese UI
- **Cross-platform** — Desktop (Mac/Windows/Linux) and mobile (iOS/Android)

## Usage

1. Open command palette → **Quick Capture**
2. Type text and/or tap the record button
3. Select a tag
4. Tap **Save**

The entry is appended to today's daily note:

```markdown
### 14:32 #idea

Your captured text here

![[rec-20260412-143200.webm]]
```

## Settings

| Setting | Description | Default |
|---------|-------------|---------|
| Tags | Comma-separated tag list | `idea,diary,meeting` |
| Default tag | Pre-selected tag | `idea` |
| Daily note folder | Subfolder for daily notes | `Journal` |
| Audio folder | Subfolder for recordings | `Audio/inbox` |
| Language | UI language (en/zh) | `en` |

## Installation

### From Obsidian Community Plugins

1. Open Settings → Community plugins → Browse
2. Search for **Taps Capture**
3. Install and enable

### Manual

1. Download `main.js`, `manifest.json`, and `styles.css` from the [latest release](https://github.com/niwh/taps-capture/releases)
2. Create folder `.obsidian/plugins/taps-capture/` in your vault
3. Copy the three files into it
4. Enable the plugin in Settings → Community plugins

## Development

```bash
npm install
npm run dev    # watch mode
npm run build  # production build
```

## License

MIT
