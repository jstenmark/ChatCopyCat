import {LoggableMixin} from './log-mixin'

/**
 * Base class for logging functionality. This class is intended to be extended with mixins to provide
 * logging capabilities.
 */
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
class LogBase {
  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor(..._args: any[]) { }
}

/**
 * Creates a new LogBaseMixin by applying the LoggableMixin to the LogBase class.
 */
const LogBaseMixin = LoggableMixin(LogBase)

/**
 * Creates an instance of the LogBaseMixin class, which combines logging functionality with the base log features.
 */
export const log = new LogBaseMixin()
