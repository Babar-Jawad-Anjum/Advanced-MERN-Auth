import bcrypt from "bcryptjs";

import { User } from "../models/user.model.js";
import { generateVerificationToken } from "../utils/generateVerificationToken.js";
import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js";
import { sendVerificationEmail } from "../mailtrap/emails.js";

export const signup = async (req, res) => {
  console.log(req.body);
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
export const login = async (req, res) => {};
export const logout = async (req, res) => {};
