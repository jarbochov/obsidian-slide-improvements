"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/main.ts
var main_exports = {};
__export(main_exports, {
  default: () => ObsidianSlideImprovementsPlugin
});
module.exports = __toCommonJS(main_exports);
var import_obsidian = require("obsidian");
var DEFAULT_SETTINGS = {
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
  h6Color: "#FF69B4"
};
function injectSlideCss(settings) {
}
function injectScrollCss(scrollable) {
}
var ObsidianSlideImprovementsPlugin = class extends import_obsidian.Plugin {
  async onload() {
    await this.loadSettings();
    injectSlideCss(this.settings);
    injectScrollCss(this.settings.scrollableSlides);
    this.addCommand({
      id: "create-slide-note",
      name: "Create Slide Copy for Presentation",
      editorCallback: async (editor, view) => {
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
};
var SlideImprovementsSettingTab = class extends import_obsidian.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  display() {
  }
};
