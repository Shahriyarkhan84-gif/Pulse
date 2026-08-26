import { endpoints } from "@/services/api/endpoints";
import { setSession, clearSession } from "@/services/storage/secureStorage";
import type { AuthSession } from "@/types/user";

export async function login(email: string, password: string): Promise<AuthSession> {
  const { data } = await endpoints.auth.login(email, password);
  await setSession(data.accessToken, data.refreshToken);
  return data;
}

export async function signup(
  email: string,
  password: string,
  username: string,
): Promise<AuthSession> {
  const { data } = await endpoints.auth.signup(email, password, username);
  await setSession(data.accessToken, data.refreshToken);
  return data;
}

export async function logout() {
  await clearSession();
}
