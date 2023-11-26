const ERROR_MESSAGES = {
  INVALID_CONFIRMATION: 'Invalid confirmation value. Please enter "yes" or "no".',
  ONLY_LOWER_CASE_ALLOWED: 'Only lowercase letters are allowed.',
  INVALID_URL: 'Invalid URL format.',
  VALUE_CANNOT_BE_EMPTY: 'Value cannot be empty.',
}

/**
 * Coerces an unknown error into an Error object with a custom error message.
 * @param error - The error to coerce.
 * @param customErrorMessage - Custom error message to append.
 * @returns An Error object.
 */
export const errorTypeCoerce = (error: unknown, customErrorMessage = ''): Error => {
  if (error instanceof Error) {
    error.message = `${customErrorMessage}${error.message}`
    return error
  }
  return new Error(`${customErrorMessage}: ${String(error)}`)
}

/**
 * Extracts error message from unknown error type.
 * @param error - The error to extract message from.
 * @param defaultMessage - A default message if error is not an instance of Error.
 * @returns Error message as a string.
 */
export const errorMessage = (error: unknown, defaultMessage?: string): string => {
  return error instanceof Error
    ? `${defaultMessage ? `${defaultMessage} ` : ''}${error.message}`
    : String(error)
}
/**
 * Validates dialog results for various conditions.
 */
export class DialogResultValidator {
  /**
   * Validates if a string is a confirmation value ('yes' or 'no').
   * @param result - The string to validate.
   * @returns A validation error message or null if valid.
   */
  public validateConfirmationResult(result: string): string | null {
    return new Validator(result).isNotEmpty().isConfirmationValue().getErrors()
  }
}

export const dialogResultValidator = new DialogResultValidator()

/**
 * Validates a string against specified criteria.
 */
export class Validator {
  private errors = new Set<string>()

  constructor(private readonly value: string) {}

  public getErrors(): string | null {
    return Array.from(this.errors).join('\r\n') || null
  }

  public isConfirmationValue(validOptions: string[] = ['yes', 'no']): Validator {
    return this.validate(value =>
      validOptions.includes(value.toLowerCase()) ? null : ERROR_MESSAGES.INVALID_CONFIRMATION,
    )
  }

  public isLowerCase(regex = /^[a-z]+$/): Validator {
    return this.validate(value =>
      regex.test(value) ? null : ERROR_MESSAGES.ONLY_LOWER_CASE_ALLOWED,
    )
  }

  public isUrl(regex = /^(https?:\/\/)?[\w.-]+(\.[\w.-]+).*$/): Validator {
    return this.validate(value => (regex.test(value) ? null : ERROR_MESSAGES.INVALID_URL))
  }

  public hasNoForbiddenChar(forbiddenChars: RegExp, errorMessage: string): Validator {
    return this.validate(value => (forbiddenChars.test(value) ? errorMessage : null))
  }

  public isNotEmpty(): Validator {
    return this.validate(value => (value.trim() ? null : ERROR_MESSAGES.VALUE_CANNOT_BE_EMPTY))
  }
  /**
   * Validates a string using a custom validation function.
   * @param fn - The validation function.
   * @returns The Validator instance for chaining.
   */
  private validate(fn: (value: string) => string | null): Validator {
    const error = fn(this.value)
    if (error) {
      this.errors.add(error)
    }
    return this
  }
}
