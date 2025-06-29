"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const obsidian_1 = require("obsidian");
const DEFAULT_SETTINGS = {
    enabled: true,
    outputFolder: "",
    baseFontSize: "1.6em",
    h1FontSize: "2em",
    h2FontSize: "1.4em",
    slidePadding: "3vw",
    headingMarginTop: "2.5em",
    accentColor: "#A2CF80",
    scrollableSlides: true,
    h1Color: "#A2CF80",
    h2Color: "#FFD700",
    h3Color: "#FF8C00",
    h4Color: "#1E90FF",
    h5Color: "#BA55D3",
    h6Color: "#FF69B4",
};
function injectSlideCss(settings) {
    const id = "obsidian-slide-improvements-styles";
    document.getElementById(id)?.remove();
    const styleTag = document.createElement("style");
    styleTag.id = id;
    styleTag.textContent = `
    :root {
      --accent-color: ${settings.accentColor};
      --slide-h1-color: ${settings.h1Color};
      --slide-h2-color: ${settings.h2Color};
      --slide-h3-color: ${settings.h3Color};
      --slide-h4-color: ${settings.h4Color};
      --slide-h5-color: ${settings.h5Color};
      --slide-h6-color: ${settings.h6Color};
      --base-font-size: ${settings.baseFontSize};
      --h1-font-size: ${settings.h1FontSize};
      --h2-font-size: ${settings.h2FontSize};
      --slide-padding: ${settings.slidePadding};
      --heading-margin-top: ${settings.headingMarginTop};
    }
    .reveal {
      font-size: var(--base-font-size, 1.6em);
    }
    .reveal .slide h1, .reveal section h1 {
      font-size: var(--h1-font-size, 2em) !important;
      line-height: 1.1;
      color: var(--slide-h1-color) !important;
    }
    .reveal .slide h2, .reveal section h2 {
      font-size: var(--h2-font-size, 1.4em) !important;
      line-height: 1.1;
      color: var(--slide-h2-color) !important;
    }
    .reveal .slide h3, .reveal section h3 { color: var(--slide-h3-color) !important; }
    .reveal .slide h4, .reveal section h4 { color: var(--slide-h4-color) !important; }
    .reveal .slide h5, .reveal section h5 { color: var(--slide-h5-color) !important; }
    .reveal .slide h6, .reveal section h6 { color: var(--slide-h6-color) !important; }
    /* Apply padding to all likely slide containers */
    .reveal .slide,
    .reveal section,
    .reveal .slides > section {
      padding-left: var(--slide-padding, 3vw) !important;
      padding-right: var(--slide-padding, 3vw) !important;
    }
    .reveal .slide {
      ${settings.scrollableSlides ? "overflow-y: auto !important; max-height: 100vh;" : ""}
    }
    /* --- Heading Top Margin: Applies to all non-first headings --- */
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
      margin-top: var(--heading-margin-top, 2.5em) !important;
    }
  `;
    document.head.appendChild(styleTag);
}
class ObsidianSlideImprovementsPlugin extends obsidian_1.Plugin {
    async onload() {
        await this.loadSettings();
        injectSlideCss(this.settings);
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
                    new obsidian_1.Notice("Obsidian Slide Improvements is disabled in plugin settings.");
                    return;
                }
                // Remove YAML frontmatter
                md = md.replace(/^---\n[\s\S]+?\n---\n?/m, "");
                // Insert slide breaks before H1/H2 (except the first)
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
                const processed = out.join('\n');
                let folder = this.settings.outputFolder.trim();
                if (!file) {
                    new obsidian_1.Notice("No file context found.");
                    return;
                }
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
exports.default = ObsidianSlideImprovementsPlugin;
class SlideImprovementsSettingTab extends obsidian_1.PluginSettingTab {
    constructor(app, plugin) {
        super(app, plugin);
        this.plugin = plugin;
    }
    display() {
        const { containerEl } = this;
        containerEl.empty();
        containerEl.createEl("h2", { text: "Obsidian Slide Improvements - Settings" });
        // --- Enablement Section ---
        containerEl.createEl("h3", { text: "Enable" });
        new obsidian_1.Setting(containerEl)
            .setName("Enable plugin")
            .setDesc("Enable or disable Obsidian Slide Improvements.")
            .addToggle(toggle => toggle
            .setValue(this.plugin.settings.enabled)
            .onChange(async (value) => {
            this.plugin.settings.enabled = value;
            await this.plugin.saveSettings();
            injectSlideCss(this.plugin.settings);
        }));
        // --- Scrolling Section ---
        containerEl.createEl("h3", { text: "Scrolling" });
        new obsidian_1.Setting(containerEl)
            .setName("Scrollable slides")
            .setDesc("Allow slides to scroll vertically when content overflows.")
            .addToggle(toggle => toggle
            .setValue(this.plugin.settings.scrollableSlides)
            .onChange(async (value) => {
            this.plugin.settings.scrollableSlides = value;
            await this.plugin.saveSettings();
            injectSlideCss(this.plugin.settings);
        }));
        // --- Sizing Section ---
        containerEl.createEl("h3", { text: "Sizes" });
        new obsidian_1.Setting(containerEl)
            .setName("Base font size")
            .setDesc("Font size for slide content (e.g., 1.6em, 22px)")
            .addText(text => text
            .setValue(this.plugin.settings.baseFontSize)
            .onChange(async (value) => {
            this.plugin.settings.baseFontSize = value;
            await this.plugin.saveSettings();
            injectSlideCss(this.plugin.settings);
        }));
        new obsidian_1.Setting(containerEl)
            .setName("H1 font size")
            .setDesc("Font size for H1 headings (e.g., 2em, 32px)")
            .addText(text => text
            .setValue(this.plugin.settings.h1FontSize)
            .onChange(async (value) => {
            this.plugin.settings.h1FontSize = value;
            await this.plugin.saveSettings();
            injectSlideCss(this.plugin.settings);
        }));
        new obsidian_1.Setting(containerEl)
            .setName("H2 font size")
            .setDesc("Font size for H2 headings (e.g., 1.4em, 28px)")
            .addText(text => text
            .setValue(this.plugin.settings.h2FontSize)
            .onChange(async (value) => {
            this.plugin.settings.h2FontSize = value;
            await this.plugin.saveSettings();
            injectSlideCss(this.plugin.settings);
        }));
        new obsidian_1.Setting(containerEl)
            .setName("Slide side padding")
            .setDesc("Left/right padding for slides (e.g., 3vw, 32px)")
            .addText(text => text
            .setValue(this.plugin.settings.slidePadding)
            .onChange(async (value) => {
            this.plugin.settings.slidePadding = value;
            await this.plugin.saveSettings();
            injectSlideCss(this.plugin.settings);
        }));
        new obsidian_1.Setting(containerEl)
            .setName("Heading top margin")
            .setDesc("Top margin for non-first headings (e.g., 2.5em, 40px)")
            .addText(text => text
            .setValue(this.plugin.settings.headingMarginTop)
            .onChange(async (value) => {
            this.plugin.settings.headingMarginTop = value;
            await this.plugin.saveSettings();
            injectSlideCss(this.plugin.settings);
        }));
        // --- Colors Section ---
        containerEl.createEl("h3", { text: "Colors" });
        new obsidian_1.Setting(containerEl)
            .setName("Accent color")
            .setDesc("Accent color for slides (applies to links)")
            .addColorPicker(picker => picker
            .setValue(this.plugin.settings.accentColor || "#A2CF80")
            .onChange(async (value) => {
            this.plugin.settings.accentColor = value || "#A2CF80";
            await this.plugin.saveSettings();
            injectSlideCss(this.plugin.settings);
        }));
        new obsidian_1.Setting(containerEl)
            .setName("H1 Color")
            .setDesc("Color for H1 headings")
            .addColorPicker(picker => picker
            .setValue(this.plugin.settings.h1Color || "#A2CF80")
            .onChange(async (value) => {
            this.plugin.settings.h1Color = value || "#A2CF80";
            await this.plugin.saveSettings();
            injectSlideCss(this.plugin.settings);
        }));
        new obsidian_1.Setting(containerEl)
            .setName("H2 Color")
            .setDesc("Color for H2 headings")
            .addColorPicker(picker => picker
            .setValue(this.plugin.settings.h2Color || "#FFD700")
            .onChange(async (value) => {
            this.plugin.settings.h2Color = value || "#FFD700";
            await this.plugin.saveSettings();
            injectSlideCss(this.plugin.settings);
        }));
        new obsidian_1.Setting(containerEl)
            .setName("H3 Color")
            .setDesc("Color for H3 headings")
            .addColorPicker(picker => picker
            .setValue(this.plugin.settings.h3Color || "#FF8C00")
            .onChange(async (value) => {
            this.plugin.settings.h3Color = value || "#FF8C00";
            await this.plugin.saveSettings();
            injectSlideCss(this.plugin.settings);
        }));
        new obsidian_1.Setting(containerEl)
            .setName("H4 Color")
            .setDesc("Color for H4 headings")
            .addColorPicker(picker => picker
            .setValue(this.plugin.settings.h4Color || "#1E90FF")
            .onChange(async (value) => {
            this.plugin.settings.h4Color = value || "#1E90FF";
            await this.plugin.saveSettings();
            injectSlideCss(this.plugin.settings);
        }));
        new obsidian_1.Setting(containerEl)
            .setName("H5 Color")
            .setDesc("Color for H5 headings")
            .addColorPicker(picker => picker
            .setValue(this.plugin.settings.h5Color || "#BA55D3")
            .onChange(async (value) => {
            this.plugin.settings.h5Color = value || "#BA55D3";
            await this.plugin.saveSettings();
            injectSlideCss(this.plugin.settings);
        }));
        new obsidian_1.Setting(containerEl)
            .setName("H6 Color")
            .setDesc("Color for H6 headings")
            .addColorPicker(picker => picker
            .setValue(this.plugin.settings.h6Color || "#FF69B4")
            .onChange(async (value) => {
            this.plugin.settings.h6Color = value || "#FF69B4";
            await this.plugin.saveSettings();
            injectSlideCss(this.plugin.settings);
        }));
        // --- Output Section ---
        containerEl.createEl("h3", { text: "Output" });
        new obsidian_1.Setting(containerEl)
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
