type ExecutionResultBase = {
  sbxId: string
}

export type ExecutionResultInterpreter = ExecutionResultBase & {
  template: string
  stdout: string[]
  stderr: string[]
  runtimeError?: {
    name: string
    value: string
    tracebackRaw: string[]
  }
  cellResults: unknown[]
}

export type ExecutionResultWeb = ExecutionResultBase & {
  template: string
  url: string
}

export type ExecutionResult = ExecutionResultInterpreter | ExecutionResultWeb
