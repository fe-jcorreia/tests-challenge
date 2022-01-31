import { InMemoryUsersRepository } from "@modules/users/repositories/in-memory/InMemoryUsersRepository";
import { compare } from "bcryptjs";
import { CreateUserError } from "./CreateUserError";
import { CreateUserUseCase } from "./CreateUserUseCase";

let createUserUseCase: CreateUserUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;
describe("Create User", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
  });

  it("should be able to create an user", async () => {
    const user = await createUserUseCase.execute({
      name: "create_user_test1",
      email: "create_user_test@email.com.br",
      password: "12345",
    });

    const passwordMatch = await compare("12345", user.password);

    expect(user).toHaveProperty("id");
    expect(user).toMatchObject({
      name: "create_user_test1",
      email: "create_user_test@email.com.br",
    });
    expect(user.password).not.toBe("12345");
    expect(passwordMatch).toBe(true);
  });

  it("should not be able to create an user that already exists", () => {
    expect(async () => {
      await createUserUseCase.execute({
        name: "create_user_test2",
        email: "create_user_test2@email.com.br",
        password: "12345",
      });

      await createUserUseCase.execute({
        name: "create_user_test2",
        email: "create_user_test2@email.com.br",
        password: "12345",
      });
    }).rejects.toBeInstanceOf(CreateUserError);
  });
});
