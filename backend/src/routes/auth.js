import { Router } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import { z } from "zod";
import twilio from "twilio";
import dotenv from "dotenv";

dotenv.config();

const router = Router();

const users = new Map();

const twilioClient = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
);

const twilioConfigured = Boolean(
    process.env.TWILIO_ACCOUNT_SID &&
    process.env.TWILIO_AUTH_TOKEN &&
    process.env.TWILIO_VERIFY_SERVICE_SID &&
    !process.env.TWILIO_ACCOUNT_SID.startsWith("YOUR_") &&
    !process.env.TWILIO_AUTH_TOKEN.startsWith("YOUR_") &&
    !process.env.TWILIO_VERIFY_SERVICE_SID.startsWith("YOUR_")
);

const demoOtps = new Map();

const registerSchema = z.object({
    name: z.string().trim().min(2).max(60),

    email: z.string()
        .trim()
        .email()
        .max(120),

    phone: z.string()
        .trim()
        .regex(
            /^\+[1-9]\d{7,14}$/,
            "Phone must be in international format"
        ),

    password: z.string()
        .min(8)
        .max(72)
});

const loginSchema = z.object({
    email: z.string()
        .trim()
        .email(),

    password: z.string()
        .min(8)
        .max(72)
});


function cookieOptions() {

    return {
        httpOnly: true,

        secure:
            process.env.NODE_ENV === "production",

        sameSite: "lax",

        maxAge:
            7 * 24 * 60 * 60 * 1000,

        path: "/"
    };

}


function publicUser(user) {

    return {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone
    };

}


function createToken(user) {

    return jwt.sign(

        {
            sub: user.id,
            email: user.email,
            name: user.name
        },

        process.env.JWT_SECRET,

        {
            expiresIn: "7d"
        }

    );

}


/*
==================================================
SEND REAL OTP
==================================================
*/

router.post("/send-otp", async (req, res) => {

    try {

        const phone = String(
            req.body.phone || ""
        ).trim();


        if (!/^\+[1-9]\d{7,14}$/.test(phone)) {

            return res.status(400).json({

                error:
                    "Enter phone number in international format. Example: +919876543210"

            });

        }

        if (!twilioConfigured) {

            const code = "123456";

            demoOtps.set(phone, {
                code,
                expiresAt: Date.now() + 5 * 60 * 1000
            });

            return res.json({
                success: true,
                demo: true,
                status: "pending",
                message: "Demo OTP generated. Use code 123456 to verify.",
                otp: code
            });
        }


        const verification =
            await twilioClient.verify.v2
                .services(
                    process.env.TWILIO_VERIFY_SERVICE_SID
                )
                .verifications
                .create({

                    to: phone,

                    channel: "sms"

                });


        return res.json({

            success: true,

            status: verification.status,

            message:
                "OTP sent successfully to your mobile number."

        });


    } catch (error) {

        console.error(
            "OTP SEND ERROR:",
            error.message
        );


        return res.status(500).json({

            error:
                "Unable to send OTP. Check Twilio configuration."

        });

    }

});


/*
==================================================
VERIFY REAL OTP
==================================================
*/

router.post("/verify-otp", async (req, res) => {

    try {

        const phone = String(
            req.body.phone || ""
        ).trim();


        const otp = String(
            req.body.otp || ""
        ).trim();


        if (!phone || !otp) {

            return res.status(400).json({

                error:
                    "Phone number and OTP are required."

            });

        }

        if (!twilioConfigured) {

            const savedOtp = demoOtps.get(phone);

            if (!savedOtp || savedOtp.expiresAt < Date.now() || savedOtp.code !== otp) {

                return res.status(401).json({
                    error: "Invalid or expired OTP."
                });
            }

            demoOtps.delete(phone);

            return res.json({
                success: true,
                verified: true,
                demo: true,
                message: "Mobile number verified successfully."
            });
        }


        const verification =
            await twilioClient.verify.v2
                .services(
                    process.env.TWILIO_VERIFY_SERVICE_SID
                )
                .verificationChecks
                .create({

                    to: phone,

                    code: otp

                });


        if (verification.status !== "approved") {

            return res.status(401).json({

                error:
                    "Invalid or expired OTP."

            });

        }


        return res.json({

            success: true,

            verified: true,

            message:
                "Mobile number verified successfully."

        });


    } catch (error) {

        console.error(
            "OTP VERIFY ERROR:",
            error.message
        );


        return res.status(401).json({

            error:
                "Invalid or expired OTP."

        });

    }

});


/*
==================================================
REGISTER
==================================================
*/

router.post("/register", async (req, res) => {

    try {

        const parsed =
            registerSchema.safeParse(req.body);


        if (!parsed.success) {

            return res.status(400).json({

                error:
                    "Please enter valid registration details."

            });

        }


        const {
            name,
            email,
            phone,
            password
        } = parsed.data;


        const normalizedEmail =
            email.toLowerCase();


        if (users.has(normalizedEmail)) {

            return res.status(409).json({

                error:
                    "An account with this email already exists."

            });

        }


        /*
        IMPORTANT:

        In production, store verified phone
        status in PostgreSQL.

        For this prototype the frontend
        should verify OTP BEFORE calling
        registration.
        */


        const passwordHash =
            await bcrypt.hash(
                password,
                12
            );


        const user = {

            id: crypto.randomUUID(),

            name,

            email: normalizedEmail,

            phone,

            passwordHash

        };


        users.set(
            normalizedEmail,
            user
        );


        const token =
            createToken(user);


        res.cookie(
            "access_token",
            token,
            cookieOptions()
        );


        return res.status(201).json({

            success: true,

            user:
                publicUser(user)

        });


    } catch (error) {

        console.error(error);


        return res.status(500).json({

            error:
                "Registration failed."

        });

    }

});


/*
==================================================
LOGIN
==================================================
*/

router.post("/login", async (req, res) => {

    try {

        const parsed =
            loginSchema.safeParse(req.body);


        if (!parsed.success) {

            return res.status(400).json({

                error:
                    "Enter a valid email and password."

            });

        }


        const {
            email,
            password
        } = parsed.data;


        const user =
            users.get(
                email.toLowerCase()
            );


        if (!user) {

            return res.status(401).json({

                error:
                    "Invalid email or password."

            });

        }


        const passwordValid =
            await bcrypt.compare(
                password,
                user.passwordHash
            );


        if (!passwordValid) {

            return res.status(401).json({

                error:
                    "Invalid email or password."

            });

        }


        const token =
            createToken(user);


        res.cookie(
            "access_token",
            token,
            cookieOptions()
        );


        return res.json({

            success: true,

            user:
                publicUser(user)

        });


    } catch (error) {

        console.error(error);


        return res.status(500).json({

            error:
                "Login failed."

        });

    }

});


/*
==================================================
LOGOUT
==================================================
*/

router.post("/logout", (req, res) => {

    res.clearCookie(
        "access_token",
        cookieOptions()
    );


    res.json({

        success: true

    });

});


export default router;