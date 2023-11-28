<div align="center">

<img src="/images/png/logo.png" width="384"/>

# ChatCopyCat



#### VSCode AI prompt workflow utility

Effortlessly utilize AI prompts in your coding workflow with ChatCopyCat, the subtle yet powerful VS Code extension.

</div>


## Just Code and Chill 🛋️
*ChatCopyCat - where a laid-back approach meets powerful coding efficiency.*



ChatCopyCat isn’t about hype. It's your coding sidekick that respects your space and enhances your workflow without fanfare or intrusion, sliding into the chatter with a "do your thing" attitude. No sales pitch, just a nifty tool that's there when you need it, invisible when you don't. It's about keeping things real and your code flowing.

- **Sync with Simplicity**: Effortlessly sync your code with AI prompts.
- **Customizable Interaction**: Add context to your code in your own style.
- **Token Economy**: Minimize token usage for optimal performance.

Code as serene as a cat napping in a sunbeam, that's ChatCopyCat for you.

## Chilled-Out Features

- **Paste & Relax**: Just do a few `ctrl+c's` to get prompt-ready, or don't. No pressure. 
- **Clipboard Harmony**: Compile your code snippets in a symphony of productivity.
- **Versatile Selection**: Select one, select all—bring some diagnostics, references included for free.
- **Trim the fat**: Minify? Tabify? Cleanify? Sure, if your window calls for it.
- **Context on Command**: Contextual information at your fingertips, only when you want it.
- **File Sense**: Subtle file detail recognition, by choice.
- **You Do You**: Customize if you want, or go with the flow. This cat's not judging.

## Keybindings - No Overload, Promise
>`Ctrl+Shift+C` That’s it, no key combo craziness. Whether copying code, silencing suggestions, or starting afresh, this keybinding adjusts to your context

- **Quick Copy**: `Ctrl+Shift+C` -  Snag your code, style it up, make it prompt-ready.

- **Silence Suggestions**: `Ctrl+Shift+C` - Quiets down those pesky suggestions instantly.

- **Clipboard Do-Over**: Double-tap `Ctrl+Shift+C` - Made a mess? Clean slate in under half a second.

## Settings? Sure, If You Want
Tweak these settings in the usual VS Code settings area under "ChatCopyCat".
*OR* Open up the command pallete and look for `CCCat: Config..` if youre in a hurry. Or if you want to reset to defaults.


- **`enableReferenceWithCopy`**: Bring symbol references on to easily provide context for your AI coding assistant

- **`enableInquiryType`**: Choose if you want to set the prompt context manually.

- **`enableClipboardResetCombo`**: Double-tap `Ctrl+Shift+C` within 0.5 seconds to clear the clipboard.

- **`customDefaultInquiryMessage`**: Set a default inquiry message for new copy actions.

- **`enableDiagnostics`**: Include code errors with your selections.

- **`convertSpacesToTabs`**: Use tabs instead of spaces for indentation.

- **`enableCommentRemoval`**: Automatically remove comments from your selections.

- **`showLanguageInSnippets`**: Display the language ID in code blocks.

- **`logLevelInChannel`**: Adjust the log level for debugging.

### Organized Settings for ChatCopyCat Extension

#### Clipboard Features
- **Clipboard Reset Combo**  
  `chatcopycat.enableClipboardResetCombo`: Enable double-tap reset for the clipboard. Default: `true`.

- **Inquiry Type**  
  `chatcopycat.enableInquiryType`: Prompt for the type of inquiry with each copy action. Default: `true`.

- **Reference With Copy**  
  `chatcopycat.enableReferenceWithCopy`: Optionally append references to copied selection. Default: `false`.

- **Diagnostics Inclusion**  
  `chatcopycat.enableDiagnostics`: Include code errors with selections. Default: `true`.

- **Comment Removal**  
  `chatcopycat.enableCommentRemoval`: Remove comments when possible. Default: `true`.

- **Spaces to Tabs Conversion**  
  `chatcopycat.convertSpacesToTabs`: Use tabs for indentation. Default: `true`.

- **Whitespace Removal**  
  `chatcopycat.enableSpacesTabsNewlinesRemoval`: Remove excess whitespaces and newlines. Default: `true`.

- **Custom Inquiry Types**  
  `chatcopycat.customInquiryTypes`: Customize inquiry types. Default: Array of standard inquiries.

- **Custom Diagnostics Message**  
  `chatcopycat.customDiagnosticsMessage`: Add a custom message to the diagnostics section.

- **Default Inquiry Message**  
  `chatcopycat.customDefaultInquiryMessage`: Set a default inquiry message for new copy actions.

- **Force Focus on Last Editor**  
  `chatcopycat.enableForceFocusLastTrackedEditor`: Force focus on the last tracked editor. Default: `true`.

- **Language Display in Snippets**  
  `chatcopycat.showLanguageInSnippets`: Show language ID in code blocks. Default: `true`.

#### File Tree and Definitions
- **File Tree Ignore List**  
  `chatcopycat.fileTreeIgnoreList`: Paths to ignore in the file tree dialog.

- **Definitions Allow List**  
  `chatcopycat.definitionsAllowList`: Support custom file extensions for definitions.

- **Definitions Ignore List**  
  `chatcopycat.definitionsIgnoreList`: Paths to ignore in definitions selection dialog.

#### Extension and Development Settings
- **Log Level**  
  `chatcopycat.logLevelInChannel`: Set the log level for the extension. Default: `"INFO"`.

- **Message Truncate Length**  
  `chatcopycat.defaultMessageTruncate`: Set max length for log messages. Default: `200`.

- **Data Truncate Length**  
  `chatcopycat.defaultDataTruncate`: Set max length for logged data objects. Default: `500`.

- **Folder Watching for Reload**  
  `chatcopycat.enableFolderWatchingForWindowReload`: Reload window on file changes during development. Default: `false`.

- **Development Mode**  
  `chatcopycat.enableDevelopmentMode`: Enable development-specific functionalities. Default: `false`.


## Enhanced Descriptions for ChatCopyCat Commands

1. **Copy Code**  
   - **Command**: `chatcopycat.copyCode`
   - **Title**: "Copy selection or document (or append to clipboard)"
   - **Description**: Streamlines the copying process by intelligently detecting the context. If no clipboard content exists, it copies the current selection or entire document. If clipboard content exists, it appends the new selection, integrating with existing file tree data, diagnostics, references, and inquiry types. Facilitates closing of inquiry dialogs via the copy key binding for seamless user experience.

2. **Copy File Tree**  
   - **Command**: `chatcopycat.getFileTree`
   - **Title**: "Copy filetree (or append to clipboard)"
   - **Description**: Efficiently copies the entire project's file tree structure to the clipboard. If the clipboard already contains data, it appends or replaces the file tree information, considering existing inquiry content for a cohesive data structure.

3. **Copy Definitions from Current Document**  
   - **Command**: `chatcopycat.copyDefinitions`
   - **Title**: "Copy definitions from current document (to clipboard)"
   - **Description**: Extracts and copies all code definitions (like classes, methods, functions) from the currently active document, making it convenient to capture and use essential code structures.

4. **Copy Definitions from Selected Files**  
   - **Command**: `chatcopycat.copyDefinitionsFromFiles`
   - **Title**: "Copy definitions from selected workspace files (to clipboard)"
   - **Description**: Presents a user-friendly dialog to select specific files or folders from the workspace for copying definitions. It remembers previous selections and allows modification of the ignore list directly from the dialog, enabling users to customize their definition extraction process.

5. **Copy Symbol References**  
   - **Command**: `chatcopycat.getSymbolReferences`
   - **Title**: "Copy symbol references (to clipboard)"
   - **Description**: Identifies and copies references of a selected symbol (like a function or method) within the code, allowing for a comprehensive view of where and how a particular code piece is used across the project.

6. **Reset Clipboard**  
   - **Command**: `chatcopycat.resetClipboard`
   - **Title**: "Clear/reset clipboard"
   - **Description**: Provides a quick and easy way to clear the clipboard content. A double-tap of the copy key binding within a short interval triggers the clipboard reset, offering a streamlined way to start afresh.

7. **Open Menu/Command Center**  
   - **Command**: `chatcopycat.openMenu`
   - **Title**: "Menu/Command Center"
   - **Description**: Opens a central menu that provides easy access to various functionalities of the ChatCopyCat extension, acting as a one-stop hub for all features and settings.

8. **Open Settings**  
   - **Command**: `chatcopycat.openSettings`
   - **Title**: "Configuration/Extension settings"
   - **Description**: Directly navigates to the settings page for ChatCopyCat, allowing users to customize and configure the extension according to their workflow and preferences.

9. **Close Dialog (Development Command)**  
   - **Command**: `chatcopycat.closeDialog`
   - **Title**: "Close dialog"
   - **Description**: Designed for development purposes, this command swiftly closes any open dialogs within the extension, streamlining the testing and development process.

10. **Reload Window (Development Command)**  
    - **Command**: `chatcopycat.reloadWindow`
    - **Title**: "Reload Window"
    - **Description**: A development-centric command that enables quick reloading of the VS Code window, facilitating rapid testing and iteration during the extension development.


## Enhanced Descriptions for ChatCopyCat Menus and Keybindings

**Menus:**

1. **Context Menu in Editor**
   - **Command**: `chatcopycat.getSymbolReferences`
   - **Group**: "navigation"
   - **Description**: Adds an option in the editor's context menu to copy symbol references. This feature allows users to right-click on a symbol (like a function or method) in the editor and quickly copy all its references to the clipboard, enhancing code navigation and analysis.

**Keybindings:**

1. **Copy Code Keybinding**
   - **Key**: "Ctrl+Shift+C"
   - **Command**: `chatcopycat.copyCode`
   - **When**: Active when focus is not in the terminal, and the editor has text focus without any open dialog or Quick Open menu.
   - **Description**: This keybinding is the heart of ChatCopyCat, handling multiple actions based on context. It copies the current selection or the entire document, appends to existing clipboard content, and interacts with various features like file tree, diagnostics, and inquiry dialogs. It's a versatile shortcut that adapts to the user's current focus and clipboard content.

2. **Close Dialog Keybinding**
   - **Key**: "Ctrl+Shift+C"
   - **Command**: `chatcopycat.closeDialog`
   - **When**: Active when a dialog is open, and the focus is not in the terminal.
   - **Description**: A convenient shortcut to close open inquiry dialogs within the extension. This keybinding ensures that users can quickly dismiss dialogs without disrupting their workflow, maintaining the efficiency and fluidity of the coding process.

## Staying Fresh
Right now, ChatCopyCat is all about choice—grab what you need, tag it if you feel like it, and keep it simple.

- **[Future Brainwaves](ROADMAP.md)**: We’re all about evolving without complicating.

For now, whether it's a snippet or the whole shebang, we're keeping it casual and integrated.


## Open Source and Community-Driven 💚
ChatCopyCat is yours, free and easy, under the [MIT License](LICENSE.md). Share, tweak, be yourself, do your thing.


## Alley-Oop!
Join the ChatCopyCat community on [GitHub](https://github.com/jstenmark/ChatCopyCat). Share your experience, suggest features, or contribute to the project. Bugs, brainwaves, PRs—all welcome. Your insights make us better!

Keep it laid-back, coders. 🐾

