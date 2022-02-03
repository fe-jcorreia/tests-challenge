import request from "supertest";
import { Connection } from "typeorm";
import createConnection from "../../../../database/index";
import { app } from "../../../../app";

let connection: Connection;

describe("Create User Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to create user", async () => {
    const response = await request(app).post("api/v1/users").send({
      name: "user_supertest",
      email: "user@email.com.br",
      password: "12345",
    });

    expect(response.body).toStrictEqual({});
  });

  it("should not be able to create existing user", async () => {
    const response = await request(app).post("api/v1/users").send({
      name: "user_supertest",
      email: "user@email.com.br",
      password: "12345",
    });

    console.log(response.body);
  });
});
