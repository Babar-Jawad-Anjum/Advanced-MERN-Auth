import bcrypt from "bcryptjs";
import crypto from "crypto";

import { User } from "../models/user.model.js";
import { generateVerificationToken } from "../utils/generateVerificationToken.js";
import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js";
import {
  sendVerificationEmail,
  sendWelcomeEmail,
  sendResetPasswordEmail,
  sendResetPasswordSuccessEmail,
} from "../mailtrap/emails.js";

export const signup = async (req, res) => {
  const { email, password, name } = req.body;

  try {
    if (!email || !password || !name) {
      throw new Error("All fields are required");
    }

    const userAlreadyExists = await User.findOne({ email });

    if (userAlreadyExists) {
      throw new Error(`User with this email ${email} already exists!`);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = generateVerificationToken();

    const user = new User({
      email,
      password: hashedPassword,
      name,
      verificationToken,
      verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24hrs
    });

    await user.save();

    //GENERATE_JWT_TOKEN_AND_SET_COOKIE
    generateTokenAndSetCookie(res, user._id);

    //SEND_VERIFICATION_EMAIL_TO_SIGNED_UP_USER
    await sendVerificationEmail(user.email, verificationToken);

    res.status(201).json({
      success: true,
      message: "User created successfully!",
      user: {
        ...user._doc, //spread user document
        password: undefined, //don't include password in response
      },
    });
  } catch (error) {
    return res.status(400).json({ status: false, message: error.message });
  }
};

export const verifyEmail = async (req, res) => {
  const { code } = req.body;

  try {
    const user = await User.findOne({
      verificationToken: code,
      verificationTokenExpiresAt: { $gt: Date.now() },
    });
    if (!user) {
      throw new Error("Invalid or expired verification code!");
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiresAt = undefined;

    await user.save();

    //USER_VERIFIED, SEND_WELCOME_EMAIL
    await sendWelcomeEmail(user.email, user.name);

    res.status(200).json({
      success: true,
      message: "User verified successfully!",
      user: {
        ...user._doc, //spread user document
        password: undefined, //don't include password in response
      },
    });
  } catch (err) {
    return res.status(400).json({ status: false, message: err.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      throw new Error("Invalid credentials!");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new Error("Invalid credentials!");
    }

    generateTokenAndSetCookie(res, user._id);

    user.lastLogin = new Date();
    await user.save();

    res.status(200).json({
      success: true,
      message: "Logged in successfully!",
      user: {
        ...user._doc,
        password: undefined,
      },
    });
  } catch (err) {
    return res.status(400).json({ status: false, message: err.message });
  }
};

export const logout = async (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ success: true, message: "Logged out successfully" });
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      throw new Error(`User with this email ${email} not found`);
    }

    //GENERATE_RESET_TOKEN
    const resetPasswordToken = crypto.randomBytes(20).toString("hex");
    const resetTokenExpireAt = Date.now() + 1 * 60 * 60 * 1000; // 1 hour

    user.resetPasswordToken = resetPasswordToken;
    user.resetPasswordExpiresAt = resetTokenExpireAt;

    await user.save();

    //SEND_EMAIL
    await sendResetPasswordEmail(
      user.email,
      `${process.env.CLIENT_URL}/reset-password/${resetPasswordToken}` //reset password client page url
    );

    res.status(200).json({
      success: true,
      message: "Password reset link has been sent to your email successfully!",
    });
  } catch (err) {
    return res.status(400).json({ status: false, message: err.message });
  }
};

export const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpiresAt: { $gt: Date.now() },
    });

    if (!user) {
      throw new Error("Invalid or expired reset token");
    }

    //UPDATE_USER_PASSWORD
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiresAt = undefined;

    await user.save();

    //SEND_RESET_SUCCESS_EMAIL_BACK_TO_USER
    await sendResetPasswordSuccessEmail(user.email);

    res.status(200).json({
      success: true,
      message: "Password has been reset successfully!",
    });
  } catch (err) {
    return res.status(400).json({ status: false, message: err.message });
  }
};

export const checkAuth = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password"); // "-password" means don't include password in user object

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found!" });
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong on server!" });
  }
};
