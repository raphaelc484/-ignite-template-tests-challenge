import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { OperationType } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementError } from "./CreateStatementError";
import { CreateStatementUseCase } from "./CreateStatementUseCase";

let statementsRepository: InMemoryStatementsRepository;
let usersRepository: InMemoryUsersRepository;
let createStatementUseCase: CreateStatementUseCase;

describe("Create Statement", () => {
  beforeEach(() => {
    statementsRepository = new InMemoryStatementsRepository();
    usersRepository = new InMemoryUsersRepository();
    createStatementUseCase = new CreateStatementUseCase(
      usersRepository,
      statementsRepository
    );
  });

  it("Should be able to create a depostit", async () => {
    const user = await usersRepository.create({
      email: "teste@email.com",
      name: "teste",
      password: "1234",
    });

    const { id } = user;

    if (!id) {
      throw new CreateStatementError.UserNotFound();
    }

    const deposit = await createStatementUseCase.execute({
      user_id: id,
      description: "Casa",
      amount: 110,
      type: "deposit" as OperationType,
    });

    expect(deposit).toHaveProperty("id");
  });

  it("Should not be able to create a depostit with a non existing user", () => {
    expect(async () => {
      await createStatementUseCase.execute({
        user_id: "no exist",
        description: "Casa",
        amount: 110,
        type: "deposit" as OperationType,
      });
    }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound);
  });

  it("Should be able to create a withdraw", async () => {
    const user = await usersRepository.create({
      email: "teste@email.com",
      name: "teste",
      password: "1234",
    });

    const { id } = user;

    if (!id) {
      throw new CreateStatementError.UserNotFound();
    }

    await createStatementUseCase.execute({
      user_id: id,
      description: "Casa",
      amount: 110,
      type: "deposit" as OperationType,
    });

    const withdraw = await createStatementUseCase.execute({
      user_id: id,
      description: "Casa",
      amount: 100,
      type: "withdraw" as OperationType,
    });

    expect(withdraw).toHaveProperty("id");
  });

  it("Should not be able to create a withdraw with insufficient founds", () => {
    expect(async () => {
      const user = await usersRepository.create({
        email: "teste@email.com",
        name: "teste",
        password: "1234",
      });

      const { id } = user;

      if (!id) {
        throw new CreateStatementError.UserNotFound();
      }

      await createStatementUseCase.execute({
        user_id: id,
        description: "Casa",
        amount: 110,
        type: "deposit" as OperationType,
      });

      await createStatementUseCase.execute({
        user_id: id,
        description: "Casa",
        amount: 120,
        type: "withdraw" as OperationType,
      });
    }).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds);
  });
});
