import axios from "axios";

export const sendEmail = async (to, subject, html) => {
  try {
    const res = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          name: "MediAI",
          email: "no-reply@mediai.indevs.in" // MUST match Brevo sender
        },
        to: [{ email: to }],
        subject,
        htmlContent: html
      },
      {
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "Content-Type": "application/json"
        }
      }
    );

    console.log("BREVO SUCCESS:", res.data);

  } catch (err) {
    console.error("BREVO ERROR:", err.response?.data || err.message);
    throw err;
  }
};