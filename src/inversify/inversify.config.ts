import 'reflect-metadata'

import {Container} from 'inversify'

import {ClipboardHeadersChecker} from '../application/commands/clipboard-headers'
import {GetSymbolReferencesCommand} from '../application/commands/references-command'
import {ClipboardManager} from '../infra/clipboard/clipboard-manager'
import {ClipboardUtils} from '../infra/clipboard/clipboard-utils'
import {QuickCopyManager} from '../infra/clipboard/quickcopy-manager'
import {StatusBarManager} from '../infra/vscode/statusbar-manager'
import {TYPES} from './types'

const container = new Container({
  skipBaseClassChecks: true, autoBindInjectable: true,
})

container.bind<ClipboardManager>(TYPES.ClipboardManager).to(ClipboardManager).inSingletonScope()
container.bind<StatusBarManager>(TYPES.StatusBarManager).to(StatusBarManager).inSingletonScope()
container.bind<ClipboardHeadersChecker>(TYPES.ClipboardHeadersChecker).to(ClipboardHeadersChecker).inSingletonScope()
container.bind<ClipboardUtils>(TYPES.ClipboardUtils).to(ClipboardUtils).inSingletonScope()
container.bind<QuickCopyManager>(TYPES.QuickCopyManager).to(QuickCopyManager).inSingletonScope()
container.bind<GetSymbolReferencesCommand>(TYPES.GetSymbolReferencesCommand).to(GetSymbolReferencesCommand).inSingletonScope()

export {container}
