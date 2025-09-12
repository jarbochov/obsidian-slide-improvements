import { Plugin, PluginSettingTab, App, Setting, Notice, MarkdownView, TFile, normalizePath } from "obsidian";

// All your constants, e.g.:
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

function injectSlideCss(settings: any) { /* ...full code... */ }
function injectScrollCss(scrollable: boolean) { /* ...full code... */ }

export default class ObsidianSlideImprovementsPlugin extends Plugin {
    settings: any;

    async onload() {
        await this.loadSettings();
        injectSlideCss(this.settings);
        injectScrollCss(this.settings.scrollableSlides);

        this.addCommand({
            id: 'create-slide-note',
            name: 'Create Slide Copy for Presentation',
            editorCallback: async (editor, view) => {
                // ...full command code here...
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

class SlideImprovementsSettingTab extends PluginSettingTab {
    plugin: ObsidianSlideImprovementsPlugin;

    constructor(app: App, plugin: ObsidianSlideImprovementsPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        // ...render settings UI code here...
    }
}