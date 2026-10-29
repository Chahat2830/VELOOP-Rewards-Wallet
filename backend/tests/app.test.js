jest.mock("../src/models/User", () => ({
  findById: jest.fn(() => ({
    select: jest.fn().mockResolvedValue({
      role: "user",
      isActive: true,
    }),
  })),
}));

process.env.JWT_SECRET = "test-secret-for-jest-only";

const request = require("supertest");
const jwt = require("jsonwebtoken");
const app = require("../src/app");

describe("VELOOP Wallet API", () => {
  test("health endpoint returns 200", async () => {
    const response = await request(app).get("/api/health");

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
  });

  test("unknown routes return 404", async () => {
    const response = await request(app).get("/api/does-not-exist");

    expect(response.statusCode).toBe(404);
    expect(response.body.success).toBe(false);
  });

  test("malformed JSON returns 400", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .set("Content-Type", "application/json")
      .send("{ invalid json");

    expect(response.statusCode).toBe(400);
  });

  test.each([
    ["wallet", "/api/wallet"],
    ["transactions", "/api/transactions"],
    ["payouts", "/api/payouts"],
  ])("%s endpoint rejects requests without a token", async (_, path) => {
    const response = await request(app).get(path);

    expect(response.statusCode).toBe(401);
    expect(response.body.success).toBe(false);
  });

  test("payout endpoint rejects an invalid token", async () => {
    const response = await request(app)
      .get("/api/payouts")
      .set("Authorization", "Bearer invalid-token");

    expect(response.statusCode).toBe(401);
    expect(response.body.message).toBe("Invalid or expired token");
  });

  test("customer cannot approve a payout", async () => {
    const customerToken = jwt.sign(
      { userId: "507f1f77bcf86cd799439011" },
      process.env.JWT_SECRET,
      { expiresIn: "5m" }
    );

    const response = await request(app)
      .patch("/api/payouts/507f1f77bcf86cd799439012/approve")
      .set("Authorization", `Bearer ${customerToken}`);

    expect(response.statusCode).toBe(403);
    expect(response.body.message).toBe("Admin access required");
  });
});
