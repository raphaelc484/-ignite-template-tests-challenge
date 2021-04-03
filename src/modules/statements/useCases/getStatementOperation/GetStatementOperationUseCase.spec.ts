import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { OperationType } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { GetStatementOperationError } from "./GetStatementOperationError";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";

let statementsRepository: InMemoryStatementsRepository;
let usersRepository: InMemoryUsersRepository;
let getStatementOperationUseCase: GetStatementOperationUseCase;

describe("Get Statement Operation", () => {
  beforeEach(() => {
    statementsRepository = new InMemoryStatementsRepository();
    usersRepository = new InMemoryUsersRepository();
    getStatementOperationUseCase = new GetStatementOperationUseCase(
      usersRepository,
      statementsRepository
    );
  });

  it("Should be able to get a statement operation", async () => {
    const user = await usersRepository.create({
      email: "teste@email.com",
      name: "teste",
      password: "1234",
    });

    if (!user.id) {
      throw new GetStatementOperationError.UserNotFound();
    }

    const statement = await statementsRepository.create({
      user_id: user.id,
      description: "Casa",
      amount: 110,
      type: "deposit" as OperationType,
    });

    if (!statement.id) {
      throw new GetStatementOperationError.StatementNotFound();
    }

    const statementOperation = await getStatementOperationUseCase.execute({
      user_id: user.id,
      statement_id: statement.id,
    });

    expect(statementOperation).toHaveProperty("id");
  });

  it("Should not be able to get a statement operation with wrong user", () => {
    expect(async () => {
      const user = await usersRepository.create({
        email: "teste@email.com",
        name: "teste",
        password: "1234",
      });

      if (!user.id) {
        throw new GetStatementOperationError.UserNotFound();
      }

      const statement = await statementsRepository.create({
        user_id: user.id,
        description: "Casa",
        amount: 110,
        type: "deposit" as OperationType,
      });

      if (!statement.id) {
        throw new GetStatementOperationError.StatementNotFound();
      }

      await getStatementOperationUseCase.execute({
        user_id: "teste",
        statement_id: statement.id,
      });
    }).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound);
  });

  it("Should not be able to get a statement operation with wrong statement", () => {
    expect(async () => {
      const user = await usersRepository.create({
        email: "teste@email.com",
        name: "teste",
        password: "1234",
      });

      if (!user.id) {
        throw new GetStatementOperationError.UserNotFound();
      }

      const statement = await statementsRepository.create({
        user_id: user.id,
        description: "Casa",
        amount: 110,
        type: "deposit" as OperationType,
      });

      if (!statement.id) {
        throw new GetStatementOperationError.StatementNotFound();
      }

      await getStatementOperationUseCase.execute({
        user_id: user.id,
        statement_id: "teste",
      });
    }).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound);
  });
});
