import {
  PASSWORD_RESET_REQUEST_TEMPLATE,
  PASSWORD_RESET_SUCCESS_TEMPLATE,
  VERIFICATION_EMAIL_TEMPLATE,
} from "./emailTemplates.js";
import { mailtrapClient, sender } from "./mailtrap.config.js";

export const sendVerificationEmail = async (email, verificationToken) => {
  const recipient = [{ email }];

  try {
    const response = await mailtrapClient.send({
      from: sender,
      to: recipient,
      subject: "Verify Your Email",
      html: VERIFICATION_EMAIL_TEMPLATE.replace(
        "{verificationCode}",
        verificationToken
      ),
      category: "Email Verification",
    });

    console.log("Email sent successfully", response);
  } catch (err) {
    console.log("Error sending verification email: ", err);
    throw new Error(`Error sending verification email: ${err}`);
  }
};

export const sendWelcomeEmail = async (email, userName) => {
  const recipient = [{ email }];

  try {
    const response = await mailtrapClient.send({
      from: sender,
      to: recipient,
      template_uuid: "879c98f8-568b-47be-b4f4-c21f48c1d722", //welcome template created on mailtrap
      template_variables: {
        company_info_name: "Advanced Auth",
        name: userName,
      },
    });

    console.log("Welcome email sent successfully", response);
  } catch (err) {
    console.log("Error sending welcome email: ", err);
    throw new Error(`Error sending welcome email: ${err}`);
  }
};

export const sendResetPasswordEmail = async (email, resetURL) => {
  const recipient = [{ email }];

  try {
    const response = await mailtrapClient.send({
      from: sender,
      to: recipient,
      subject: "Reset Your Password!",
      html: PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", resetURL),
      category: "Password Reset",
    });

    console.log("Password reset email sent successfully", response);
  } catch (err) {
    console.log("Error sending password reset email: ", err);
    throw new Error(`Error sending password reset email: ${err}`);
  }
};

export const sendResetPasswordSuccessEmail = async (email) => {
  const recipient = [{ email }];

  try {
    const response = await mailtrapClient.send({
      from: sender,
      to: recipient,
      subject: "Password Reset Successful!",
      html: PASSWORD_RESET_SUCCESS_TEMPLATE,
      category: "Password Reset",
    });

    console.log("Password reset success email sent successfully", response);
  } catch (err) {
    console.log("Error sending password reset success email: ", err);
    throw new Error(`Error sending password reset success email: ${err}`);
  }
};
