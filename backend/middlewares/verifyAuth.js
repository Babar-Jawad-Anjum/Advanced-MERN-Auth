import jwt from "jsonwebtoken";

export const verifyAuth = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized - No auth token provided",
    });
  }

  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    if (!decodedToken) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - Invalid auth token",
      });
    }

    req.userId = decodedToken.userId;
    next();
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong on server!" });
  }
};
