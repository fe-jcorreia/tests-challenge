import { InMemoryUsersRepository } from "@modules/users/repositories/in-memory/InMemoryUsersRepository";
import { compare, hash } from "bcryptjs";
import { ShowUserProfileError } from "./ShowUserProfileError";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";

let showUserProfileUseCase: ShowUserProfileUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;
describe("Show User Profile", () => {
  beforeEach(async () => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    showUserProfileUseCase = new ShowUserProfileUseCase(
      inMemoryUsersRepository
    );
  });

  it("should be able to show user profile", async () => {
    const passwordHash = await hash("12345", 8);
    const user = await inMemoryUsersRepository.create({
      name: "show_user_test",
      email: "show_user_test@email.com.br",
      password: passwordHash,
    });

    const response = await showUserProfileUseCase.execute(user.id as string);

    const passwordMatch = await compare("12345", response.password);
    expect(response).toHaveProperty("id");
    expect(response).toMatchObject({
      name: "show_user_test",
      email: "show_user_test@email.com.br",
    });
    expect(response.password).not.toBe("12345");
    expect(passwordMatch).toBe(true);
  });

  it("should not be able to show unexistent user", () => {
    expect(async () => {
      await showUserProfileUseCase.execute("invalid_id");
    }).rejects.toBeInstanceOf(ShowUserProfileError);
  });
});
