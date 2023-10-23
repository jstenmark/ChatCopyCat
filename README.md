# ChatCopyCat
## Description
Your ChatCopyCat: Simplifying Code Sharing for Chat-Based Help! 🚀
## Features
- Minify code for reduced token count.
- Copy code with metadata effortlessly.
- Auto-detects file details like filename and language.
- Customize question types and additional info.

## Keybindings

You can use keybindings to quickly access the "Copy Code with Metadata" command:

- **Windows/Linux**: Press `Ctrl+Shift+C`
- **Mac**: Press `Cmd+Shift+C`



## Configuration

You can configure the extension by editing the settings in your Visual Studio Code settings.json file. Customize question types and additional information to suit your project's needs.

## Supported Languages

- Minification is only done to js/ts/python files

## License

This extension is licensed under the [MIT License](LICENSE.md).

## Errors

https://github.com/microsoft/vscode/issues/130367#issuecomment-1723157064

vsce package --yarn --entry extension/out/extension.cjs
vsce package --yarn --entry ./out/extension.cjs

https://github.com/electron-react-boilerplate/electron-react-boilerplate/issues/3112

https://github.com/eemeli/prettier-plugin-properties
https://github.com/un-ts/toml-tools/tree/master/packages/prettier-plugin-toml
https://github.com/Stedi/prettier-plugin-jsonata