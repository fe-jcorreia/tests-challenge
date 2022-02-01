import { InMemoryStatementsRepository } from "@modules/statements/repositories/in-memory/InMemoryStatementsRepository";
import { InMemoryUsersRepository } from "@modules/users/repositories/in-memory/InMemoryUsersRepository";
import { hash } from "bcryptjs";
import { GetStatementOperationError } from "./GetStatementOperationError";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";

enum OperationType {
  DEPOSIT = "deposit",
  WITHDRAW = "withdraw",
}

let getStatementOperationUseCase: GetStatementOperationUseCase;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let inMemoryUsersRepository: InMemoryUsersRepository;
describe("Get Statement Operation", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    getStatementOperationUseCase = new GetStatementOperationUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
  });

  it("should be able to get statement", async () => {
    const passwordHash = await hash("12345", 8);
    const user = await inMemoryUsersRepository.create({
      name: "create_statement_test2",
      email: "create_statement_test2@email.com.br",
      password: passwordHash,
    });

    const statement = await inMemoryStatementsRepository.create({
      amount: 100,
      description: "test2_description",
      type: OperationType.DEPOSIT,
      user_id: user.id as string,
    });

    const response = await getStatementOperationUseCase.execute({
      user_id: user.id as string,
      statement_id: statement.id as string,
    });

    expect(response).toHaveProperty("id");
    expect(response.user_id).toEqual(user.id);
    expect(response).toMatchObject({
      amount: 100,
      description: "test2_description",
      type: OperationType.DEPOSIT,
    });
  });

  it("should not be able to get statement from unexistent user", () => {
    expect(async () => {
      const passwordHash = await hash("12345", 8);
      const user = await inMemoryUsersRepository.create({
        name: "create_statement_test2",
        email: "create_statement_test2@email.com.br",
        password: passwordHash,
      });

      const statement = await inMemoryStatementsRepository.create({
        amount: 100,
        description: "test2_description",
        type: OperationType.DEPOSIT,
        user_id: user.id as string,
      });

      await getStatementOperationUseCase.execute({
        user_id: "invalid_id",
        statement_id: statement.id as string,
      });
    }).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound);
  });

  it("should not be able to get unexistent statement", () => {
    expect(async () => {
      const passwordHash = await hash("12345", 8);
      const user = await inMemoryUsersRepository.create({
        name: "create_statement_test2",
        email: "create_statement_test2@email.com.br",
        password: passwordHash,
      });

      await getStatementOperationUseCase.execute({
        user_id: user.id as string,
        statement_id: "invalid_statement",
      });
    }).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound);
  });
});
