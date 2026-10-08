export {};

async function main() {
  const base = process.env.TEST_BASE_URL ?? "http://127.0.0.1:3000";
  const username = `test_${Date.now().toString(36)}`;
  const password = "test-pass-123";

  function cookieFrom(response: Response) {
    const raw = response.headers.get("set-cookie") ?? "";
    const match = raw.match(/stacklist_session=([^;]+)/);
    return match ? `stacklist_session=${match[1]}` : "";
  }

  async function json<T>(response: Response) {
    return (await response.json()) as T;
  }

  const register = await fetch(`${base}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (!register.ok) {
    throw new Error(`register failed: ${register.status} ${await register.text()}`);
  }
  const registerBody = await json<{ user: { username: string; avatarUrl: string } }>(register);
  const cookie = cookieFrom(register);
  if (!cookie) throw new Error("register did not set a session cookie");

  const me = await fetch(`${base}/api/auth/me`, { headers: { cookie } });
  if (!me.ok) throw new Error(`me failed: ${me.status}`);

  const avatar = await fetch(`${base}${registerBody.user.avatarUrl}`, { headers: { cookie } });
  if (!avatar.ok || !(avatar.headers.get("content-type") ?? "").includes("svg")) {
    throw new Error("avatar route failed");
  }

  const regen = await fetch(`${base}/api/auth/avatar/regenerate`, {
    method: "POST",
    headers: { cookie },
  });
  if (!regen.ok) throw new Error(`avatar regenerate failed: ${regen.status}`);

  const logout = await fetch(`${base}/api/auth/logout`, { method: "POST", headers: { cookie } });
  if (!logout.ok) throw new Error(`logout failed: ${logout.status}`);

  const login = await fetch(`${base}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (!login.ok) throw new Error(`login failed: ${login.status}`);

  console.log(`Auth API ok for ${username}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
