import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";
import { verifySessionToken } from "@/lib/auth-session";

const SESSION_COOKIE = "jose_admin_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

function getSessionSecret() {
  return process.env.SESSION_SECRET ?? "dev-session-secret";
}

function signToken(payload: string) {
  return createHmac("sha256", getSessionSecret()).update(payload).digest("hex");
}

function createSessionToken() {
  const expiresAt = Date.now() + SESSION_MAX_AGE * 1000;
  const payload = `admin:${expiresAt}`;
  return `${payload}.${signToken(payload)}`;
}

export function verifyAdminPassword(password: string) {
  const adminPassword = process.env.ADMIN_PASSWORD ?? "changeme";
  const input = Buffer.from(password);
  const expected = Buffer.from(adminPassword);
  if (input.length !== expected.length) return false;
  return timingSafeEqual(input, expected);
}

export async function setAdminSession() {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, createSessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function isAdminAuthenticated() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return false;
  return verifySessionToken(token);
}
