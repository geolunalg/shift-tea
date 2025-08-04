import { app } from "@/app";
import { config } from "@/config";
import { cronJobsSetup, generateDaysOfFullYear } from "@/cron";

app.listen(config.api.port, () => {
  console.log(`Server listening at http://localhost:${config.api.port}`);

  (async () => {
    await generateDaysOfFullYear();
    cronJobsSetup();
  })().catch(console.error);
});
