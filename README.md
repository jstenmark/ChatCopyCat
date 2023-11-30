<div align="center">

<img src="images/png/logo.png" width="384"/>

# ChatCopyCat  



#### VSCode AI prompt workflow utility 

Effortlessly utilize AI prompts in your coding workflow with ChatCopyCat :cat: - the subtle yet powerful VS Code extension 

</div>

---
## Just Code and Chill 🛋️ 
ChatCopyCat isn’t about hype. It's your coding sidekick that respects your space and enhances your workflow without fanfare or intrusion, sliding into the chatter with a "do your thing" attitude. No sales pitch, just a nifty tool that's there when you need it, invisible when you don't. It's about keeping things real and your code flowing.

- **Sync with Simplicity**: Effortlessly sync your code with AI prompts.
- **Customizable Interaction**: Add context to your code in your own style.
- **Token Economy**: Minimize token usage for optimal performance.

Code as serene as a cat napping in a sunbeam, that's ChatCopyCat for you. 

---
## Chilled-Out Features 
- **Paste & Relax**: Just do a few copies to get prompt-ready, or don't. No pressure. 
- **Clipboard Harmony**: Appends your code snippets or project context in a symphony of productivity.
- **Versatile Selection**: Select one, select all—bring some diagnostics, references included for free.
- **Trim the fat**: *Minify*? *Tabify*? *Cleanify*? Sure, if your context window calls for it.
- **Context on Command**: Contextual information at your fingertips, only when you want it.
- **File Sense**: Subtle file details, by choice.
- **You Do You**: Customize if you want, however you want, or go with the flow. This cat's not judging.

---
## Keybindings - No Overload, Promise
> <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>C</kbd> That’s it, no key combo craziness.<br>
 
Whether copying code, silencing suggestions,<br> or starting fresh, this command adjusts to your context


**Quick Copy**: <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>C</kbd> -  Snag your code, style it up, make it prompt-ready.

**Silence Suggestions**: <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>C</kbd> - Quiets down those pesky suggestions instantly.

**Clipboard Do-Over**: Double-tap <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>C</kbd> - Made a mess? Clean slate in under half a second.


> **WARNING** 
> `copyCode` have the same key bind as `open new terminal`

### Key Binds
:scissors: **Copy Code Keybinding** 
   - **Key**: <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>C</kbd>
   - **When**: Active when focus is not in the terminal, and the editor has text focus without any open dialog or Quick Open menu.
   - **Description**: This keybinding is the heart of ChatCopyCat, handling multiple actions based on context. It copies the current selection or the entire document, appends to existing clipboard content, and interacts with various features like file tree, diagnostics, and inquiry dialogs. It's a versatile shortcut that adapts to the user's current focus and clipboard content.

**Close Dialog Keybinding** 
   - **Key**: <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>C</kbd>
   - **When**: Active when a dialog is open, and the focus is not in the terminal.
   - **Description**: A convenient shortcut to close open inquiry dialogs within the extension. This keybinding ensures that users can quickly dismiss dialogs without disrupting their workflow, maintaining the efficiency and fluidity of the coding process.


:globe_with_meridians: **Context Menu** <sub>right click in the editor</sub>
1. **Copy Symbol References**
  - **Description**: Adds an option in the editor's context menu to copy symbol references. This feature allows users to right-click on a symbol (like a function or method) in the editor and quickly copy all its references to the clipboard, enhancing code navigation and analysis.


### Commands 
List of commands defined in the extension, you will find them in the command palette under the  `CCCat: .. ` -namespace. Or some of them in the ChatCopyCat Menu.


1. **Copy Code**
   - **Command**: `chatcopycat.copyCode`
   - **Description**: Streamlines the copying process by intelligently detecting the context. If no clipboard content exists, it copies the current selection or entire document. If clipboard content exists, it appends the new selection, integrating with existing file tree data, diagnostics, references, and inquiry types. Facilitates closing of inquiry dialogs via the copy key binding for seamless user experience.
   - **Usage**: Use with the keybinding

2. **Copy File Tree**  
   - **Command**: `chatcopycat.getFileTree`
   - **Description**: Efficiently copies the entire project's file tree structure to the clipboard. If the clipboard already contains data, it appends or replaces the file tree information, considering existing inquiry content for a cohesive data structure.
   - **Usage**: Use with the menu or command palette

3. **Copy Definitions from Document**  
   - **Command**: `chatcopycat.copyDefinitions`
   - **Description**: Extracts and copies all code definitions (like classes, methods, functions) from the currently active document, making it convenient to capture and use essential code structures.
   - **Usage**: Use with the menu or command palette


4. **Copy Definitions from Files**  
   - **Command**: `chatcopycat.copyDefinitionsFromFiles`
   - **Description**: Presents a user-friendly dialog to select specific files or folders from the workspace for copying definitions. It remembers previous selections and allows modification of the ignore list directly from the dialog, enabling users to customize their definition extraction process.
   - **Usage**: Use with the menu or command palette

5. **Copy Symbol References**  
   - **Command**: `chatcopycat.getSymbolReferences`
   - **Description**: Identifies and copies references of a selected symbol (like a function or method) within the code, allowing for a comprehensive view of where and how a particular code piece is used across the project.
   - **Note**: No clipoard context support, except if used with `copyCode`
   - **Usage**: Use with the copy keybinding or command palette

6. **Reset Clipboard**  
   - **Command**: `chatcopycat.resetClipboard`
   - **Description**: Provides a quick and easy way to clear the clipboard content. A double-tap of the copy key binding within a short interval ^0.5sec^ triggers the clipboard reset, offering a streamlined way to start afresh.
  - **Usage**: Use with the copy keybinding-combo

7. **Open Menu/Command Center**  
   - **Command**: `chatcopycat.openMenu`
   - **Description**: Opens a central menu that provides easy access to various functionalities of the ChatCopyCat extension, acting as a one-stop hub for all features and settings.
  - **Usage**: Open with the statusbar item or the command pallette

8. **Open Settings**  
   - **Command**: `chatcopycat.openSettings`
   - **Description**: Opens a custom settings dialog, allowing users to quickly customize and configure the extension according to their workflow and preferences.
  - **Usage**: Open with the extension menu or the command pallette

9. **Close Dialog**  
   - **Command**: `chatcopycat.closeDialog`
   - **Description**: This command swiftly closes any open dialogs within the extension, streamlining the workflow.
   - **Note**: Currently only supported for the inquiry dialog
  - **Usage**: Use with the copy keybinding

10. **(Development Command) Reload Window**  
    - **Command**: `chatcopycat.reloadWindow`
    - **Description**: A development-centric command that enables quick reloading of the VS Code window, facilitating rapid testing and iteration during the extension development.
  - **Usage**: Chained through an watchfile event listener that listens for a filewrite after the extension is installed, see the package.json-script `yarn pkg`.

---
## Language support 

> **NOTE** 
> Configure settings per use-case, feature compatability migh lack for some languages


> **Symbols** 
> Check if your language supports symbols or definitions by looking at the`languageExtensionMap` in `src/shared/constants/consts.ts`. But you could add more languages too, hopefully they got the necessary providers registered in VSCode to handle all features
>
>

1. - **Features fully supported by**: Typescript, Javascript

2. - **Default handling**: 
  - Probably supported by VsCode for symbol/reference fetching.
  - Minification and tabification etc is using a default handler, it's not *that* bad.
  - Langugages with similar syntax (comments, decoratos) should have support as well.

> **NOTE**: 
> Extension adhere to the vscode languages api on best effor, some functionalities are built with TypeScript in mind.

- **Decorator identifiers**: `@` 
  - Class, Method and Property support for symbol definitions
  - **support**: TS / JS / ?
- **Comment indentifiers**: `//`, `/** .. */`
  - Suppots removal of multiline block commments    
  - **support**: TS / JS / ?
- **Line trimming, newline removal and so on**: 
  - *Language independent* - configurable 
- **Conversion of spaces to tabs**:
  - *Language independent* - configurable


## Settings? Sure, If You Want
> ***In a hurry?*** 
> Open the command pallete or extension menu and look for `CCCat: Config..` <br>
> Psst.. *You can also reset to defauls here*

*..or just tweak settings in the usual VS Code settings area under "ChatCopyCat"*


> **NOTE**:  Configure settings per use-case, feature compatability migh lack for some languages



- **`enableReferenceWithCopy`**: Bring symbol references on to easily provide context for your AI coding assistant

- **`enableInquiryType`**: Choose if you want to set the prompt context manually.

- **`enableClipboardResetCombo`**: Double-tap `Ctrl+Shift+C` within 0.5 seconds to clear the clipboard.

- **`customDefaultInquiryMessage`**: Set a default inquiry message for new copy actions.

- **`enableDiagnostics`**: Include code errors with your selections.

- **`convertSpacesToTabs`**: Use tabs instead of spaces for indentation.

- **`enableCommentRemoval`**: Automatically remove comments from your selections.

- **`showLanguageInSnippets`**: Display the language ID in code blocks.

- **`logLevelInChannel`**: Adjust the log level for debugging.

### All settings

<details>
<summary>Clipboard</summary>

#### Clipboard Settings


- **Clipboard Reset Combo**  
  `chatcopycat.enableClipboardResetCombo`: Enable double-tap reset for the clipboard.
  Default: `true`.

- **Inquiry Type**
  `chatcopycat.enableInquiryType`: Prompt for the type of inquiry with each copy action. Default: `true`.

- **Reference With Copy**
  `chatcopycat.enableReferenceWithCopy`: Optionally append references to copied selection. 
  Default: `false`

- **Diagnostics Inclusion**  
  `chatcopycat.enableDiagnostics`: Include code errors with selections.
  Default: `true`.

- **Comment Removal**  
  `chatcopycat.enableCommentRemoval`: Remove comments when possible.
  Default: `true`.

- **Spaces to Tabs Conversion**  
  `chatcopycat.convertSpacesToTabs`: Use tabs for indentation.
  Default: `true`.

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
  `chatcopycat.showLanguageInSnippets`: Show language ID in code blocks.
  Default: `true`.
</details>

<details>
<summary>File Tree & Definitions</summary>

#### File Tree and Definitions Settings
- **File Tree Ignore List**  
  `chatcopycat.fileTreeIgnoreList`: Paths to ignore in the file tree dialog.

- **Definitions Allow List**  
  `chatcopycat.definitionsAllowList`: Support custom file extensions for definitions.

- **Definitions Ignore List**  
  `chatcopycat.definitionsIgnoreList`: Paths to ignore in definitions selection dialog.
</details>

<details>
<summary>Extension & Development</summary>

#### Extension and Development Settings
- **Log Level**  
  `chatcopycat.logLevelInChannel`: Set the log level for the extension.
  Default: `"INFO"`.

- **Message Truncate Length**  
  `chatcopycat.defaultMessageTruncate`: Set max length for log messages.
  Default: `200`.

- **Data Truncate Length**  
  `chatcopycat.defaultDataTruncate`: Set max length for logged data objects.
  Default: `500`.

- **Folder Watching for Reload**  
  `chatcopycat.enableFolderWatchingForWindowReload`: Reload window on file changes during development.
  Default: `false`.

- **Development Mode**  
  `chatcopycat.enableDevelopmentMode`: Enable development-specific functionalities.
  Default: `false`.

</details>


## Staying Fresh
Right now, ChatCopyCat is all about choice—grab what you need, tag it if you feel like it, and keep it simple.

- **[Future Brainwaves](ROADMAP.md)**: We’re all about evolving without complicating.

For now, whether it's a snippet or the whole shebang, we're keeping it casual and integrated.

## Open Source Love 
ChatCopyCat is yours, free and easy, under the [MIT License](LICENSE.md). Share, tweak, be yourself, do your thing.


## Alley-Oop!
Join the ChatCopyCat community on [GitHub](https://github.com/jstenmark/ChatCopyCat). Share your experience, suggest features, or contribute to the project. Bugs, brainwaves, PRs—all welcome. Your insights make us better!

- Need support or want ot get in contact? Check out the git repo or the vscode market page 

Keep it laid-back, coders. 🐾

