import {LoggableMixin} from './log-mixin'

/**
 * Base class for logging functionality. This class is intended to be extended with mixins to provide
 * logging capabilities.
 */
class LogBase {}

/**
 * Creates a new LogBaseMixin by applying the LoggableMixin to the LogBase class.
 */
export const LogBaseMixin = LoggableMixin(LogBase)

/**
 * Creates an instance of the LogBaseMixin class, which combines logging functionality with the base log features.
 */
export const log = new LogBaseMixin()
