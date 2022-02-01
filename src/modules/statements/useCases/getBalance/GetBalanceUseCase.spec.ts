import { InMemoryStatementsRepository } from "@modules/statements/repositories/in-memory/InMemoryStatementsRepository";
import { InMemoryUsersRepository } from "@modules/users/repositories/in-memory/InMemoryUsersRepository";
import { hash } from "bcryptjs";
import { GetBalanceError } from "./GetBalanceError";
import { GetBalanceUseCase } from "./GetBalanceUseCase";

enum OperationType {
  DEPOSIT = "deposit",
  WITHDRAW = "withdraw",
}

let getBalanceUseCase: GetBalanceUseCase;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let inMemoryUsersRepository: InMemoryUsersRepository;
describe("Get Balance", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    getBalanceUseCase = new GetBalanceUseCase(
      inMemoryStatementsRepository,
      inMemoryUsersRepository
    );
  });

  it("should be able to get balance and statement list", async () => {
    const passwordHash = await hash("12345", 8);
    const user = await inMemoryUsersRepository.create({
      name: "show_user_test",
      email: "show_user_test@email.com.br",
      password: passwordHash,
    });

    inMemoryStatementsRepository.create({
      amount: 100,
      description: "test1_description",
      type: OperationType.DEPOSIT,
      user_id: user.id as string,
    });

    inMemoryStatementsRepository.create({
      amount: 10,
      description: "test1_description",
      type: OperationType.WITHDRAW,
      user_id: user.id as string,
    });

    const balance = await getBalanceUseCase.execute({
      user_id: user.id as string,
    });

    expect(balance).toHaveProperty("balance");
    expect(balance.balance).toEqual(90);
    expect(balance).toHaveProperty("statement");
    expect(balance.statement).toHaveLength(2);
  });

  it("should not be able to get balance from unexistent user", () => {
    expect(async () => {
      await getBalanceUseCase.execute({ user_id: "invalid_user" });
    }).rejects.toBeInstanceOf(GetBalanceError);
  });
});
