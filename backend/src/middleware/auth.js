import jwt from "jsonwebtoken";


export function auth(req, res, next) {

    try {

        const bearer =
            req.headers.authorization?.startsWith(
                "Bearer "
            )
                ? req.headers.authorization.slice(7)
                : null;


        const token =
            req.cookies?.access_token ||
            bearer;


        if (!token) {

            return res.status(401).json({

                error:
                    "Authentication required."

            });

        }


        const decoded =
            jwt.verify(
                token,
                process.env.JWT_SECRET
            );


        req.user =
            decoded;


        next();


    } catch (error) {

        return res.status(401).json({

            error:
                "Invalid or expired session."

        });

    }

}