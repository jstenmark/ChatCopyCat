import {ChannelLoggerMixin} from '@infra/logging/log-mixin'

/**
 * Base class for logging functionality. This class is intended to be extended with mixins to provide
 * logging capabilities.
 */
class LoggerBase { }

export const log = new (ChannelLoggerMixin(LoggerBase))()
