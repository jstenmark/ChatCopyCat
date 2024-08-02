import 'reflect-metadata' // Import reflect-metadata at the top

import {Container} from 'inversify'
import {TYPES} from './types'
import {ClipboardManager} from '../infra/clipboard/clipboard-manager'
import {StatusBarManager} from '../infra/vscode/statusbar-manager'
import {ClipboardHeadersChecker} from '../application/commands/clipboard-headers'
import {ClipboardUtils} from '../infra/clipboard/clipboard-utils'
import {QuickCopyManager} from '../infra/clipboard/quickcopy-manager'

const container = new Container()

container.bind<ClipboardManager>(TYPES.ClipboardManager).to(ClipboardManager).inSingletonScope()
container.bind<StatusBarManager>(TYPES.StatusBarManager).to(StatusBarManager).inSingletonScope()
container.bind<ClipboardHeadersChecker>(TYPES.ClipboardHeadersChecker).to(ClipboardHeadersChecker).inSingletonScope()
container.bind<ClipboardUtils>(TYPES.ClipboardUtils).to(ClipboardUtils).inSingletonScope()
container.bind<QuickCopyManager>(TYPES.QuickCopyManager).to(QuickCopyManager).inSingletonScope()

// container.bind<GetSymbolReferencesCommand>(TYPES.GetSymbolReferencesCommand).to(GetSymbolReferencesCommand).inSingletonScope()

export {container}
