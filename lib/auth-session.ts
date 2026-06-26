const SESSION_COOKIE = "jose_admin_session";

function getSessionSecret() {
  return process.env.SESSION_SECRET ?? "dev-session-secret";
}

async function signToken(payload: string) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(getSessionSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(payload),
  );
  return Array.from(new Uint8Array(signature))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function verifySessionToken(token: string) {
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;

  const expected = await signToken(payload);
  if (signature.length !== expected.length) return false;

  let mismatch = 0;
  for (let index = 0; index < signature.length; index += 1) {
    mismatch |= signature.charCodeAt(index) ^ expected.charCodeAt(index);
  }
  if (mismatch !== 0) return false;

  const [, expiresAtRaw] = payload.split(":");
  const expiresAt = Number(expiresAtRaw);
  if (!expiresAt || Date.now() > expiresAt) return false;

  return payload.startsWith("admin:");
}

export async function isAdminAuthenticatedFromRequest(request: Request) {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const match = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${SESSION_COOKIE}=`));
  if (!match) return false;
  const token = decodeURIComponent(match.slice(SESSION_COOKIE.length + 1));
  return verifySessionToken(token);
}
