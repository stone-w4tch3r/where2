export abstract class AppError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class NotFoundError extends AppError {
  constructor(message: string) {
    super(message);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message);
  }
}

export class InternalError extends AppError {
  constructor(message: string) {
    super(message);
  }
}
