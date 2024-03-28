import { test as setup } from "@playwright/test";
import { randomUUID } from "crypto";
import { v2 as compose } from "docker-compose";
import path from "path";
import { getRandomPort } from "get-port-please";

const verbose = process.env.VERBOSE ? true : false;

setup("start docker containers and configure testing data", async ({}) => {
  setup.setTimeout(120000);
  const dockerComposeDir = path.resolve(__dirname, "../..");
  const dotEnvPath = path.join(dockerComposeDir, ".env");
  const port = await getRandomPort();
  const dbPort = await getRandomPort();

  const dockerComposeOptions: compose.IDockerComposeOptions = {
    cwd: dockerComposeDir,
    log: verbose,
    composeOptions: [
      `--project-name=integration-test-${process.env.TEST_RUN_ID}`,
      `--env-file=${dotEnvPath}`,
    ],
    env: {
      ...process.env,
      PORT: String(port),
      DB_PORT: String(dbPort),
    },
  };
  await compose.downAll(dockerComposeOptions);

  await compose.upAll({
    ...dockerComposeOptions,
    commandOptions: ["--build", "--force-recreate"],
  });

  compose
    .logs([], {
      ...dockerComposeOptions,
      follow: true,
    })
    .catch(console.error);
});
