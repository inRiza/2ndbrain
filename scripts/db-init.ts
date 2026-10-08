import { initAuthStore } from "../src/lib/auth-server";

async function main() {
  await initAuthStore();
  console.log("Neon schema ready. Default user: stacklist / stacklist");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
