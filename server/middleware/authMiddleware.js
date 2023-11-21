import JWT from 'jsonwebtoken';

const userAuth = async (req, res, next) => {
    const authHeader = req?.headers?.authorization;

    // Check if there is an authorization header and if it starts with "Bearer".
    // If not, signal authentication failure by calling the next middleware with an error message.

    if (!authHeader || !authHeader?.startsWith("Bearer")) {
        next("Authentication === failed");
    }

    const token = authHeader?.split(" ")[1];

    try {
        const userToken = JWT.verify(token, process.env.JWT_SECRET_KEY);

        req.body.user = {
            userId: userToken.userId,
        };

        next();

    } catch (error) {
        console.log(error);
        next("Authentication failed");
    }
};

export default userAuth;