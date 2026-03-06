import cron from "node-cron";
import { NotificationBatchingService } from "../services/notificationBatching.service";
import { createChildLogger } from "../utils/logger";

const log = createChildLogger("NotificationProcessorJob");

let notificationProcessorJob: cron.ScheduledTask | null = null;

/**
 * Start the notification processor cron job
 * Runs every 5 minutes by default
 */
export const startNotificationProcessor = (): void => {
  if (notificationProcessorJob) {
    log.warn("Notification processor already running");
    return;
  }

  const interval = process.env.NOTIFICATION_CRON_INTERVAL || "*/5 * * * *"; // Every 5 minutes

  log.info(`Starting notification processor cron job (${interval})`);

  notificationProcessorJob = cron.schedule(interval, async () => {
    try {
      log.debug("Processing notification queue...");
      const batchingService = new NotificationBatchingService();
      const result = await batchingService.processQueue();

      if (result.processed > 0) {
        log.info(
          `Notification queue processed: ${result.sent} sent, ${result.failed} failed`
        );
      }
    } catch (error) {
      log.error({ err: error }, "Error in notification processor cron job");
    }
  });

  log.info("Notification processor cron job started");
};

/**
 * Stop the notification processor cron job
 */
export const stopNotificationProcessor = (): void => {
  if (notificationProcessorJob) {
    notificationProcessorJob.stop();
    notificationProcessorJob = null;
    log.info("Notification processor cron job stopped");
  }
};

/**
 * Manually trigger notification processing (for testing)
 */
export const processNotificationsNow = async (): Promise<{
  processed: number;
  sent: number;
  failed: number;
}> => {
  const batchingService = new NotificationBatchingService();
  return await batchingService.processQueue();
};
