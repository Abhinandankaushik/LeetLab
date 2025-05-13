import jwt from "jsonwebtoken";
import { db } from "../libs/db.js";
export const authMiddleware = async (req, res, next) => {

    try {
        const token = req.cookies.jwt;

        if (!token) {
            res.status(401).json({
                success: false,
                message: "Unauthorized - No token provided"
            })
        }

        let decoded;

        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);

        } catch (err) {
            res.status(401).json({
                success: false,
                message: "Unauthorized - Invalid token"
            })
        }

        const user = await db.user.findUnique({
            where: {
                id: decoded.id
            },
            select: {
                id: true,
                image: true,
                name: true,
                email: true,
                role: true
            }
        });

        if (!user) {
           return  res.status(404).json({
                success: false,
                message: "Unauthorized - User not found"
            })
        }

        req.user = user;
        next();

    } catch (err) {
        console.log("error while authenticating user", err)
        res.status(500).json({
            success: false,
            message: "Internal Server Error in authention-middleware while authentication user "
        })
    }
}