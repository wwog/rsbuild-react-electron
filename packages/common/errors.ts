export class UnhandledError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'UnhandledError'
  }
}

export class UnhandledRejection extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'UnhandledRejection'
  }
}
