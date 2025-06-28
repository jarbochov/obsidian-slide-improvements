"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const obsidian_1 = require("obsidian");
const DEFAULT_SETTINGS = {
    enabled: true,
    outputFolder: "",
};
function stripFrontmatter(md) {
    return md.replace(/^---\n[\s\S]+?\n---\n?/m, "");
}
function autoBreakSlides(md) {
    const lines = md.split('\n');
    let out = [];
    let firstHeading = true;
    for (const line of lines) {
        if (/^(#|##) /.test(line)) {
            if (!firstHeading)
                out.push('---');
            firstHeading = false;
        }
        out.push(line);
    }
    return out.join('\n');
}
class AutoSlideBreakPlugin extends obsidian_1.Plugin {
    async onload() {
        await this.loadSettings();
        this.addCommand({
            id: 'create-slide-note',
            name: 'Create Slide Copy for Presentation',
            editorCallback: async (editor, view) => {
                if (!(view instanceof obsidian_1.MarkdownView)) {
                    new obsidian_1.Notice("No active Markdown file.");
                    return;
                }
                const file = view.file;
                let md = view.getViewData();
                if (!this.settings.enabled) {
                    new obsidian_1.Notice("Auto slide breaking is disabled in plugin settings.");
                    return;
                }
                md = stripFrontmatter(md);
                const processed = autoBreakSlides(md);
                let folder = this.settings.outputFolder.trim();
                const originalBase = file.basename.replace(/[/\\?%*:|"<>]/g, "_");
                let newFilename = `${originalBase} Slides.md`;
                if (folder) {
                    folder = (0, obsidian_1.normalizePath)(folder);
                    await this.app.vault.createFolder(folder).catch(() => { });
                    newFilename = folder + "/" + newFilename;
                }
                let uniqueFilename = newFilename;
                let counter = 2;
                while (this.app.vault.getAbstractFileByPath(uniqueFilename)) {
                    uniqueFilename = newFilename.replace(/\.md$/, ` ${counter}.md`);
                    counter++;
                }
                const newFile = await this.app.vault.create(uniqueFilename, processed);
                await this.app.workspace.getLeaf(true).openFile(newFile);
                new obsidian_1.Notice(`Slide copy created: ${uniqueFilename}`);
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
exports.default = AutoSlideBreakPlugin;
class AutoSlideBreakSettingTab extends obsidian_1.PluginSettingTab {
    constructor(app, plugin) {
        super(app, plugin);
        this.plugin = plugin;
    }
    display() {
        const { containerEl } = this;
        containerEl.empty();
        containerEl.createEl("h2", { text: "Auto Slide Break for Reveal.js - Settings" });
        new obsidian_1.Setting(containerEl)
            .setName("Enable Auto Slide Breaks")
            .setDesc("Automatically insert slide breaks at every H1 or H2 when creating a presentation copy.")
            .addToggle(toggle => toggle
            .setValue(this.plugin.settings.enabled)
            .onChange(async (value) => {
            this.plugin.settings.enabled = value;
            await this.plugin.saveSettings();
        }));
        new obsidian_1.Setting(containerEl)
            .setName("Output Folder (optional)")
            .setDesc("Where to save the generated slide files. Leave blank for vault root.")
            .addText(text => text
            .setPlaceholder("e.g. Slides/Temp")
            .setValue(this.plugin.settings.outputFolder)
            .onChange(async (value) => {
            this.plugin.settings.outputFolder = value;
            await this.plugin.saveSettings();
        }));
    }
}