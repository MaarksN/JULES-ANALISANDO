export const sendEmail = async (to, subject, body) => {
    // Mock Email Service (e.g., SendGrid/AWS SES)
    console.log(`[EMAIL] To: ${to}`);
    console.log(`[EMAIL] Subject: ${subject}`);
    console.log(`[EMAIL] Body: ${body}`);
    return true;
};
