<div align="center" id="readme">

<img src="images/png/logo.png" width="384"/>

# ChatCopyCat



#### VSCode AI prompt workflow utility

Effortlessly copy code between your IDE and *AI-assistant/ChatGPT* tab

</div>

---
## Just Code and Chill 🛋️
ChatCopyCat isn’t about hype. This extension respects your space and enhances your workflow without fanfare or intrusion, sliding into the chatter with a "do your thing" attitude. No sales pitch, just a nifty tool that's there when you need it, invisible when you don't. It's about keeping things real and your code flowing.

> **Tailored for developers seeking efficiency and precision**, this tool offers a suite of features like intelligent clipboard management, customizable code interactions, and token-efficient performance enhancements. Whether you're streamlining code snippets, managing project contexts, or optimizing code structures, ChatCopyCat enhances productivity without complicating your workspace. Its adaptable nature ensures it fits perfectly into your coding style, making it an indispensable part of your software development toolkit.

- **Sync with Simplicity**: Effortlessly sync your code with AI prompts.
- **Customizable Interaction**: Add context to your code in your own style.
- **Token Economy**: Minimize token usage for optimal LLM-performance.

Code as serene as a cat napping in a sunbeam, that's ChatCopyCat for you.

---

## ChatGPT conversation examples

- [Code optimization with references](https://chat.openai.com/share/4f8f4c07-0368-42a5-b9fb-20c9e1983dcb)

- [Copying references for improved contextual understanding](https://chat.openai.com/share/fc8ac779-f085-4ab7-bfa6-cc1260a0c199)

- [Copy and included code errors + copy code references](https://chat.openai.com/share/cb41bc67-2f81-44ca-b5ac-49a96658870c)

- [Copy references exapmle 2](https://chat.openai.com/share/fbd83096-2497-4ad6-9f10-facf6e69850c)

- [Copy document and include file-tree](https://chat.openai.com/share/8312de87-0268-443b-a960-44c0ffe59e6a)

---

## Installing ChatCopyCat: A Walk in the Park 🌳

Here's how you can get this cool cat purring in your VSCode:

#### Straight from the Marketplace - *Like Shopping for Catnip*
1. **Stroll over to the Marketplace**: Just click your way to the [ChatCopyCat's cozy corner in the VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=JStenmark.chatcopycat&ssr=false#overview) and follow the instructions.

#### Inside VSCode - *Easy as a Catnap*
1. **Pop Open VSCode**: Launch your trusty sidekick, VSCode.
2. **Extensions are your Friend**: `Ctrl+Shift+X` (or `Cmd+Shift+X` for the cool Mac cats) will get you to Extensions.
3. **Search for the Cat**: Type in `ChatCopyCat`, easy as looking up your favorite cat videos.
4. **Click 'Install'**: Find our ChatCopyCat and give it a home with a simple click.

#### Command Palette - *For the Keyboard Connoisseurs*
1. **Command Palette Magic**: `Ctrl+Shift+P` or `Cmd+Shift+P` – the magic wand of VSCode.
2. **Whisper the Magic Words**:

```
ext install JStenmark.chatcopycat
```
hit Enter, and watch the magic happen.

And voilà! You're all set. ChatCopyCat is now part of your coding family, ready to make your life easier, one prompt at a time. Happy coding, and remember to keep it relaxed and fun – just like a cat chasing sunbeams. 🐾

---

## Chilled-Out Features
- **Paste & Relax**: Just do a few copies to get prompt-ready, or don't. No pressure.
- **Clipboard Harmony**: Appends your code snippets or project context in a symphony of productivity.
- **Versatile Selection**: Select one, select all—bring some diagnostics, references included for free.
- **Trim the fat**: *Minify*? *Tabify*? *Cleanify*? Sure, if your window calls for it.
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


> :warning: **Important**
> - **`chatcopycat.copyCode`** have the same key bind as **`open new terminal`**
> - **VSCodeVim** users might experience overloading. *But we have faith in your terminal-like transcendence journey*.

### Key Binds
1. **Copy Code Keybinding**
   - **Key**: <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>C</kbd>
   - **When**: Active when focus is not in the terminal, and the editor has text focus without any open dialog or Quick Open menu.
   - **Description**: This keybinding is the heart of ChatCopyCat, handling multiple actions based on context. It copies the current selection or the entire document, appends to existing clipboard content, and interacts with various features like file tree, diagnostics, and inquiry dialogs. It's a versatile shortcut that adapts to the user's current focus and clipboard content.

2. **Close Dialog Keybinding**
   - **Key**: <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>C</kbd>
   - **When**: Active when a dialog is open, and the focus is not in the terminal.
   - **Description**: A convenient shortcut to close open inquiry dialogs within the extension. This keybinding ensures that users can quickly dismiss dialogs without disrupting their workflow, maintaining the efficiency and fluidity of the coding process.


3. **Copy Symbol References context menu** <sub>right click in the editor</sub>
    - **Description**: Adds an option in the editor's context menu to copy symbol references. This feature allows users to right-click on a symbol (like a function or method) in the editor and quickly copy all its references to the clipboard, enhancing code navigation and analysis.


### Commands
List of commands defined in the extension, you will find them in the command palette under the  `CCCat: ..`-namespace. Or listed in the extension menu.

1. **Copy Code** (`chatcopycat.copyCode`)
    - **Description**: Streamlines the copying process by intelligently detecting the context.If no clipboard content exists, it copies the current selection or entire document. If clipboard content exists, it appends the new selection, integrating with existing file tree data, diagnostics, references, and inquiry types. Facilitates closing of inquiry dialogs via the copy key binding for seamless user experience.
    - **Usage**: Use with the keybinding


2. **Copy File Tree** `chatcopycat.getFileTree`
    - **Description**: Efficiently copies the entire project's file tree structure to the clipboard. If the clipboard already contains data, it appends or replaces the file tree information, considering existing inquiry content for a cohesive data structure.
    - **Usage**: Execute from the extension menu / command palette.

3. **Copy Definitions from Document** `chatcopycat.copyDefinitions`
    - **Description**: Extracts and copies all code definitions (like classes, methods, functions) from the currently active document, making it convenient to capture and use essential code structures.
    - **Usage**: Execute from the extension menu / command palette.

4. **Copy Definitions from Files** `chatcopycat.copyDefinitionsFromFiles`
    - **Description**: Presents a user-friendly dialog to select specific files or folders from the workspace for copying definitions. It remembers previous selections and allows modification of the ignore list directly from the dialog, enabling users to customize their definition extraction process.
    - **Usage**: Execute from the extension menu / command palette.

5. **Copy Symbol References** `chatcopycat.getSymbolReferences`
    - **Description**: Identifies and copies references of a selected symbol (like a function or method) within the code, allowing for a comprehensive view of where and how a particular code piece is used across the project.
    - **Note**: No clipboard context support, except if used with `copyCode`
    - **Usage**: Use with the copy keybinding or execute from the extension menu / command palette.

6. **Reset Clipboard** `chatcopycat.resetClipboard`
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

---
## Language support
- **Languages fully supported**: Typescript, Javascript

- **Default handling**:
  - Uses VSCode implementations for symbol/reference fetching. *A few specific feature edge-cases are done by best-effort*.
  - Minify, tabify and such features have default fallback handling, configure per usage.
  - Languages with similar syntax as TS (comments, decorators) have corresponding support.

- **Symbols**
  - Feature compatibility trusts language implementations in VSCode. Some languages might lack support for symbol/definition-features.
  - Look at the [languageExtensionMap](src/shared/constants/consts.ts) for default handling.
  - Customize unknown file-extensions

> **NOTE**:
> Extension adhere to the vscode languages-api on best-effort, some functionalities are built with TypeScript in mind.

- **Decorator identifiers**: `@`
  - Class, Method and Property support for symbol definitions
  - **support**: TS / JS / ?
- **Comment identifiers**: `//`, `/** .. */`
  - Supports removal of multiline block comments
  - **support**: TS / JS / ?
- **Line trimming, newline removal and so on**:
  - *Language independent* - configurable
- **Conversion of spaces to tabs**:
  - *Language independent* - configurable


## Settings? Sure, If You Want
> ***In a hurry?***
> Open the command palette or extension menu and look for `CCCat: Config..` <br>
> Psst.. *You can also reset to defaults here*

*..or just tweak settings in the usual VS Code settings area under "ChatCopyCat"*


<details>
<summary>Code-block</summary>

### Code block settings
> These settings modify code block generation.

#### Code Cleanup
- **Excess whitespace/newline/tab Removal**
  `chatcopycat.enableTrimming`: Remove excess whitespace and newline characters.
  Default: `true`.

- **Spaces to Tabs Conversion**
  `chatcopycat.enableSpacesToTabs`: Use tabs for indentation and save tokens!.
  Default: `true`.

- **Removal of comments**
  `chatcopycat.enableCommentRemoval`: Remove comments where possible.
  Default: `true`.

#### Code Metadata
- **Display code language**
  `chatcopycat.enableLanguage`: Display language ID in code blocks.
  Default: `true`.

- **Display relative file path**
  `chatcopycat.enablePath`: Display file path in code blocks.
  Default: `true`.

- **Display line number**
  `chatcopycat.enablePosition`: Display line-num in code blocks or diagnostics sections.
  Default: `true`.

#### Code Context
- **Diagnostics Inclusion**
  `chatcopycat.enableDiagnostics`: Include code errors with selections.
  Default: `true`.

- **Add message to diagnostics section**:
  `chatcopycat.customDiagnosticsMessage`: Set a persisted message to add with the diagnostics section if present.

- **Inquiry Message**
  `chatcopycat.enableInquiryMessage`: Prompt for the type of inquiry with each copy action.
  Default: `true`.

- **Custom Inquiry Messages**
  `chatcopycat.inquiryMessagesList`: Set of prompt instructions that are customizable. Default: Array of standard inquiries.

- **Persisted Inquiry Message**
  `chatcopycat.defaultInquiryMessage`: Set a default persisted inquiry message for new copy actions.


---
### Copy Settings
- **Clipboard Reset Combo**
  `chatcopycat.enableClipboardResetCombo`: Enable double-tap reset for the clipboard.
  Default: `true`.

- **Force Focus to Last Editor**
  `chatcopycat.enableForceFocusLastTrackedEditor`: Force focus to the last tracked editor to avoid some strange VSCode behavior.
  Default: `true`.

- **Add references from copied selection**
  `chatcopycat.enableReferenceWithCopy`: Optionality append references to copied selection. Does not support multi selection
  Default: `false`.

- **Force Focus to Last Editor**
  `chatcopycat.includeDecoratorsInReferences`: Include Class/Method/Property-decorators along with reference symbols ('@'-decorator). Default: `true`.


</details>

<details>
<summary>File Tree & Definitions</summary>

### File Tree and Definitions Settings
- **File Tree Ignore List**
  `chatcopycat.fileTreeIgnoreList`: Paths to ignore in the file-tree dialog.

- **Definitions Allow List**
  `chatcopycat.definitionsAllowList`: Support custom file extensions for copy-definitions.

- **Definitions Ignore List**
  `chatcopycat.definitionsIgnoreList`: Paths to ignore in copy-definitions selection dialog.
</details>

<details>
<summary>Extension & Development</summary>

### Extension and Development Settings
- **Log Level**
  `chatcopycat.catLogLevel`: Set the log level for the extension.
  Default: `"INFO"`.

- **Message Truncate Length**
  `chatcopycat.catLogMsgTruncateLen`: Set max length for log messages.
  Default: `200`.

- **Data Truncate Length**
  `chatcopycat.catLogDataTruncateLen`: Set max length for logged data objects.
  Default: `500`.

- **Folder Watching for Reload**
  `chatcopycat.catEnabledFolderWatcher`: Reload window on file changes during development.
  Default: `false`.

- **Development Mode**
  `chatcopycat.catDevMode`: Enable development-specific functionalities.
  Default: `false`.

</details>


## Staying Fresh
Right now, ChatCopyCat is all about choice—grab what you need, tag it if you feel like it, and keep it simple.

- **Code anonymity**: We're working on  **code anonymization functionalities**, enabling easier workflow without leaking critical codebase/information to the LLM provider. *Please get in touch with maintainer for further information, seeking beta testers.*

- **Codebase refactor**: Mind mind the mess, the codebase is ongoning a facelift, hexagonal pattern <3

- **[Future Brainwaves](ROADMAP.md)**: We’re all about evolving without complicating.

For now, whether it's a snippet or the whole shebang, we're keeping it casual and integrated.

## Open Source Love
ChatCopyCat is yours, free and easy, under the [MIT License](LICENSE.md). Share, tweak, be yourself, do your thing.

## Alley-Oop!
Join the ChatCopyCat community on [GitHub](https://github.com/jstenmark/ChatCopyCat/discussions). Share your experience, suggest features, or contribute to the project. Bugs, brainwaves, PRs—all welcome. Your insights make us better!

Keep it laid-back, coders. 🐾

