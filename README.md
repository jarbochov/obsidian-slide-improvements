# Slide Improvements

A plugin for [Obsidian](https://obsidian.md) that enhances the appearance, usability, and export of Markdown slides (Reveal.js format) created using the native Slides feature.

---

## Features

- **Styling Controls**: Adjust font sizes, heading colors, padding, and more for slide presentations.
- **Enable/Disable Styling**: Instantly toggle all appearance modifications with a single setting.
- **Scrollable Slides**: Allow slides to scroll vertically when content overflows — works independently of styling.
- **One-Click Slide Copy**: Create a slide-friendly copy of your note, removing YAML frontmatter and inserting slide breaks.
- **Custom Output Folder**: Choose where slide copies are saved.
- **Live Preview**: See your changes instantly reflected in slide presentations.

---

## Settings

### Settings

- **Enable Styling**  
  Enable or disable all slide appearance modifications (such as font size, heading colors, and padding).  
  _Disabling this does not affect scrolling or the slide copy command._

- **Scrollable Slides**  
  Allow slides to scroll vertically when content overflows.  
  _This setting works independently of styling and is always available._

- **Output Folder**  
  Choose the folder where generated slide notes will be saved. Leave blank to use the vault root.

### Styling

_This section appears only if "Enable Styling" is enabled._

#### Sizes

- **Base font size**: Font size for all slide content.
- **H1 font size**: Font size for H1 headings.
- **H2 font size**: Font size for H2 headings.
- **Slide side padding**: Left/right padding for slides.
- **Heading top margin**: Top margin for non-first headings.

#### Colors

- **Accent color**: Used for elements like links and progress bars.
- **H1–H6 Colors**: Set the color for each heading level.

---

## Command: Create Slide Copy for Presentation

Use the command palette to run **"Create Slide Copy for Presentation"**. This will:

- Remove any YAML frontmatter.
- Insert slide breaks (`---`) before each H1/H2 (except the first).
- Save the new note in your chosen output folder.

---

## How It Works

- **Styling and Scrollbar CSS** is injected dynamically based on your settings.
- **No permanent changes** are made to your theme or vault — disabling styling or scrolling is instant.
- **Exported notes** are regular Markdown notes, ready for Obsidian's Slides or Reveal.js.

---

## Installation

1. Download or clone this repository.
2. Copy it into your `.obsidian/plugins` folder.
3. Enable the plugin in Obsidian settings.

---

## Troubleshooting

- **Styling not applying?**  
  Make sure "Enable Styling" is on in the plugin settings.

- **Scrollbars visible?**  
  The plugin hides scrollbars while still allowing scrolling.

- **Need to reset?**  
  Disable and re-enable "Enable Styling" or reload Obsidian.

---

## License

MIT
