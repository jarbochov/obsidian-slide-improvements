"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const obsidian_1 = require("obsidian");
const DEFAULT_SETTINGS = {
    enableStyling: true,
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
    if (!settings.enableStyling)
        return;
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
    .reveal .slides > section {
      padding-left: var(--slide-padding, 3vw) !important;
      padding-right: var(--slide-padding, 3vw) !important;
    }
    .reveal .slides > section h1 {
      font-size: var(--h1-font-size, 2em) !important;
      color: var(--slide-h1-color) !important;
      line-height: 1.1;
    }
    .reveal .slides > section h2 {
      font-size: var(--h2-font-size, 1.4em) !important;
      color: var(--slide-h2-color) !important;
      line-height: 1.1;
    }
    .reveal .slides > section h3 { color: var(--slide-h3-color) !important; }
    .reveal .slides > section h4 { color: var(--slide-h4-color) !important; }
    .reveal .slides > section h5 { color: var(--slide-h5-color) !important; }
    .reveal .slides > section h6 { color: var(--slide-h6-color) !important; }
    .reveal .slides > section h1:not(:first-of-type),
    .reveal .slides > section h2:not(:first-of-type),
    .reveal .slides > section h3:not(:first-of-type),
    .reveal .slides > section h4:not(:first-of-type),
    .reveal .slides > section h5:not(:first-of-type),
    .reveal .slides > section h6:not(:first-of-type) {
      margin-top: var(--heading-margin-top, 2.5em) !important;
    }
  `;
    document.head.appendChild(styleTag);
}
function injectScrollCss(scrollable) {
    const id = "obsidian-slide-improvements-scroll-styles";
    document.getElementById(id)?.remove();
    const styleTag = document.createElement("style");
    styleTag.id = id;
    styleTag.textContent = `
    .reveal .slides > section {
      ${scrollable
        ? `
          overflow-y: auto !important;
          max-height: 100vh !important;
          scrollbar-width: none !important;           /* Firefox */
          -ms-overflow-style: none !important;        /* IE and Edge */
        `
        : `
          overflow-y: unset !important;
          max-height: unset !important;
          scrollbar-width: unset !important;
          -ms-overflow-style: unset !important;
        `}
    }
    ${scrollable ? `
    .reveal .slides > section::-webkit-scrollbar {
      width: 0 !important;
      height: 0 !important;
      display: none !important;
      background: transparent !important;
    }
    ` : ""}
  `;
    document.head.appendChild(styleTag);
}
class ObsidianSlideImprovementsPlugin extends obsidian_1.Plugin {
    async onload() {
        await this.loadSettings();
        injectSlideCss(this.settings);
        injectScrollCss(this.settings.scrollableSlides);
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
                // Styling enable/disable does not affect the command
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
                if (newFile instanceof obsidian_1.TFile) {
                    await this.app.workspace.getLeaf(true).openFile(newFile);
                    new obsidian_1.Notice(`Slide copy created: ${uniqueFilename}`);
                }
                else {
                    new obsidian_1.Notice("Could not open the file. It may be a folder or an unsupported type.");
                }
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
        injectScrollCss(this.settings.scrollableSlides);
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
        containerEl.createEl("h1", { text: "Slide Improvements - Settings" });
        // --- Settings Section (always visible) ---
        containerEl.createEl("h3", { text: "Settings" });
        // Enable Styling
        new obsidian_1.Setting(containerEl)
            .setName("Enable Styling")
            .setDesc("Enable or disable all slide appearance modifications (except scrolling).")
            .addToggle(toggle => toggle
            .setValue(this.plugin.settings.enableStyling)
            .onChange(async (value) => {
            this.plugin.settings.enableStyling = value;
            await this.plugin.saveSettings();
            this.display(); // Re-render settings tab
        }));
        // Scrollable Slides
        new obsidian_1.Setting(containerEl)
            .setName("Scrollable slides")
            .setDesc("Allow slides to scroll vertically when content overflows. This works even if styling is off.")
            .addToggle(toggle => toggle
            .setValue(this.plugin.settings.scrollableSlides)
            .onChange(async (value) => {
            this.plugin.settings.scrollableSlides = value;
            await this.plugin.saveSettings();
        }));
        // Output Folder
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
        // --- Styling Section (only if styling is enabled) ---
        if (this.plugin.settings.enableStyling) {
            containerEl.createEl("h3", { text: "Styling" });
            // --- Sizes Subsection ---
            containerEl.createEl("h4", { text: "Sizes" });
            new obsidian_1.Setting(containerEl)
                .setName("Base font size")
                .setDesc("Font size for slide content (e.g., 1.6em, 22px)")
                .addText(text => text
                .setValue(this.plugin.settings.baseFontSize)
                .onChange(async (value) => {
                this.plugin.settings.baseFontSize = value;
                await this.plugin.saveSettings();
            }));
            new obsidian_1.Setting(containerEl)
                .setName("H1 font size")
                .setDesc("Font size for H1 headings (e.g., 2em, 32px)")
                .addText(text => text
                .setValue(this.plugin.settings.h1FontSize)
                .onChange(async (value) => {
                this.plugin.settings.h1FontSize = value;
                await this.plugin.saveSettings();
            }));
            new obsidian_1.Setting(containerEl)
                .setName("H2 font size")
                .setDesc("Font size for H2 headings (e.g., 1.4em, 28px)")
                .addText(text => text
                .setValue(this.plugin.settings.h2FontSize)
                .onChange(async (value) => {
                this.plugin.settings.h2FontSize = value;
                await this.plugin.saveSettings();
            }));
            new obsidian_1.Setting(containerEl)
                .setName("Slide side padding")
                .setDesc("Left/right padding for slides (e.g., 3vw, 32px)")
                .addText(text => text
                .setValue(this.plugin.settings.slidePadding)
                .onChange(async (value) => {
                this.plugin.settings.slidePadding = value;
                await this.plugin.saveSettings();
            }));
            new obsidian_1.Setting(containerEl)
                .setName("Heading top margin")
                .setDesc("Top margin for non-first headings (e.g., 2.5em, 40px)")
                .addText(text => text
                .setValue(this.plugin.settings.headingMarginTop)
                .onChange(async (value) => {
                this.plugin.settings.headingMarginTop = value;
                await this.plugin.saveSettings();
            }));
            // --- Colors Subsection ---
            containerEl.createEl("h4", { text: "Colors" });
            new obsidian_1.Setting(containerEl)
                .setName("Accent color")
                .setDesc("Accent color for slides (applies to links)")
                .addColorPicker(picker => picker
                .setValue(this.plugin.settings.accentColor || "#A2CF80")
                .onChange(async (value) => {
                this.plugin.settings.accentColor = value || "#A2CF80";
                await this.plugin.saveSettings();
            }));
            new obsidian_1.Setting(containerEl)
                .setName("H1 Color")
                .setDesc("Color for H1 headings")
                .addColorPicker(picker => picker
                .setValue(this.plugin.settings.h1Color || "#A2CF80")
                .onChange(async (value) => {
                this.plugin.settings.h1Color = value || "#A2CF80";
                await this.plugin.saveSettings();
            }));
            new obsidian_1.Setting(containerEl)
                .setName("H2 Color")
                .setDesc("Color for H2 headings")
                .addColorPicker(picker => picker
                .setValue(this.plugin.settings.h2Color || "#FFD700")
                .onChange(async (value) => {
                this.plugin.settings.h2Color = value || "#FFD700";
                await this.plugin.saveSettings();
            }));
            new obsidian_1.Setting(containerEl)
                .setName("H3 Color")
                .setDesc("Color for H3 headings")
                .addColorPicker(picker => picker
                .setValue(this.plugin.settings.h3Color || "#FF8C00")
                .onChange(async (value) => {
                this.plugin.settings.h3Color = value || "#FF8C00";
                await this.plugin.saveSettings();
            }));
            new obsidian_1.Setting(containerEl)
                .setName("H4 Color")
                .setDesc("Color for H4 headings")
                .addColorPicker(picker => picker
                .setValue(this.plugin.settings.h4Color || "#1E90FF")
                .onChange(async (value) => {
                this.plugin.settings.h4Color = value || "#1E90FF";
                await this.plugin.saveSettings();
            }));
            new obsidian_1.Setting(containerEl)
                .setName("H5 Color")
                .setDesc("Color for H5 headings")
                .addColorPicker(picker => picker
                .setValue(this.plugin.settings.h5Color || "#BA55D3")
                .onChange(async (value) => {
                this.plugin.settings.h5Color = value || "#BA55D3";
                await this.plugin.saveSettings();
            }));
            new obsidian_1.Setting(containerEl)
                .setName("H6 Color")
                .setDesc("Color for H6 headings")
                .addColorPicker(picker => picker
                .setValue(this.plugin.settings.h6Color || "#FF69B4")
                .onChange(async (value) => {
                this.plugin.settings.h6Color = value || "#FF69B4";
                await this.plugin.saveSettings();
            }));
        }
    }
}
