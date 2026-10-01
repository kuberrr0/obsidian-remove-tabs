# Remove Tabs

An Obsidian plugin that removes tabs. Whatever you have open is the only tab, and the tab bar is gone.

## What it does

- **No new tabs.** Anything that would open a new tab opens in the current one instead. That covers Cmd/Ctrl+click, middle-click, "Open in new tab" and the New tab command.
- **Extra tabs are closed.** If a tab is created some other way (a saved workspace layout, dragging a file in, another plugin), the plugin keeps the tab you're looking at and closes the rest.
- **No tab bar.** The tab bar is hidden in the main editor area and in popout windows.

The sidebar toggle buttons still work. They float in the note's header when a sidebar is collapsed. On macOS the header leaves room for the window buttons (close, minimise, full screen), and you can move the window by dragging the empty space beside the note title.

## What it leaves alone

- **Sidebars keep their tabs.** Those tabs are how you switch between File explorer, Search, Outline and so on.
- **Splits still work.** Each pane holds one note and has no tab bar.
- **Popout windows** are allowed, each with one note and no tab bar.

## Things that behave differently

| Action | With this plugin |
|---|---|
| Cmd/Ctrl+click a link | Opens in the current tab |
| New tab (Cmd/Ctrl+T) | Replaces the current note with an empty page |
| Close tab (Cmd/Ctrl+W) | Closes the note and leaves an empty page |
| Enabling the plugin | Closes every open tab except the one you're viewing |

Disabling the plugin restores normal tab behaviour. Tabs it already closed don't come back.

## Installation

The plugin isn't in the community plugin directory yet. To install it manually:

1. Download `main.js`, `manifest.json` and `styles.css` from this repository.
2. Create the folder `<your vault>/.obsidian/plugins/remove-tabs/` and put the three files in it.
3. In Obsidian, open **Settings → Community plugins**, click the refresh button and turn on **Remove Tabs**.

You can also install it with [BRAT](https://github.com/TfTHacker/obsidian42-brat) using the repository `kuberrr0/obsidian-remove-tabs`.

## Compatibility

Requires Obsidian 1.5.0 or later. Tested on Obsidian 1.12.7 on macOS with the hidden title bar style. The plugin doesn't block mobile, but it hasn't been tested there.

## Why it's a plugin and not a theme

Hiding the tab bar is pure CSS, but stopping tabs from being created needs JavaScript, and themes can only contain CSS. With only the CSS, links would still open in tabs; you just couldn't see or switch to them.

## How it works

- `main.js` wraps `workspace.getLeaf()` so requests for a new tab return the current leaf instead. After every layout change, it collapses any tab group in the main area or a popout window down to its visible tab.
- `styles.css` dissolves the main area's tab header container. Only Obsidian's sidebar toggle buttons, which Obsidian parks there when a sidebar is collapsed, stay visible. The CSS also adds header padding for the toggles and window buttons and limits the window drag area to the title.

## License

[MIT](LICENSE)
