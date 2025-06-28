import { App, Plugin, PluginSettingTab, Setting, Notice, MarkdownView, TFile, normalizePath } from "obsidian";

interface SlideImprovementsSettings {
  enabled: boolean;
  outputFolder: string;

  baseFontSize: string;
  h1FontSize: string;
  h2FontSize: string;
  slidePadding: string;
  headingMarginTop: string;
  accentColor: string;
  scrollableSlides: boolean;
}

const DEFAULT_SETTINGS: SlideImprovementsSettings = {
  enabled: true,
  outputFolder: "",
  baseFontSize: "1.6em",
  h1FontSize: "2em",
  h2FontSize: "1.4em",
  slidePadding: "3vw",
  headingMarginTop: "2.5em",
  accentColor: "#A2CF80",
  scrollableSlides: true,
};

// CSS injection helper
function injectSlideCss(settings: SlideImprovementsSettings) {
  const id = "obsidian-slide-improvements-styles";
  let styleTag = document.getElementById(id) as HTMLStyleElement | null;
  if (!styleTag) {
    styleTag = document.createElement("style");
    styleTag.id = id;
    document.head.appendChild(styleTag);
  }

  styleTag.textContent = `
    :root {
      --accent-color: ${settings.accentColor};
    }
    .reveal {
      font-size: ${settings.baseFontSize};
    }
    .reveal h1 {
      font-size: ${settings.h1FontSize} !important;
      line-height: 1.1;
    }
    .reveal h2 {
      font-size: ${settings.h2FontSize} !important;
      line-height: 1.1;
    }
    .reveal .slide {
      padding-left: ${settings.slidePadding} !important;
      padding-right: ${settings.slidePadding} !important;
      ${settings.scrollableSlides ? "overflow-y: auto !important; max-height: 100vh;" : ""}
    }
    .reveal .slide h1:not(:first-of-type),
    .reveal .slide h2:not(:first-of-type),
    .reveal .slide h3:not(:first-of-type),
    .reveal .slide h4:not(:first-of-type),
    .reveal .slide h5:not(:first-of-type),
    .reveal .slide h6:not(:first-of-type),
    .reveal section h1:not(:first-of-type),
    .reveal section h2:not(:first-of-type),
    .reveal section h3:not(:first-of-type),
    .reveal section h4:not(:first-of-type),
    .reveal section h5:not(:first-of-type),
    .reveal section h6:not(:first-of-type) {
      margin-top: ${settings.headingMarginTop} !important;
    }
  `;
}

export default class ObsidianSlideImprovementsPlugin extends Plugin {
  settings!: SlideImprovementsSettings;

  async onload() {
    await this.loadSettings();
    injectSlideCss(this.settings);

    this.addCommand({
      id: 'create-slide-note',
      name: 'Create Slide Copy for Presentation',
      editorCallback: async (editor, view) => {
        if (!(view instanceof MarkdownView)) {
          new Notice("No active Markdown file.");
          return;
        }
        const file = view.file;
        let md = view.getViewData();

        if (!this.settings.enabled) {
          new Notice("Obsidian Slide Improvements is disabled in plugin settings.");
          return;
        }

        // Remove YAML frontmatter
        md = md.replace(/^---\n[\s\S]+?\n---\n?/m, "");
        // Insert slide breaks before H1/H2 (except the first)
        const lines = md.split('\n');
        let out: string[] = [];
        let firstHeading = true;
        for (const line of lines) {
          if (/^(#|##) /.test(line)) {
            if (!firstHeading) out.push('---');
            firstHeading = false;
          }
          out.push(line);
        }
        const processed = out.join('\n');

        let folder = this.settings.outputFolder.trim();
        if (!file) {
          new Notice("No file context found.");
          return;
        }
        const originalBase = file.basename.replace(/[/\\?%*:|"<>]/g, "_");
        let newFilename = `${originalBase} Slides.md`;
        if (folder) {
          folder = normalizePath(folder);
          await this.app.vault.createFolder(folder).catch(() => {});
          newFilename = folder + "/" + newFilename;
        }
        let uniqueFilename = newFilename;
        let counter = 2;
        while (this.app.vault.getAbstractFileByPath(uniqueFilename)) {
          uniqueFilename = newFilename.replace(/\.md$/, ` ${counter}.md`);
          counter++;
        }
        const newFile = await this.app.vault.create(uniqueFilename, processed);
        await this.app.workspace.getLeaf(true).openFile(newFile as TFile);
        new Notice(`Slide copy created: ${uniqueFilename}`);
      }
    });

    this.addSettingTab(new SlideImprovementsSettingTab(this.app, this));
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
    injectSlideCss(this.settings);
  }
}

class SlideImprovementsSettingTab extends PluginSettingTab {
  plugin: ObsidianSlideImprovementsPlugin;

  constructor(app: App, plugin: ObsidianSlideImprovementsPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    containerEl.createEl("h2", { text: "Obsidian Slide Improvements - Settings" });

    new Setting(containerEl)
      .setName("Enable plugin")
      .setDesc("Enable or disable Obsidian Slide Improvements.")
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.enabled)
        .onChange(async (value) => {
          this.plugin.settings.enabled = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName("Output folder")
      .setDesc("Folder to save generated slide notes (leave blank for vault root).")
      .addText(text => text
        .setPlaceholder("slides")
        .setValue(this.plugin.settings.outputFolder)
        .onChange(async (value) => {
          this.plugin.settings.outputFolder = value;
          await this.plugin.saveSettings();
        }));

    // Font size
    new Setting(containerEl)
      .setName("Base font size")
      .setDesc("Font size for slide content (e.g., 1.6em, 22px)")
      .addText(text => text
        .setValue(this.plugin.settings.baseFontSize)
        .onChange(async (value) => {
          this.plugin.settings.baseFontSize = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName("H1 font size")
      .setDesc("Font size for H1 headings (e.g., 2em, 32px)")
      .addText(text => text
        .setValue(this.plugin.settings.h1FontSize)
        .onChange(async (value) => {
          this.plugin.settings.h1FontSize = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName("H2 font size")
      .setDesc("Font size for H2 headings (e.g., 1.4em, 28px)")
      .addText(text => text
        .setValue(this.plugin.settings.h2FontSize)
        .onChange(async (value) => {
          this.plugin.settings.h2FontSize = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName("Slide side padding")
      .setDesc("Left/right padding for slides (e.g., 3vw, 32px)")
      .addText(text => text
        .setValue(this.plugin.settings.slidePadding)
        .onChange(async (value) => {
          this.plugin.settings.slidePadding = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName("Heading top margin")
      .setDesc("Top margin for non-first headings (e.g., 2.5em, 40px)")
      .addText(text => text
        .setValue(this.plugin.settings.headingMarginTop)
        .onChange(async (value) => {
          this.plugin.settings.headingMarginTop = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName("Accent color")
      .setDesc("Accent color for slides (CSS color value, e.g., #A2CF80)")
      .addText(text => text
        .setValue(this.plugin.settings.accentColor)
        .onChange(async (value) => {
          this.plugin.settings.accentColor = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName("Scrollable slides")
      .setDesc("Allow slides to scroll vertically when content overflows.")
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.scrollableSlides)
        .onChange(async (value) => {
          this.plugin.settings.scrollableSlides = value;
          await this.plugin.saveSettings();
        }));
  }
}