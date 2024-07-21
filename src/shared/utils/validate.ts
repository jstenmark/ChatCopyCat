 
import * as vscode from 'vscode'

const ERROR_MESSAGES = {
  INVALID_CONFIRMATION: 'Invalid confirmation value. Please enter "yes" or "no".',
  ONLY_LOWER_CASE_ALLOWED: 'Only lowercase letters are allowed.',
  INVALID_URL: 'Invalid URL format.',
  VALUE_CANNOT_BE_EMPTY: 'Value cannot be empty.',
  INVALID_ARRAY_ITEM: 'The item youre trying to add does not meet the required type criteria for this array.',
  INVALID_ARRAY: 'The provided value is not a valid array. Please ensure its an array type.',
  INVALID_NUMBER: 'The entered value must be a number. Please check and enter a valid numeric value.',
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
export function arraysAreEqual<T>(arr1: T[], arr2: T[] | undefined): boolean {
  if(!arr2) {
    return false
  }
  if (arr1.length !== arr2.length) return false
  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) return false
  }
  return true
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
 * Validates a string against specified criteria.
 */
export class Validator<T = unknown> {
  private errors = new Set<string>()
  private warnings = new Set<string>()

  constructor(private readonly value: T) {}

  public getErrorsString(): string | null {
    return this.getErrors().join('\r\n') || null
  }

  public getWarningsString(): string | null {
    return this.getWarnings().join('\r\n') || null
  }

  public getErrors(): string[] {
    return Array.from(this.errors)
  }

  public getWarnings(): string[] {
    return Array.from(this.warnings)
  }

  public getProblems(): {errors: string[], warnings: string[]} {
    return {
      errors: this.getErrors(),
      warnings: this.getWarnings(),
    }
  }

  public getInputBoxValidationMessage(): vscode.InputBoxValidationMessage | null {
    const problems = this.getProblems()
    let message = ''
    let severity = vscode.InputBoxValidationSeverity.Info

    if (problems.errors.length > 0) {
      message = problems.errors.join('\r\n')
      severity = vscode.InputBoxValidationSeverity.Error
    } else if (problems.warnings.length > 0) {
      message = problems.warnings.join('\r\n')
      severity = vscode.InputBoxValidationSeverity.Warning
    }

    if (message) {
      return {message, severity}
    }

    return null
  }

  public isConfirmationValue(validOptions: string[] = ['yes', 'no']): Validator<T> {
    if (typeof this.value === 'string') {
      return this.validate(value =>
        validOptions.includes((value as unknown as string).toLowerCase()) ? null : ERROR_MESSAGES.INVALID_CONFIRMATION,
      )
    }
    return this
  }

  public isLowerCase(regex = /^[a-z]+$/): Validator<T> {
    if (typeof this.value === 'string') {
      return this.validate(value =>
        regex.test(value as unknown as string) ? null : ERROR_MESSAGES.ONLY_LOWER_CASE_ALLOWED,
      )
    }
    return this
  }

  public isUrl(regex = /^(https?:\/\/)?[\w.-]+(\.[\w.-]+).*$/): Validator<T> {
    if (typeof this.value === 'string') {
      return this.validate(value => (regex.test(value as unknown as string) ? null : ERROR_MESSAGES.INVALID_URL))
    }
    return this
  }

  public hasNoForbiddenChar(forbiddenChars: RegExp, errorMessage: string): Validator<T> {
    if (typeof this.value === 'string') {
      return this.validate(value => (forbiddenChars.test(value as unknown as string) ? errorMessage : null))
    }
    return this
  }

  public isNotEmpty(): Validator<T> {
    return this.validate(value => {
      if (typeof value === 'string') {
        return value.trim().length > 0 ? null : ERROR_MESSAGES.VALUE_CANNOT_BE_EMPTY
      } else if (Array.isArray(value)) {
        return value.length > 0 ? null : ERROR_MESSAGES.VALUE_CANNOT_BE_EMPTY
      } else {
        return null
      }
    })
  }

  public warnIfEmpty(errorMessage: string): Validator<T> {
    if (typeof this.value === 'string' && !this.value.trim()) {
      this.warnings.add(errorMessage)
    }
    return this
  }

  public warnIfNotPatternMatch(regex: RegExp, warningMessage: string): Validator<T> {
    if (typeof this.value === 'string' && !regex.test(this.value as unknown as string)) {
      this.warnings.add(warningMessage)
    }
    return this
  }

  public isNumber(range?: {min?: number, max?: number}): Validator<T> {
    if (typeof this.value === 'number' || typeof this.value === 'string') {
      const numberValue = typeof this.value === 'number' ? this.value : parseFloat(this.value as unknown as string)
      if (isNaN(numberValue)) {
        this.errors.add(ERROR_MESSAGES.INVALID_NUMBER)
      } else if (range) {
        if (range.min !== undefined && numberValue < range.min) {
          this.errors.add(`Number must be greater than ${range.min}`)
        }
        if (range.max !== undefined && numberValue > range.max) {
          this.errors.add(`Number must be less than ${range.max}`)
        }
      }
      return this
    }
    return this
  }


  public isArrayOfType(typeCheck: (item: unknown) => boolean): Validator<T> {
    if (!Array.isArray(this.value)) {
      this.errors.add(ERROR_MESSAGES.INVALID_ARRAY)
    } else {
      this.value.forEach(item => {
        if (!typeCheck(item)) {
          this.errors.add(ERROR_MESSAGES.INVALID_ARRAY_ITEM)
        }
      })
    }
    return this
  }


  /**
   * Validates a string using a custom validation function.
   * @param fn - The validation function.
   * @returns The Validator instance for chaining.
   */
  private validate(fn: (value: T) => string | null): Validator<T> {
    const error = fn(this.value)
    if (error) {
      this.errors.add(error)
    }
    return this
  }

}
