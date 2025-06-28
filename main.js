import { Plugin, PluginSettingTab, Setting, Notice, MarkdownView, normalizePath } from "obsidian";
const DEFAULT_SETTINGS = {
    enabled: true,
    outputFolder: "",
};
// Strip YAML frontmatter (--- ... ---)
function stripFrontmatter(md) {
    return md.replace(/^---\n[\s\S]+?\n---\n?/m, "");
}
// Insert slide breaks before H1/H2 (except the first)
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
export default class ObsidianSlideImprovementsPlugin extends Plugin {
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
                    new Notice("Obsidian Slide Improvements is disabled in plugin settings.");
                    return;
                }
                md = stripFrontmatter(md);
                const processed = autoBreakSlides(md);
                // Determine output folder and file name
                let folder = this.settings.outputFolder.trim();
                if (!file) {
                    new Notice("No file context found.");
                    return;
                }
                const originalBase = file.basename.replace(/[/\\?%*:|"<>]/g, "_");
                let newFilename = `${originalBase} Slides.md`;
                if (folder) {
                    folder = normalizePath(folder);
                    await this.app.vault.createFolder(folder).catch(() => { });
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
                await this.app.workspace.getLeaf(true).openFile(newFile);
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
    }
}
class SlideImprovementsSettingTab extends PluginSettingTab {
    constructor(app, plugin) {
        super(app, plugin);
        this.plugin = plugin;
    }
    display() {
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
    }
}
