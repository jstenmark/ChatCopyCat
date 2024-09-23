export interface IError extends Partial<Error> {
  stack?: string
  name?: string
  message?: string
}

function isIError(error: unknown): error is IError {
	return (
		typeof error === 'object' &&
		error !== null &&
		('message' in error || 'name' in error || 'stack' in error)
	);
}


export const parseError = (error: IError | unknown) : {
  message: string; stack?: string; name?: string, stackTrace: string
} => {
	let err: IError;

	if (isIError(error)) {
		err = error;
	} else {
		err = {};
	}

	let stack: string | undefined;
	if ('stack' in err) {
		stack = err.stack;
	}

	const message = err.message || 'Unknown error';
	const name = err.name || 'Error';
  const stackTrace = stack
    ? '\n'+stack.split("\n").slice(1, 4).join("\n")
    : ''

	return { stack, stackTrace, name, message }
};

