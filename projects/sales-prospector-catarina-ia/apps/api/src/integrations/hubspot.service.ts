import axios from "axios";
// import axiosRetry from 'axios-retry'; // Mocking usage below since package not installed

const HUBSPOT_BASE = "https://api.hubapi.com";

import * as crypto from "crypto";

// Mock axios-retry behavior
const axiosInstance = axios.create();
// axiosRetry(axiosInstance, { retries: 3, retryCondition: ... });

export class HubspotService {
  private token = process.env.HUBSPOT_TOKEN!;
  private encryptionKey =
    process.env.ENCRYPTION_KEY ||
    (process.env.NODE_ENV === "production"
      ? ""
      : "default_secret_key_32_chars_long!!");

  private encrypt(text: string): string {
    if (!this.encryptionKey) throw new Error("Encryption Key missing");
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(
      "aes-256-cbc",
      Buffer.from(this.encryptionKey),
      iv,
    );
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString("hex") + ":" + encrypted.toString("hex");
  }

  async createOrUpdateContact(data: {
    email: string;
    firstname?: string;
    lastname?: string;
    notes?: string;
  }) {
    const safeNotes = data.notes ? this.encrypt(data.notes) : undefined;

    // Use retry-enabled instance
    return axiosInstance.post(
      `${HUBSPOT_BASE}/crm/v3/objects/contacts`,
      {
        properties: {
          email: data.email,
          firstname: data.firstname,
          lastname: data.lastname,
          notes: safeNotes,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${this.token}`,
          "Content-Type": "application/json",
        },
      },
    );
  }
}
