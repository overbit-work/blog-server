import { test as teardown } from "@playwright/test";
import { v2 as compose } from "docker-compose";
import path from "path";

teardown("teardown test environment", async ({}) => {
  teardown.slow();
  const dockerComposeDir = path.resolve(__dirname, "../..");
  const dockerComposeOptions: compose.IDockerComposeOptions = {
    cwd: dockerComposeDir,
    composeOptions: [
      `--project-name=integration-test-${process.env.TEST_RUN_ID}`,
    ],
    commandOptions: ["-v"],
  };

  await compose.downAll(dockerComposeOptions);
});
