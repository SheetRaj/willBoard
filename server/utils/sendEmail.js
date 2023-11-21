import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";

import { hashString } from "./index.js";
import Verification from "../models/emailVerification.js";
import PasswordReset from "../models/PasswordReset.js";


dotenv.config();

const { AUTH_EMAIL, AUTH_PASSWORD, APP_URL } = process.env;

let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",  //smtp.gmail.com //smtp-mail.outlook.com
    auth: {
        user: AUTH_EMAIL,
        pass: AUTH_PASSWORD,
    },
});

//Send the email part to verify account!

export const sendVerificationEmail = async (user, res) => {
    const { _id, email, firstName } = user;

    const token = _id + uuidv4();

    const link = APP_URL + "users/verify/" + _id + "/" + token;

    const mailOptions = {
        from: AUTH_EMAIL,
        to: email,
        subject: "WillBoard Account Verification",

        html: `<div style='font-family: Arial, sans-serif; font-size: 20px; color: #333; background-color: #f7f7f7; padding: 20px; border-radius: 5px;'>
        <h3 style="color: #000; font-size: 24px; font-weight: bold;">Email Verification</h3>
        <hr>
        <h4 style="color: #333; font-size: 22px;">Hi ${firstName},</h4>
        <p style="color: #444; font-size: 20px;">
            Please verify your email address so we can confirm it's really you.
        </p>
        <p style="color: #444; font-size: 20px;">This link <b>expires in 1 hour</b>.</p>
        <br>
        <a href=${link} style="color: #fff; padding: 14px; text-decoration: none; background-color: #000;  border-radius: 8px; font-size: 20px;">Verify Email Address</a>
        </p>
        <div style="margin-top: 20px;">
            <h5 style="color: #000; font-size: 18px;">Best Regards,</h5>
            <h5 style="color: #000; font-size: 18px;">WillBoard Team</h5>
        </div>
    </div> `,
    };

    try {
        const hashedToken = await hashString(token);

        const newVerifiedEmail = await Verification.create({
            userId: _id,
            token: hashedToken,
            createdAt: Date.now(),
            expiresAt: Date.now() + 3600000,
        });

        if (newVerifiedEmail) {
            transporter
                .sendMail(mailOptions)
                .then(() => {
                    res.status(201).send({
                        success: "PENDING",
                        message:
                            "Verification email has been sent to your account. Check your email for further instructions.",
                    });
                })
                .catch((err) => {
                    console.log(err);
                    res.status(404).json({ message: "Something went wrong" });
                });
        }

    } catch (error) {
        console.log(error);
        res.status(404).json({ message: "Something went wrong" });
    };



}


// Send the email to reset password
export const resetPasswordLink = async (user, res) => {
    const { _id, email } = user;

    const token = _id + uuidv4();
    const link = APP_URL + "users/reset-password/" + _id + "/" + token;

    // mail options
    const mailOptions = {
        from: AUTH_EMAIL,
        to: email,
        subject: "Password Reset",
        html: `
    <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #007bff; border-radius: 10px; text-align: center; color: #fff;">
    <h2>Password Reset</h2>
    <p style="font-size: 16px;">You have requested to reset your password. Click the link below to proceed:</p>

    <a href="${link}" style="display: inline-block; padding: 12px 24px; background-color: #fff; color: #007bff; text-decoration: none; border-radius: 5px; font-size: 18px; margin-top: 20px;">Reset Password</a>
    
    <p style="font-size: 14px; margin-top: 20px;">This link will expire in 10 minutes.</p>
</div>

    `,
    };

    try {
        const hashedToken = await hashString(token);

        const resetEmail = await PasswordReset.create({
            userId: _id,
            email: email,
            token: hashedToken,
            createdAt: Date.now(),
            expiresAt: Date.now() + 600000,
        });

        if (resetEmail) {
            transporter
                .sendMail(mailOptions)
                .then(() => {
                    res.status(201).send({
                        success: "PENDING",
                        message: "Reset Password Link has been sent to your account.",
                    });
                })
                .catch((err) => {
                    console.log(err);
                    res.status(404).json({ message: "Something went wrong" });
                });
        }
    } catch (error) {
        console.log(error);
        res.status(404).json({ message: "Something went wrong" });
    }
};
