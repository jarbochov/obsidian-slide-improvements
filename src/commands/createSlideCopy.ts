import { App, Notice, MarkdownView, TFile, normalizePath } from "obsidian";
import { SlideImprovementsSettings } from "../types";

export async function createSlideCopyCommand(app: App, settings: SlideImprovementsSettings, editor: any, view: any) {
  if (!(view instanceof MarkdownView)) {
    new Notice("No active Markdown file.");
    return;
  }
  const file = view.file;
  let md = view.getViewData();
  // ...rest of your command logic...
}