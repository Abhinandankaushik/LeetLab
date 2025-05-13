import bcypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "../libs/db.js"
import { UserRole } from "../generated/prisma/index.js";

import dotenv from "dotenv";
dotenv.config();

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
                role: UserRole.USER
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
            secure: process.env.NODE_ENV !== "development",
            sameSite: "strict",
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
            secure: process.env.NODE_ENV !== "development",
            sameSite: "strict",
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
            secure: process.env.NODE_ENV !== "development",
            sameSite: "strict",
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
            User: req.user
        })
    } catch (err) {
        console.log("error while checking user", err)
        res.status(500).json({
            success: false,
            message: "Internal Server Error while checking user"
        })
    }
}   