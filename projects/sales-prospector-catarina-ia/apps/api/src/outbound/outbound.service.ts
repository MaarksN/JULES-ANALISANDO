import twilio from "twilio";

const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);

export async function call(phone: string, url: string) {
  return client.calls.create({
    to: phone,
    from: process.env.TWILIO_NUMBER!,
    url,
  });
}
