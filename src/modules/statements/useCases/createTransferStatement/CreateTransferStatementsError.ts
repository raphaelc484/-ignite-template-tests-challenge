// eslint-disable-next-line max-classes-per-file
import { AppError } from "../../../../shared/errors/AppError";

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace CreateTransferStatementsError {
  export class SenderNotFound extends AppError {
    constructor() {
      super("Sender not found", 404);
    }
  }

  export class ReceiverNotFound extends AppError {
    constructor() {
      super("Receiver not found", 404);
    }
  }

  export class InvalidAmount extends AppError {
    constructor() {
      super("Invalid amount", 400);
    }
  }

  export class InsufficientFunds extends AppError {
    constructor() {
      super("Insufficient funds", 400);
    }
  }
}
