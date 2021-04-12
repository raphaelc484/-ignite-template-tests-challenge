import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { OperationType } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateTransferStatementsError } from "./CreateTransferStatementsError";
import { CreateTransferStatementUseCase } from "./CreateTransferStatementUseCase";

describe("CreateTransferStatementUseCase Tests", () => {
  let createTransferStatementUseCase: CreateTransferStatementUseCase;
  let usersRepository: InMemoryUsersRepository;
  let statementsRepository: InMemoryStatementsRepository;

  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    statementsRepository = new InMemoryStatementsRepository();
    createTransferStatementUseCase = new CreateTransferStatementUseCase(
      usersRepository,
      statementsRepository
    );
  });

  it("should be able to create transfer statements", async () => {
    const sender = await usersRepository.create({
      name: "anysender",
      email: "anysender@mail.com",
      password: "123456",
    });

    const receiver = await usersRepository.create({
      name: "anyreceiver",
      email: "anyreceiver@mail.com",
      password: "123456",
    });

    await statementsRepository.create({
      amount: 150,
      description: "anydesc",
      user_id: sender.id as string,
      type: OperationType.DEPOSIT,
    });

    const amount = 100;
    const description = "anydesc";

    const response = await createTransferStatementUseCase.execute({
      sender_id: sender.id as string,
      receiver_id: receiver.id as string,
      amount,
      description,
    });

    expect(response).toBeDefined();
    expect(response.senderStatement.receiver_id).toBe(receiver.id);
    expect(response.receiverStatement.sender_id).toBe(sender.id);
    expect(response.senderStatement.amount).toBe(-Math.abs(amount));
    expect(response.receiverStatement.amount).toBe(amount);
  });

  it("Should not be able to create transfer statements when amount is invalid", async () => {
    await expect(
      createTransferStatementUseCase.execute({
        sender_id: "senderid",
        receiver_id: "receiverid",
        amount: -10,
        description: "description",
      })
    ).rejects.toBeInstanceOf(CreateTransferStatementsError.InvalidAmount);
  });

  it("should not be able to create transfer statements when sender does not exists", async () => {
    await expect(
      createTransferStatementUseCase.execute({
        sender_id: "invalidsenderid",
        receiver_id: "anyreceiverid",
        amount: 100,
        description: "anydesc",
      })
    ).rejects.toBeInstanceOf(CreateTransferStatementsError.SenderNotFound);
  });

  it("should not be able to create transfer statements when sender has insufficient funds", async () => {
    const sender = await usersRepository.create({
      name: "anysender",
      email: "anysender@mail.com",
      password: "123456",
    });

    const receiver = await usersRepository.create({
      name: "anyreceiver",
      email: "anyreceiver@mail.com",
      password: "123456",
    });

    await expect(
      createTransferStatementUseCase.execute({
        sender_id: sender.id as string,
        receiver_id: receiver.id as string,
        amount: 100,
        description: "anydesc",
      })
    ).rejects.toBeInstanceOf(CreateTransferStatementsError.InsufficientFunds);
  });

  it("should not be able to create transfer statements when receiver does not exists", async () => {
    const sender = await usersRepository.create({
      name: "anysender",
      email: "anysender@mail.com",
      password: "123456",
    });

    await expect(
      createTransferStatementUseCase.execute({
        sender_id: sender.id as string,
        receiver_id: "anyreceiverid",
        amount: 100,
        description: "anydesc",
      })
    ).rejects.toBeInstanceOf(CreateTransferStatementsError.ReceiverNotFound);
  });
});
