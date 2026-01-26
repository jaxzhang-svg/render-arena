export class ForbiddenError extends Error {
  statusCode = 403
  digest = 'FORBIDDEN'
  constructor(message: string = 'Forbidden') {
    super(message)
    this.name = 'ForbiddenError'
  }
}
