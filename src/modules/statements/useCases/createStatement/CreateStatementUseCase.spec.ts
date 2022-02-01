import { InMemoryStatementsRepository } from "@modules/statements/repositories/in-memory/InMemoryStatementsRepository";
import { InMemoryUsersRepository } from "@modules/users/repositories/in-memory/InMemoryUsersRepository";
import { hash } from "bcryptjs";
import { CreateStatementError } from "./CreateStatementError";
import { CreateStatementUseCase } from "./CreateStatementUseCase";

enum OperationType {
  DEPOSIT = "deposit",
  WITHDRAW = "withdraw",
}

let createStatementUseCase: CreateStatementUseCase;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let inMemoryUsersRepository: InMemoryUsersRepository;
describe("Get Balance", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    createStatementUseCase = new CreateStatementUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
  });

  it("should be able to create deposit statement", async () => {
    const passwordHash = await hash("12345", 8);
    const user = await inMemoryUsersRepository.create({
      name: "create_statement_test",
      email: "create_statement_test@email.com.br",
      password: passwordHash,
    });

    const response = await createStatementUseCase.execute({
      amount: 100,
      description: "test1_description",
      type: OperationType.DEPOSIT,
      user_id: user.id as string,
    });

    expect(response).toHaveProperty("id");
    expect(response.user_id).toEqual(user.id);
    expect(response).toMatchObject({
      amount: 100,
      description: "test1_description",
      type: OperationType.DEPOSIT,
    });
  });

  it("should be able to create withdraw statement", async () => {
    const passwordHash = await hash("12345", 8);
    const user = await inMemoryUsersRepository.create({
      name: "create_statement_test2",
      email: "create_statement_test2@email.com.br",
      password: passwordHash,
    });

    await createStatementUseCase.execute({
      amount: 100,
      description: "test2_description",
      type: OperationType.DEPOSIT,
      user_id: user.id as string,
    });

    const response = await createStatementUseCase.execute({
      amount: 100,
      description: "test2_description",
      type: OperationType.WITHDRAW,
      user_id: user.id as string,
    });

    expect(response).toHaveProperty("id");
    expect(response.user_id).toEqual(user.id);
    expect(response).toMatchObject({
      amount: 100,
      description: "test2_description",
      type: OperationType.WITHDRAW,
    });
  });

  it("should not be able to create statement for unexistent user", () => {
    expect(async () => {
      await createStatementUseCase.execute({
        amount: 100,
        description: "test2_description",
        type: OperationType.DEPOSIT,
        user_id: "invalid_user",
      });
    }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound);
  });

  it("should not be able to create withdraw statemente if balance negative", () => {
    expect(async () => {
      const passwordHash = await hash("12345", 8);
      const user = await inMemoryUsersRepository.create({
        name: "create_statement_test2",
        email: "create_statement_test2@email.com.br",
        password: passwordHash,
      });

      await createStatementUseCase.execute({
        amount: 100,
        description: "test2_description",
        type: OperationType.WITHDRAW,
        user_id: user.id as string,
      });
    }).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds);
  });
});
