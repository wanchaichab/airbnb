import { encode } from "jwt-simple";

/**
 * Create a JWT token for the DAML sandbox.
 * Uses the "user token" format with a `sub` claim matching the sandbox userId.
 */
export function makeToken(userId: string): string {
  const payload = {
    sub: userId,
    scope: "daml_ledger_api",
  };
  return encode(payload, "secret", "HS256");
}
