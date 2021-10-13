import { createServer } from "./server.ts";

if (import.meta.main) {
  await createServer(8080);
}
