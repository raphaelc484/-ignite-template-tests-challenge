import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ShowUserProfileError } from "./ShowUserProfileError";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";

let usersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let showUserProfileUseCase: ShowUserProfileUseCase;

describe("Show User", () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(usersRepository);
    showUserProfileUseCase = new ShowUserProfileUseCase(usersRepository);
  });

  it("Should be able find a user by ID", async () => {
    const userCreate = await createUserUseCase.execute({
      email: "email@teste.com",
      name: "teste",
      password: "1234",
    });

    const { id } = userCreate;

    if (!id) {
      throw new ShowUserProfileError();
    }

    const result = await showUserProfileUseCase.execute(id);

    expect(result).toHaveProperty("name");
  });
});
