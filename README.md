# Obsidian Slide Improvements

Enhanced slide and heading styling for [Obsidian](https://obsidian.md/) presentations using [Reveal.js](https://revealjs.com/).

## Features

- Customizable slide and heading styles for Reveal.js presentations.
- Option to enable or disable scrolling on slides when content overflows.
- Accent and heading color customization.
- Configurable output folder for generated presentation notes.
- Command to quickly generate a slide-ready copy of a note (with slide breaks inserted automatically at H1 and H2 headings).

## Mobile Features

- **Separate font sizes for vertical (portrait) and horizontal (landscape) mobile modes.**
- **Option to center slide content vertically** on mobile (portrait/landscape).
- **Safe area-aware top padding**: Content is automatically pushed below screen notches/cutouts (such as iPhone Dynamic Island) so nothing is hidden.
- **Improved close button**: Now smaller, less visually distracting, and easier to tap.

## Usage

1. **Install and enable the plugin in Obsidian.**
2. **Configure appearance and mobile behavior in the plugin settings:**
    - Choose separate font sizes for vertical (portrait) and horizontal (landscape) mobile modes.
    - Enable or disable vertical centering of slide content on mobile.
    - Set colors, padding, scrollability, heading margins, and more.
3. **Create a presentation-ready copy of any note** using the command palette (`Ctrl+P` / `Cmd+P`) and searching for "Create Slide Copy for Presentation."
    - This command automatically inserts slide breaks (`---`) before each H1 (`#`) and H2 (`##`) heading in your note, except before the first heading.
4. **Present your notes with improved styling and mobile usability.**

## Settings

- **Enable Styling**: Toggle all slide appearance modifications (except scrolling and mobile).
- **Scrollable Slides**: Allow slides to scroll vertically if content overflows.
- **Output Folder**: Where to save generated slide notes.
- **Font Sizes**: Set base font size and heading sizes for desktop, and base font size separately for mobile (portrait/landscape).
- **Slide Padding**: Set left/right padding for slides.
- **Heading Margin**: Set top margin for non-first headings.
- **Accent and Heading Colors**: Customize colors.
- **Mobile Customizations**:
  - Enable mobile styling.
  - Font size for portrait and landscape.
  - Scrollable slides on mobile.
  - Center content vertically (mobile only).

## Notes on Heading Margins

- **No top margin is added to the first H1 or H2 in a note.**
  This is intentional: CSS cannot reliably detect if there is any text above the first heading, and extra space above the main heading is generally unwanted. All subsequent H1/H2/H3/etc. headings will have the configured top margin.

## Notes

- **Safe Area Support:**  
  The plugin uses the device's safe-area insets to push content below notches/cutouts, improving compatibility with modern phones (such as iPhones with Dynamic Island).

## Limitations

- Some Reveal.js theming or custom CSS in your vault may override these styles.  
- CSS cannot detect whether the first heading in a slide has text above it, so the margin rule is applied for all but the first H1/H2.
- The plugin is tested on Obsidian's built-in Reveal.js presentations. Custom slide setups may need further adjustments.

## Contributing

PRs welcome! Please open an issue or discussion for feature requests or bug reports.

## License

MIT