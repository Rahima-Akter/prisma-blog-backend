import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";

import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // Use true for port 465, false for port 587
  auth: {
    user: process.env.APP_USER,
    pass: process.env.APP_PASS,
  },
});

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "USER",
        required: false,
      },
      phoneNumber: {
        type: "string",
        required: false,
      },
      status: {
        type: "string",
        defaultValue: "ACTIVE",
        required: false,
      },
    },
  },

  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
    requireEmailVerification: true,
  },

  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url, token }, request) => {
      try {
        const verificationUrl = `${process.env.BETTER_AUTH_URL}/verify-email?token=${token}`;
        const info = await transporter.sendMail({
          from: '"Prisma-Blog <prisma-blog.email>"',
          to: user.email,
          subject: "Verify Your Email",
          text: `Hello ${user.name}`,
          html: `

        <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Verify Your Email</title>
</head>
<body style="margin:0; padding:0; background-color:#f4f6f8; font-family:Arial, Helvetica, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table width="100%" max-width="600px" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 10px 30px rgba(0,0,0,0.08);">
          
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg, #6366f1, #8b5cf6); padding:30px; text-align:center;">
              <h1 style="margin:0; color:#ffffff; font-size:26px;">Welcome to Prisma Blog ✨</h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 30px; color:#333333;">
              <h2 style="margin-top:0; font-size:22px;">Verify your email address</h2>
              <p style="font-size:16px; line-height:1.6; color:#555555;">
                Thanks for signing up! You're almost ready to get started.
                Please confirm your email address by clicking the button below.
              </p>

              <!-- Button -->
              <div style="text-align:center; margin:40px 0;">
                <button href="{${verificationUrl}}"
                   style="background:#6366f1; color:#ffffff; text-decoration:none; padding:15px 32px; border-radius:8px; font-size:16px; font-weight:bold; display:inline-block;">
                  Verify Email
                </button>
              </div>

              <p style="font-size:14px; color:#777777; line-height:1.6;">
                If the button doesn’t work, copy and paste this link into your browser:
              </p>
              <p style="word-break:break-all; font-size:14px; color:#6366f1;">
                {${verificationUrl}}
              </p>

              <p style="font-size:14px; color:#777777; margin-top:30px;">
                If you didn’t create an account, you can safely ignore this email.
              </p>

              <p style="font-size:14px; color:#777777;">
                — The Prisma Blog Team 💜
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f4f6f8; padding:20px; text-align:center; font-size:12px; color:#999999;">
              © ${new Date().getFullYear} Prisma Blog. All rights reserved.
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>

        
        `,
        });
      } catch (err) {
        console.error(err);
      }
    },
  },

  socialProviders: {
    google: {
      prompt: "select_account consent", 
      accessType: "offline", 
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
});
