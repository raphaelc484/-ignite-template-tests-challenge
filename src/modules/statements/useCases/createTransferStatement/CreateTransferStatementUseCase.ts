import { inject, injectable } from "tsyringe";

import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { OperationType, Statement } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateTransferStatementsError } from "./CreateTransferStatementsError";
import { ICreateTransferStatementDTO } from "./ICreateTransferStatementDTO";

interface IRequest {
  senderStatement: Statement;
  receiverStatement: Statement;
}

@injectable()
class CreateTransferStatementUseCase {
  constructor(
    @inject("UsersRepository")
    private usersRepository: InMemoryUsersRepository,
    @inject("StatementsRepository")
    private statementsRepository: InMemoryStatementsRepository
  ) {}

  async execute({
    amount,
    description,
    receiver_id,
    sender_id,
  }: ICreateTransferStatementDTO): Promise<IRequest> {
    if (amount < 0) {
      throw new CreateTransferStatementsError.InvalidAmount();
    }

    const sender = await this.usersRepository.findById(sender_id);

    if (!sender) {
      throw new CreateTransferStatementsError.SenderNotFound();
    }

    const receiver = await this.usersRepository.findById(receiver_id);

    if (!receiver) {
      throw new CreateTransferStatementsError.ReceiverNotFound();
    }

    const { balance } = await this.statementsRepository.getUserBalance({
      user_id: sender_id,
      with_statement: false,
    });

    if (amount > balance) {
      throw new CreateTransferStatementsError.InsufficientFunds();
    }

    const senderStatement = await this.statementsRepository.create({
      amount: -Math.abs(amount),
      description,
      type: "transfer" as OperationType,
      user_id: sender_id,
      receiver_id,
    });

    const receiverStatement = await this.statementsRepository.create({
      amount,
      description,
      type: OperationType.TRANFER,
      user_id: receiver_id,
      sender_id,
    });

    return { senderStatement, receiverStatement };
  }
}

export { CreateTransferStatementUseCase };
