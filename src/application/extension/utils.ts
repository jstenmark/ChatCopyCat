import {commandHandlers, devCommands} from '@application/extension/activation'

import {ExtensionContext, commands} from 'vscode'
import {IExtension, ICommand} from '@infra/config'
import {ConfigStoreSingleton} from '@infra/config/config-store'
import {Notify} from '@infra/vscode/notification'
import {log} from '@infra/logging/log-base'

export function registerCommands(context: ExtensionContext): void {

  const commandsList = (context.extension as IExtension).packageJSON.contributes.commands?.filter(command => {
    if (!ConfigStoreSingleton.instance.get<boolean>('catDevMode')) {
      if(devCommands.includes(command.command)) {
        log.debug(`Ignoring ${command.command}`)
        return false
      }
    }
    log.debug(`Registering ${command.command}`)
    return true
  })

  if (!commandsList) {
    Notify.error('Command list empty, extension registration failed')
    return
  }

  for (const cmd of commandsList) {
    registerCommand(context, cmd)
  }
}

async function exec(handler: () => Promise<void>): Promise<void> {
  try {
    return await handler()
  } catch (error) {
    Notify.error('Error executing handler')
    log.error('Error executing handler', error, {truncate:0})
  }
}
function registerCommand(context: ExtensionContext, cmd: ICommand): void {
  const [, action] = cmd.command.split('.')
  const handler = commandHandlers[action]
  if (handler) {
    const command = commands.registerCommand(cmd.command, () => exec(handler))
    context.subscriptions.push(command)
  } else {
    Notify.error(`No handler found for command ${cmd.command}`, true, true)
  }
}
