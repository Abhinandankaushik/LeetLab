import bcypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { db, UserRole } from "@repo/db"
import { verifyToken, createClerkClient } from "@clerk/backend";

import dotenv from "dotenv";
dotenv.config();

const clerkSecretKey = process.env.CLERK_SECRET_KEY;
const clerkClient = clerkSecretKey ? createClerkClient({ secretKey: clerkSecretKey }) : null;

// Shared cookie options so login / register / oauth all behave identically.
const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
};

const issueSession = (res, userId) => {
    const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.cookie("jwt", token, cookieOptions);
};

export const register = async (req, res) => {

    const { email, password, name } = req.body
    try {
        const existingUser = await db.user.findUnique({
            where: { email }
        });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User already exists"
            });
        }

        const hashedPassword = await bcypt.hash(password, 10);

        const newUser = await db.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                role: UserRole.USER,
            }
        });

        const token = jwt.sign(
            { id: newUser.id },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d"
            }
        );

        res.cookie("jwt", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000
        })

        res.status(201).json({
            success: true,
            message: "User Register Successfully",
            user: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role,
                image: newUser.image
            }
        });

    } catch (err) {
        console.log("error while registering user", err)
        res.status(500).json({
            success: false,
            message: "Internal Server Error while registering user"
        })
    }
}

export const login = async (req, res) => {

    const { email, password } = req.body;

    try {
        const user = await db.user.findUnique({
            where: {
                email
            }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "User does not exist"
            });
        }

        const isMatch = await bcypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Invalide credentials"
            });
        }

        const token = jwt.sign(
            { id: user.id },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d"
            }
        );

        res.cookie("jwt", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000
        })

        res.status(200).json(
            {
                success: true,
                message: "User Login Successfully",
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    image: user.image
                }
            }
        )

    } catch (err) {
        console.log("error while login user", err)
        res.status(500).json({
            success: false,
            message: "Internal Server Error while login user"
        })
    }
}

export const logout = async (req, res) => {

    try {
        res.clearCookie("jwt", {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
        });

        res.status(200).json({
            success: true,
            message: "User Logout Successfully"
        })

    } catch (err) {
        console.log("error while logout user", err)
        res.status(500).json({
            success: false,
            message: "Internal Server Error while logout user"
        })
    }
}

export const check = (req, res) => {

    try {
        res.status(200).json({
            success: true,
            message: "User authenticated successfully",
            user: req.user
        })
    } catch (err) {
        console.log("error while checking user", err)
        res.status(500).json({
            success: false,
            message: "Internal Server Error while checking user"
        })
    }
}

// Social login bridge: the frontend authenticates with Clerk (Google / GitHub),
// then sends Clerk's short-lived session token here. We verify it, sync the user
// into our own database, and issue our regular `jwt` cookie so the rest of the app
// (middleware, profile, etc.) keeps working unchanged.
export const oauth = async (req, res) => {
    try {
        if (!clerkClient) {
            return res.status(503).json({
                success: false,
                message: "Social login is not configured on the server",
            });
        }

        const { token } = req.body;
        if (!token) {
            return res.status(400).json({ success: false, message: "Missing token" });
        }

        let claims;
        try {
            claims = await verifyToken(token, { secretKey: clerkSecretKey });
        } catch (err) {
            return res.status(401).json({ success: false, message: "Invalid social session" });
        }

        const clerkUserId = claims.sub;
        const clerkUser = await clerkClient.users.getUser(clerkUserId);

        const email =
            clerkUser.emailAddresses.find((e) => e.id === clerkUser.primaryEmailAddressId)
                ?.emailAddress || clerkUser.emailAddresses[0]?.emailAddress;

        if (!email) {
            return res.status(400).json({ success: false, message: "No email on social account" });
        }

        const fullName =
            [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ").trim() ||
            clerkUser.username ||
            email.split("@")[0];
        const image = clerkUser.imageUrl || null;

        let user = await db.user.findUnique({ where: { email } });

        if (!user) {
            // OAuth users have no password — store an unusable random hash to satisfy the schema.
            const randomPassword = await bcypt.hash(crypto.randomUUID(), 10);
            user = await db.user.create({
                data: {
                    email,
                    name: fullName,
                    image,
                    password: randomPassword,
                    role: UserRole.USER,
                },
            });
        } else if (!user.image && image) {
            user = await db.user.update({ where: { id: user.id }, data: { image } });
        }

        issueSession(res, user.id);

        res.status(200).json({
            success: true,
            message: "Social login successful",
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                image: user.image,
            },
        });
    } catch (err) {
        console.log("error while social login", err);
        res.status(500).json({
            success: false,
            message: "Internal Server Error during social login",
        });
    }
};