describe("env config", () => {
  const originalEnv = process.env;

  afterEach(() => {
    process.env = originalEnv;
    jest.resetModules();
  });

  it("loads in test mode without requiring DATABASE_URL or JWT_SECRET", async () => {
    process.env = {
      ...originalEnv,
      NODE_ENV: "test",
      ENABLE_AUTH: "true",
    };

    const mod = await import("../env");

    expect(mod.env.NODE_ENV).toBe("test");
    expect(mod.env.enableAuth).toBe(true);
  });

  it("throws when DATABASE_URL is missing outside test", async () => {
    process.env = {
      ...originalEnv,
      NODE_ENV: "development",
      ENABLE_AUTH: "false",
      DATABASE_URL: "",
    };

    await expect(import("../env")).rejects.toThrow("DATABASE_URL");
  });

  it("throws when auth is enabled but JWT_SECRET is missing outside test", async () => {
    process.env = {
      ...originalEnv,
      NODE_ENV: "production",
      ENABLE_AUTH: "true",
      DATABASE_URL: "postgresql://prod:prod@localhost:5432/prod",
      JWT_SECRET: "",
    };

    await expect(import("../env")).rejects.toThrow("JWT_SECRET");
  });
});
