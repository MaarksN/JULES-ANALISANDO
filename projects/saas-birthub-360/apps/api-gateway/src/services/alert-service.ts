import { logger } from "@birthub/utils/src/logger";

// const logger = new Logger("alert-service"); // Logger class not exported, only instance 'logger'

export class AlertService {
  async sendAlert(subject: string, message: string, severity: "info" | "warning" | "critical" = "info") {
    // In a real implementation, this would send an email (Resend) or Slack webhook
    logger.warn(`[ALERT][${severity.toUpperCase()}] ${subject}: ${message}`);

    if (process.env.SLACK_WEBHOOK_URL) {
      // await fetch(process.env.SLACK_WEBHOOK_URL, { ... })
    }
  }
}
