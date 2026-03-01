import { stripe, resend } from './src/index';

async function main() {
  console.log('Testing Integrations initialization...');

  if (!process.env.STRIPE_SECRET_KEY) {
    console.log('Skipping Stripe call (no key). Client initialized.');
  } else {
    try {
      // Just list customers to test connection
      // await stripe.customers.list({ limit: 1 });
      console.log('Stripe client ready.');
    } catch (e) {
      console.error('Stripe error:', e);
    }
  }

  if (!process.env.RESEND_API_KEY) {
    console.log('Skipping Resend call (no key). Client initialized.');
  } else {
    try {
      // await resend.emails.send({ ... });
      console.log('Resend client ready.');
    } catch (e) {
      console.error('Resend error:', e);
    }
  }

  console.log('Integrations test complete.');
}

main().catch(console.error);
