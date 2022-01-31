import { InMemoryUsersRepository } from "@modules/users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";
import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError";

let createUserUseCase: CreateUserUseCase;
let authenticateUserUseCase: AuthenticateUserUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;
describe("Authenticate User", () => {
  beforeEach(async () => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    authenticateUserUseCase = new AuthenticateUserUseCase(
      inMemoryUsersRepository
    );
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);

    await createUserUseCase.execute({
      name: "authenticate_user_test1",
      email: "authenticate_user_test1@email.com.br",
      password: "12345",
    });
  });

  it("should be able to authenticate valid user", async () => {
    const response = await authenticateUserUseCase.execute({
      email: "authenticate_user_test1@email.com.br",
      password: "12345",
    });

    expect(response).toHaveProperty("token");
  });

  it("should not be able to authenticate invalid password user", () => {
    expect(async () => {
      await authenticateUserUseCase.execute({
        email: "incorrect_user@email.com.br",
        password: "12345",
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });

  it("should not be able to authenticate invalid email user", () => {
    expect(async () => {
      await authenticateUserUseCase.execute({
        email: "authenticate_user_test1@email.com.br",
        password: "123456",
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });
});
