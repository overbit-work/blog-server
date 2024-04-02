import { v2 as compose } from "docker-compose";
import path from "path";
import { getRandomPort } from "get-port-please";
import { type FullConfig } from "@playwright/test";
import { randomUUID } from "crypto";
import { TEST_ENVIRONMENT_NAME } from "./constant";

const verbose = process.env.VERBOSE ? true : false;
const SERVER_START_TIMEOUT = 30000;

function sleep(time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

async function globalSetup(config: FullConfig) {
  console.info("Setting up test environment...");
  const dockerComposeDir = path.resolve(__dirname, "../..");
  const dotEnvPath = path.join(dockerComposeDir, ".env");
  const port = await getRandomPort();
  const dbPort = await getRandomPort();

  const dockerComposeOptions: compose.IDockerComposeOptions = {
    cwd: dockerComposeDir,
    log: verbose,
    composeOptions: [
      `--project-name=${TEST_ENVIRONMENT_NAME}`,
      `--env-file=${dotEnvPath}`,
    ],
    env: {
      ...process.env,
      PORT: String(port),
      DB_PORT: String(dbPort),
    },
  };

  console.info("Running docker-compose up");
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

  console.info("Waiting for db migration to be completed...");
  let migrationCompleted = false;
  let startTime = Date.now();

  do {
    console.info("...");
    const containers = await compose.ps({
      ...dockerComposeOptions,
      commandOptions: ["--all"],
    });
    const migrateContainer = containers.data.services.find((s) =>
      s.name.endsWith("migrate-1")
    );
    if (migrateContainer?.state.indexOf("Exited (0)") !== -1) {
      migrationCompleted = true;
      console.info("migration completed!");
      break;
    }
    await sleep(2000);
  } while (
    !migrationCompleted ||
    startTime + SERVER_START_TIMEOUT < Date.now()
  );

  process.env.TEST_SERVER_BASE_URL = `http://localhost:${port}`;
  process.env.TEST_DB_PORT = String(dbPort);
}

export default globalSetup;
