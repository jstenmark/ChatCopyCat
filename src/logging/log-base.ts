import { LoggableMixin } from './log-mixin'
class LogBase {}

export const LogBaseMixin = LoggableMixin(LogBase)

export const log = new LogBaseMixin()
