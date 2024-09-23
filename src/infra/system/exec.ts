
import {type ChildProcess, fork, type ForkOptions, spawn, type SpawnOptions} from 'child_process'
import {tmpdir} from 'os'

import {log} from '../logging/log-base'


function handleChildProcessEvents(
  childProcess: ChildProcess,
  writeToOutputChannel: boolean,
  isFork = false
): Promise<ICommandResult> {
  let cmdOutput = ''
  let cmdOutputIncludingStderr = ''
  const messages: Record<string, any>[] = []

  return new Promise((resolve, reject) => {
    childProcess.stdout!.on('data', (data: string | Buffer) => {
      processOutput(data)
    })

    childProcess.stderr!.on('data', (data: string | Buffer) => {
      processOutput(data, true)
    })

    if (isFork) {
      childProcess.on('message', (message: Record<string, any>) => {
        messages.push(message)

        const data = JSON.stringify(message)
        cmdOutput += data
        cmdOutputIncludingStderr += data

        if (writeToOutputChannel) {
          log.debug('exec', data, {truncate: 0})
        }
      })
    }

    childProcess.on('error', reject)
    childProcess.on('close', (code: number) => {
      resolve({cmdOutput, cmdOutputIncludingStderr, code, messages})
    })

    function processOutput(data: string | Buffer, isStderr = false) {
      data = data.toString()
      cmdOutput += data
      if (isStderr) {
        cmdOutputIncludingStderr += data
      }

      if (writeToOutputChannel) {
        log.debug('exec', data, {truncate: 0})
      }
    }
  })
}

const executeCommandMessage = {
  failedToRunCommand: (command: string) =>
    `Failed to run command - ${command}. More details in output`,
  failedToRunScript: (scriptPath: string) =>
    `Failed to run script - ${scriptPath}. More details in output`,
  finishRunningCommand: 'Finished running command',
  forkingModule: 'Forking script',
  runningCommand: 'Running command',
}


export interface ICommandResult {
  code: number
  cmdOutput: string
  cmdOutputIncludingStderr: string
  messages?: Record<string, any>[]
}

export interface ICommandExecute {
  childProcess: ChildProcess
  result: Promise<ICommandResult>
}


/**
 * Executes a command asynchronously and returns a promise with the result.
 * @param workingDirectory - The working directory for the command execution.
 * @param writeToOutputChannel - Boolean to indicate if output should be written to a channel.
 * @param commands - The command to execute.
 * @param args - Arguments for the command.
 * @returns An object containing the child process and a promise with the execution result.
 */

export async function tryExecuteCommandAsync(
  workingDirectory: string | undefined,
  writeToOutputChannel: boolean,
  commands: string,
  ...args: string[]
): Promise<ICommandExecute> {
  const childProcess = spawnProcess(workingDirectory, commands, args)
  const result = handleChildProcessEvents(childProcess, writeToOutputChannel)
  return await new Promise(() => ({childProcess, result}))
}

/**
 * Executes a command in a forked process asynchronously and returns a promise with the result.
 * @param workingDirectory - The working directory for the command execution.
 * @param writeToOutputChannel - Boolean to indicate if output should be written to a channel.
 * @param modulePath - The path to the module to be executed.
 * @param args - Arguments for the module.
 * @returns An object containing the child process and a promise with the execution result.
 */
export function tryExecuteCommandInForkAsync(
  workingDirectory: string | undefined,
  writeToOutputChannel: boolean,
  modulePath: string,
  ...args: string[]
): ICommandExecute {
  const childProcess = forkProcess(workingDirectory, modulePath, args)
  const result = handleChildProcessEvents(childProcess, writeToOutputChannel, true)
  return {childProcess, result}
}


/**
 * Executes a command and returns the output as a string.
 * @param workingDirectory - The working directory for the command execution.
 * @param commands - The command to execute.
 * @param args - Arguments for the command.
 * @returns A promise that resolves to the command output.
 */
export async function executeCommand(
  workingDirectory: string | undefined,
  commands: string,
  ...args: string[]
): Promise<string> {
  log.debug(
    'exec',
    {
      workingDirectory,
      cmd: [commands, ...args].join(' '),
    },
    {truncate: 0},
  )

  const result: ICommandResult = await tryExecuteCommand(workingDirectory, commands, ...args)

  log.debug('finished')

  if (result.code !== 0) {
    throw new Error(
      executeCommandMessage.failedToRunCommand(commands.concat(' ', ...args.join(' '))),
    )
  }

  return result.cmdOutput
}

/**
 * Spawns a child process to execute a command.
 * @param workingDirectory - The working directory for the command execution.
 * @param commands - The command to spawn.
 * @param args - Arguments for the command.
 * @returns The spawned child process.
 */
export function spawnProcess(
  workingDirectory: string | undefined,
  commands: string,
  args: string[],
): ChildProcess {
  const options: SpawnOptions = {cwd: workingDirectory ?? tmpdir(), shell: true}
  return spawn(commands, args, options)
}

/**
 * Tries to execute a command and captures its output.
 * @param workingDirectory - The working directory for the command execution.
 * @param commands - The command to execute.
 * @param args - Arguments for the command.
 * @returns A promise that resolves to the command result.
 */
export async function tryExecuteCommand(
  workingDirectory: string | undefined,
  commands: string,
  ...args: string[]
): Promise<ICommandResult> {
  const {result} = await tryExecuteCommandAsync(workingDirectory, true, commands, ...args)

  return result
}

/**
 * Executes a JavaScript module in a separate process (fork).
 * @param workingDirectory - The working directory for the command execution.
 * @param modulePath - The path to the module to be executed.
 * @param args - Arguments for the module.
 * @returns A promise that resolves to the command output.
 */
export async function executeCommandInFork(
  workingDirectory: string | undefined,
  modulePath: string,
  ...args: string[]
): Promise<string> {
  log.debug(
    executeCommandMessage.forkingModule,
    {
      workingDirectory,
      cmd: [modulePath, ...args].join(' '),
    },
    {truncate: 0},
  )

  const result: ICommandResult = await tryExecuteCommandInFork(
    workingDirectory,
    modulePath,
    ...args,
  )

  if (result.code !== 0) {
    throw new Error(executeCommandMessage.failedToRunScript(modulePath))
  }

  return result.cmdOutput
}

/**
 * Forks a process to execute a module.
 * @param workingDirectory - The working directory for the command execution.
 * @param modulePath - The path to the module to be executed.
 * @param args - Arguments for the module.
 * @returns The forked child process.
 */
export function forkProcess(
  workingDirectory: string | undefined,
  modulePath: string,
  args: string[],
): ChildProcess {
  const options: ForkOptions = {
    cwd: workingDirectory ?? tmpdir(),
    silent: true,
    env: {},
    execArgv: [],
  }
  return fork(modulePath, args, options)
}

/**
 * Tries to execute a command in a forked process and captures its output.
 * @param workingDirectory - The working directory for the command execution.
 * @param modulePath - The path to the module to be executed.
 * @param args - Arguments for the module.
 * @returns A promise that resolves to the command result.
 */
export async function tryExecuteCommandInFork(
  workingDirectory: string | undefined,
  modulePath: string,
  ...args: string[]
): Promise<ICommandResult> {
  const {result} = tryExecuteCommandInForkAsync(workingDirectory, false, modulePath, ...args)

  return result
}

/**
 * Awaits the completion of an action and then performs a callback based on the state request.
 * @param action - The action to perform.
 * @param stateRequest - Function to request the current state.
 * @param isRequestProcessing - Function to check if the request is still processing.
 * @param callback - Callback to execute after the action is completed.
 * @param interval - Interval time for retrying the state request.
 * @returns A promise resolving once the callback has been executed.
 */
export async function awaiter<T>(
  action: () => Promise<any>,
  stateRequest: () => Promise<T>,
  isRequestProcessing: (entity: T) => boolean,
  callback: (entity: T) => Promise<any>,
  interval: number,
): Promise<any> {
  let entity: T | null = null
  await action()

  do {
    if (entity) {
      await new Promise(resolve => setTimeout(resolve, interval))
    }

    let retry = 3

    while (true) {
      try {
        entity = await stateRequest()
        break
      } catch (error) {
        if (retry < 0) {
          throw error
        }
        retry--
      }
    }
  } while (isRequestProcessing(entity))

  await callback(entity)
}
