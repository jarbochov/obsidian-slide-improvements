import { App, Plugin, PluginSettingTab, Setting, normalizePath, Notice, MarkdownView, TFile, Platform } from "obsidian";

interface SlideImprovementsSettings {
  enableStyling: boolean;
  outputFolder: string;
  baseFontSize: string;
  h1FontSize: string;
  h2FontSize: string;
  slidePadding: string;
  headingMarginTop: string;
  accentColor: string;
  scrollableSlides: boolean;
  h1Color: string;
  h2Color: string;
  h3Color: string;
  h4Color: string;
  h5Color: string;
  h6Color: string;
  enableMobileStyling: boolean;
  mobileFontSizeVertical: string;
  mobileFontSizeHorizontal: string;
  mobileScrollableSlides: boolean;
  centerMobileVertically: boolean;
}

const DEFAULT_SETTINGS: SlideImprovementsSettings = {
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
  enableMobileStyling: true,
  mobileFontSizeVertical: "4vw",
  mobileFontSizeHorizontal: "3vw",
  mobileScrollableSlides: true,
  centerMobileVertically: false
};

function injectSlideCss(settings: SlideImprovementsSettings) {
  const id = "obsidian-slide-improvements-styles";
  document.getElementById(id)?.remove();

  // Only return early if BOTH styling options are disabled
  // Scrolling is now handled separately by injectScrollCss()
  if (!settings.enableStyling && !settings.enableMobileStyling) return;

  const styleTag = document.createElement("style");
  styleTag.id = id;

  let desktopCss = "", mobileCss = "";

  // --- Desktop/tablet styling ---
  if (settings.enableStyling) {
    desktopCss = `
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
  }

  // --- Mobile-specific styling via media queries (let browser decide!) ---
  if (settings.enableMobileStyling) {
    // Shared part for all mobile
    mobileCss += `
      @media (pointer: coarse) and (max-width: 900px), (pointer: coarse) and (max-height: 600px) {
        .reveal,
        .reveal .viewport,
        .reveal .slides,
        .reveal .slides .stack,
        .reveal .slides > section,
        .reveal .slides > section.present {
          width: 100vw !important;
          min-width: 100vw !important;
          max-width: 100vw !important;
          height: 100vh !important;
          min-height: 100vh !important;
          max-height: 100vh !important;
          left: 0 !important;
          top: 0 !important;
          margin: 0 !important;
          box-sizing: border-box !important;
          position: fixed !important;
          transform: none !important;
          z-index: 10 !important;
          overflow-x: hidden !important;
          padding: 0 !important;
          padding-bottom: 0 !important;
        }
        .reveal .slides,
        .reveal .slides .stack {
          display: block !important;
          align-items: flex-start !important;
          justify-content: flex-start !important;
        }
        .slides-close-btn {
          top: 40px !important;
          right: 40px !important;
          width: 48px !important;
          height: 48px !important;
          font-size: 2em !important;
          z-index: 9999 !important;
          position: fixed !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          pointer-events: all !important;
          touch-action: manipulation !important;
          opacity: 0.4 !important;
          transition: opacity 0.2s !important;
          background: none !important;
          border-radius: 0 !important;
        }
        .slides-close-btn:hover,
        .slides-close-btn:active,
        .slides-close-btn:focus {
          opacity: 0.8 !important;
        }
        .slides-close-btn > * {
          width: 1.5em !important;
          height: 1.5em !important;
          font-size: 1.5em !important;
        }
        .reveal .backgrounds, .reveal .progress, .reveal .controls {
          display: none !important;
        }
      }
    `;

    // Portrait (vertical) specific
    mobileCss += `
      @media (pointer: coarse) and (max-width: 900px) and (orientation: portrait), (pointer: coarse) and (max-height: 600px) and (orientation: portrait) {
        .reveal {
          font-size: ${settings.mobileFontSizeVertical} !important;
        }
        .reveal .slides > section.present {
          min-height: 100vh !important;
          height: 100vh !important;
          ${settings.mobileScrollableSlides
            ? "overflow-y: auto !important;"
            : "overflow-y: hidden !important;"}
          padding-left: 6vw !important;
          padding-right: 6vw !important;
          padding-top: max(3vw, env(safe-area-inset-top, 20px)) !important;
          padding-bottom: max(3vw, env(safe-area-inset-bottom, 20px)) !important;
          ${
            settings.centerMobileVertically
              ? `
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
            justify-content: center !important;
            `
              : `
            display: block !important;
            `
          }
          background: none !important;
        }
      }
    `;

    // Landscape (horizontal) specific
    mobileCss += `
      @media (pointer: coarse) and (max-width: 900px) and (orientation: landscape), (pointer: coarse) and (max-height: 600px) and (orientation: landscape) {
        .reveal {
          font-size: ${settings.mobileFontSizeHorizontal} !important;
        }
        .reveal .slides > section.present {
          min-height: 100vh !important;
          height: 100vh !important;
          ${settings.mobileScrollableSlides
            ? `
          overflow-y: auto !important;
          display: block !important;
          `
            : `
          overflow-y: hidden !important;
          display: flex !important;
          flex-direction: column !important;
          align-items: center !important;
          justify-content: center !important;
          `
          }
          padding-left: 6vw !important;
          padding-right: 6vw !important;
          padding-top: max(3vw, env(safe-area-inset-top, 20px)) !important;
          padding-bottom: max(3vw, env(safe-area-inset-bottom, 20px)) !important;
          background: none !important;
        }
      }
    `;

    // Tablet landscape: treat like mobile slides (up to 1400px)
    mobileCss += `
      @media (min-width: 768px) and (max-width: 1400px) and (orientation: landscape) {
        .reveal,
        .reveal .viewport,
        .reveal .slides,
        .reveal .slides .stack,
        .reveal .slides > section,
        .reveal .slides > section.present {
          width: 100vw !important;
          min-width: 100vw !important;
          max-width: 100vw !important;
          height: 100vh !important;
          min-height: 100vh !important;
          max-height: 100vh !important;
          left: 0 !important;
          top: 0 !important;
          margin: 0 !important;
          box-sizing: border-box !important;
          position: fixed !important;
          transform: none !important;
          z-index: 10 !important;
          overflow-x: hidden !important;
          padding: 0 !important;
          padding-bottom: 0 !important;
        }
        .reveal .slides,
        .reveal .slides .stack {
          display: block !important;
          align-items: flex-start !important;
          justify-content: flex-start !important;
        }
        .slides-close-btn {
          top: 40px !important;
          right: 40px !important;
          width: 48px !important;
          height: 48px !important;
          font-size: 2em !important;
          z-index: 9999 !important;
          position: fixed !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          pointer-events: all !important;
          touch-action: manipulation !important;
          opacity: 0.4 !important;
          transition: opacity 0.2s !important;
          background: none !important;
          border-radius: 0 !important;
        }
        .slides-close-btn:hover,
        .slides-close-btn:active,
        .slides-close-btn:focus {
          opacity: 0.8 !important;
        }
        .slides-close-btn > * {
          width: 1.5em !important;
          height: 1.5em !important;
          font-size: 1.5em !important;
        }
        .reveal .backgrounds, .reveal .progress, .reveal .controls {
          display: none !important;
        }
        .reveal {
          font-size: ${settings.mobileFontSizeHorizontal} !important;
        }
        .reveal .slides > section.present {
          min-height: 100vh !important;
          height: 100vh !important;
          ${settings.mobileScrollableSlides
            ? `
          overflow-y: auto !important;
          display: block !important;
          `
            : `
          overflow-y: hidden !important;
          display: flex !important;
          flex-direction: column !important;
          align-items: center !important;
          justify-content: center !important;
          `
          }
          padding-left: 6vw !important;
          padding-right: 6vw !important;
          padding-top: max(3vw, env(safe-area-inset-top, 20px)) !important;
          padding-bottom: max(3vw, env(safe-area-inset-bottom, 20px)) !important;
          background: none !important;
        }
      }
    `;
  }

  styleTag.textContent = desktopCss + mobileCss;
  document.head.appendChild(styleTag);
}

function injectScrollCss(settings: SlideImprovementsSettings) {
  const id = "obsidian-slide-improvements-scroll-styles";
  document.getElementById(id)?.remove();

  const styleTag = document.createElement("style");
  styleTag.id = id;

  let scrollCss = "";

  // Desktop/tablet scrolling - independent of styling settings
  if (settings.scrollableSlides) {
    scrollCss += `
      @media (pointer: fine), (hover: hover) {
        .reveal .slides > section {
          overflow-y: auto !important;
          max-height: 100% !important;
          scrollbar-width: none !important;
          -ms-overflow-style: none !important;
        }
        .reveal .slides > section::-webkit-scrollbar {
          width: 0 !important;
          height: 0 !important;
          display: none !important;
          background: transparent !important;
        }
      }
      @media (pointer: fine) and (min-width: 768px) and (max-width: 1400px) and (orientation: landscape) {
        .reveal,
        .reveal .viewport,
        .reveal .slides,
        .reveal .slides .stack,
        .reveal .slides > section,
        .reveal .slides > section.present {
          height: 100vh !important;
          min-height: 100vh !important;
          max-height: 100vh !important;
        }
        .reveal .slides > section,
        .reveal .slides > section.present {
          overflow-y: auto !important;
          -webkit-overflow-scrolling: touch !important;
          scrollbar-width: none !important;
          -ms-overflow-style: none !important;
        }
        .reveal .slides > section::-webkit-scrollbar,
        .reveal .slides > section.present::-webkit-scrollbar {
          width: 0 !important;
          height: 0 !important;
          display: none !important;
          background: transparent !important;
        }
      }
    `;
  } else {
    scrollCss += `
      @media (pointer: fine), (hover: hover) {
        .reveal .slides > section {
          overflow-y: unset !important;
          max-height: unset !important;
          scrollbar-width: unset !important;
          -ms-overflow-style: unset !important;
        }
      }
    `;
  }

  styleTag.textContent = scrollCss;
  document.head.appendChild(styleTag);
}

export default class ObsidianSlideImprovementsPlugin extends Plugin {
  settings!: SlideImprovementsSettings;

  async onload() {
    await this.loadSettings();
    injectSlideCss(this.settings);
    injectScrollCss(this.settings);

    // Re-inject CSS on window resize or orientation change for device rotation/dynamic breakpoints
    window.addEventListener("resize", () => {
      injectSlideCss(this.settings);
      injectScrollCss(this.settings);
    });
    window.addEventListener("orientationchange", () => {
      injectSlideCss(this.settings);
      injectScrollCss(this.settings);
    });

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
        if (newFile instanceof TFile) {
          await this.app.workspace.getLeaf(true).openFile(newFile);
          new Notice(`Slide copy created: ${uniqueFilename}`);
        } else {
          new Notice("Could not open the file. It may be a folder or an unsupported type.");
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
    injectScrollCss(this.settings);
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

    containerEl.createEl("h1", { text: "Slide Improvements - Settings" });

    // --- Settings Section (always visible) ---
    containerEl.createEl("h3", { text: "Settings" });

    // Enable Styling
    new Setting(containerEl)
      .setName("Enable Styling")
      .setDesc("Enable or disable all slide appearance modifications (except scrolling and mobile).")
      .addToggle(toggle =>
        toggle
          .setValue(this.plugin.settings.enableStyling)
          .onChange(async value => {
            this.plugin.settings.enableStyling = value;
            await this.plugin.saveSettings();
            this.display(); // Re-render settings tab
          })
      );

    // Scrollable Slides
    new Setting(containerEl)
      .setName("Scrollable slides")
      .setDesc("Allow slides to scroll vertically when content overflows (desktop/tablet).")
      .addToggle(toggle =>
        toggle
          .setValue(this.plugin.settings.scrollableSlides)
          .onChange(async value => {
            this.plugin.settings.scrollableSlides = value;
            await this.plugin.saveSettings();
          })
      );

    // Output Folder
    new Setting(containerEl)
      .setName("Output folder")
      .setDesc("Folder to save generated slide notes (leave blank for vault root).")
      .addText(text =>
        text
          .setPlaceholder("slides")
          .setValue(this.plugin.settings.outputFolder)
          .onChange(async value => {
            this.plugin.settings.outputFolder = value;
            await this.plugin.saveSettings();
          })
      );

    // --- Styling Section (only if styling is enabled) ---
    if (this.plugin.settings.enableStyling) {
      containerEl.createEl("h3", { text: "Styling" });

      // --- Sizes Subsection ---
      containerEl.createEl("h4", { text: "Sizes" });
      new Setting(containerEl)
        .setName("Base font size")
        .setDesc("Font size for slide content (e.g., 1.6em, 22px)")
        .addText(text =>
          text
            .setValue(this.plugin.settings.baseFontSize)
            .onChange(async value => {
              this.plugin.settings.baseFontSize = value;
              await this.plugin.saveSettings();
            })
        );
      new Setting(containerEl)
        .setName("H1 font size")
        .setDesc("Font size for H1 headings (e.g., 2em, 32px)")
        .addText(text =>
          text
            .setValue(this.plugin.settings.h1FontSize)
            .onChange(async value => {
              this.plugin.settings.h1FontSize = value;
              await this.plugin.saveSettings();
            })
        );
      new Setting(containerEl)
        .setName("H2 font size")
        .setDesc("Font size for H2 headings (e.g., 1.4em, 28px)")
        .addText(text =>
          text
            .setValue(this.plugin.settings.h2FontSize)
            .onChange(async value => {
              this.plugin.settings.h2FontSize = value;
              await this.plugin.saveSettings();
            })
        );
      new Setting(containerEl)
        .setName("Slide side padding")
        .setDesc("Left/right padding for slides (e.g., 3vw, 32px)")
        .addText(text =>
          text
            .setValue(this.plugin.settings.slidePadding)
            .onChange(async value => {
              this.plugin.settings.slidePadding = value;
              await this.plugin.saveSettings();
            })
        );
      new Setting(containerEl)
        .setName("Heading top margin")
        .setDesc("Top margin for non-first headings (e.g., 2.5em, 40px)")
        .addText(text =>
          text
            .setValue(this.plugin.settings.headingMarginTop)
            .onChange(async value => {
              this.plugin.settings.headingMarginTop = value;
              await this.plugin.saveSettings();
            })
        );

      // --- Colors Subsection ---
      containerEl.createEl("h4", { text: "Colors" });
      new Setting(containerEl)
        .setName("Accent color")
        .setDesc("Accent color for slides (applies to links)")
        .addColorPicker(picker =>
          picker
            .setValue(this.plugin.settings.accentColor || "#A2CF80")
            .onChange(async value => {
              this.plugin.settings.accentColor = value || "#A2CF80";
              await this.plugin.saveSettings();
            })
        );
      new Setting(containerEl)
        .setName("H1 Color")
        .setDesc("Color for H1 headings")
        .addColorPicker(picker =>
          picker
            .setValue(this.plugin.settings.h1Color || "#A2CF80")
            .onChange(async value => {
              this.plugin.settings.h1Color = value || "#A2CF80";
              await this.plugin.saveSettings();
            })
        );
      new Setting(containerEl)
        .setName("H2 Color")
        .setDesc("Color for H2 headings")
        .addColorPicker(picker =>
          picker
            .setValue(this.plugin.settings.h2Color || "#FFD700")
            .onChange(async value => {
              this.plugin.settings.h2Color = value || "#FFD700";
              await this.plugin.saveSettings();
            })
        );
      new Setting(containerEl)
        .setName("H3 Color")
        .setDesc("Color for H3 headings")
        .addColorPicker(picker =>
          picker
            .setValue(this.plugin.settings.h3Color || "#FF8C00")
            .onChange(async value => {
              this.plugin.settings.h3Color = value || "#FF8C00";
              await this.plugin.saveSettings();
            })
        );
      new Setting(containerEl)
        .setName("H4 Color")
        .setDesc("Color for H4 headings")
        .addColorPicker(picker =>
          picker
            .setValue(this.plugin.settings.h4Color || "#1E90FF")
            .onChange(async value => {
              this.plugin.settings.h4Color = value || "#1E90FF";
              await this.plugin.saveSettings();
            })
        );
      new Setting(containerEl)
        .setName("H5 Color")
        .setDesc("Color for H5 headings")
        .addColorPicker(picker =>
          picker
            .setValue(this.plugin.settings.h5Color || "#BA55D3")
            .onChange(async value => {
              this.plugin.settings.h5Color = value || "#BA55D3";
              await this.plugin.saveSettings();
            })
        );
      new Setting(containerEl)
        .setName("H6 Color")
        .setDesc("Color for H6 headings")
        .addColorPicker(picker =>
          picker
            .setValue(this.plugin.settings.h6Color || "#FF69B4")
            .onChange(async value => {
              this.plugin.settings.h6Color = value || "#FF69B4";
              await this.plugin.saveSettings();
            })
        );
    }

    // --- Mobile Section ---
    containerEl.createEl("h3", { text: "Mobile" });
    new Setting(containerEl)
      .setName("Enable Mobile Styling")
      .setDesc("Enable custom mobile presentation styling (scaling, close icon, etc).")
      .addToggle(toggle =>
        toggle
          .setValue(this.plugin.settings.enableMobileStyling)
          .onChange(async value => {
            this.plugin.settings.enableMobileStyling = value;
            await this.plugin.saveSettings();
            this.display();
          })
      );

    if (this.plugin.settings.enableMobileStyling) {
      new Setting(containerEl)
        .setName("Mobile font size (vertical/portrait)")
        .setDesc("Base font size for slides in vertical (portrait) mobile presentation mode (e.g., 4vw).")
        .addText(text =>
          text
            .setValue(this.plugin.settings.mobileFontSizeVertical)
            .onChange(async value => {
              this.plugin.settings.mobileFontSizeVertical = value;
              await this.plugin.saveSettings();
            })
        );
      new Setting(containerEl)
        .setName("Mobile font size (horizontal/landscape)")
        .setDesc("Base font size for slides in horizontal (landscape) mobile presentation mode (e.g., 3vw).")
        .addText(text =>
          text
            .setValue(this.plugin.settings.mobileFontSizeHorizontal)
            .onChange(async value => {
              this.plugin.settings.mobileFontSizeHorizontal = value;
              await this.plugin.saveSettings();
            })
        );
      new Setting(containerEl)
        .setName("Mobile Scrollable Slides")
        .setDesc("Allow slides to scroll vertically when content overflows (mobile only).")
        .addToggle(toggle =>
          toggle
            .setValue(this.plugin.settings.mobileScrollableSlides)
            .onChange(async value => {
              this.plugin.settings.mobileScrollableSlides = value;
              await this.plugin.saveSettings();
            })
        );
      new Setting(containerEl)
        .setName("Center content vertically on mobile")
        .setDesc("If enabled, the content of each slide is centered vertically in mobile mode (if content fits).")
        .addToggle(toggle =>
          toggle
            .setValue(this.plugin.settings.centerMobileVertically)
            .onChange(async value => {
              this.plugin.settings.centerMobileVertically = value;
              await this.plugin.saveSettings();
            })
        );
    }
  }
}