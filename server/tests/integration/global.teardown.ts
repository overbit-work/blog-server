import { type FullConfig } from "@playwright/test";
import { v2 as compose } from "docker-compose";
import path from "path";
import { TEST_ENVIRONMENT_NAME } from "./constant";

async function globalTeardown(config: FullConfig) {
  console.info("Tearing down test environment...");
  const dockerComposeDir = path.resolve(__dirname, "../..");
  const dockerComposeOptions: compose.IDockerComposeOptions = {
    cwd: dockerComposeDir,
    composeOptions: [`--project-name=${TEST_ENVIRONMENT_NAME}`],
    commandOptions: ["-v"],
  };

  await compose.downAll(dockerComposeOptions);
}
export default globalTeardown;
