import { App, Plugin, PluginSettingTab, Setting, Notice, MarkdownView, TFile, normalizePath } from "obsidian";

interface AutoSlideBreakSettings {
  enabled: boolean;
  outputFolder: string; // Folder to save generated slides
}

const DEFAULT_SETTINGS: AutoSlideBreakSettings = {
  enabled: true,
  outputFolder: "", // Root by default
};

// Strip YAML frontmatter (--- ... ---)
function stripFrontmatter(md: string): string {
  return md.replace(/^---\n[\s\S]+?\n---\n?/m, "");
}

// Insert slide breaks before H1/H2 (except the first)
function autoBreakSlides(md: string): string {
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
  return out.join('\n');
}

export default class AutoSlideBreakPlugin extends Plugin {
  settings: AutoSlideBreakSettings;

  async onload() {
    await this.loadSettings();

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
          new Notice("Auto slide breaking is disabled in plugin settings.");
          return;
        }

        md = stripFrontmatter(md);
        const processed = autoBreakSlides(md);

        // Determine output folder and file name
        let folder = this.settings.outputFolder.trim();
        const originalBase = file.basename.replace(/[/\\?%*:|"<>]/g, "_");
        let newFilename = `${originalBase} Slides.md`;
        if (folder) {
          folder = normalizePath(folder);
          await this.app.vault.createFolder(folder).catch(() => {});
          newFilename = folder + "/" + newFilename;
        }

        // Prevent accidental overwrite
        let uniqueFilename = newFilename;
        let counter = 2;
        while (this.app.vault.getAbstractFileByPath(uniqueFilename)) {
          uniqueFilename = newFilename.replace(/\.md$/, ` ${counter}.md`);
          counter++;
        }

        // Create the new file
        const newFile = await this.app.vault.create(uniqueFilename, processed);
        // Open the new file in a new tab
        await this.app.workspace.getLeaf(true).openFile(newFile as TFile);
        new Notice(`Slide copy created: ${uniqueFilename}`);
      }
    });

    this.addSettingTab(new AutoSlideBreakSettingTab(this.app, this));
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}

class AutoSlideBreakSettingTab extends PluginSettingTab {
  plugin: AutoSlideBreakPlugin;

  constructor(app: App, plugin: AutoSlideBreakPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    containerEl.createEl("h2", { text: "Auto Slide Break for Reveal.js - Settings" });

    new Setting(containerEl)
      .setName("Enable Auto Slide Breaks")
      .setDesc("Automatically insert slide breaks at every H1 or H2 when creating a presentation copy.")
      .addToggle(toggle =>
        toggle
          .setValue(this.plugin.settings.enabled)
          .onChange(async value => {
            this.plugin.settings.enabled = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("Output Folder (optional)")
      .setDesc("Where to save the generated slide files. Leave blank for vault root.")
      .addText(text =>
        text
          .setPlaceholder("e.g. Slides/Temp")
          .setValue(this.plugin.settings.outputFolder)
          .onChange(async value => {
            this.plugin.settings.outputFolder = value;
            await this.plugin.saveSettings();
          })
      );
  }
}