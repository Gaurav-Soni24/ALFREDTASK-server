import jwt from "jsonwebtoken";

export const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      console.log("No token provided!");
      return res.status(401).json({ message: "Authentication required" });
    }

    console.log("Received Token:", token);

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    console.log("Token Decoded:", decoded);

    // Ensure 'userId' exists in token payload
    if (!decoded.userId) {
      console.error("JWT Error: Missing 'userId' in token payload");
      return res
        .status(401)
        .json({ message: "Invalid token: Missing user ID" });
    }

    req.user = { id: decoded.userId }; // Assign userId as id for consistency
    next();
  } catch (error) {
    console.error("Authentication Error:", error.message);
    res.status(401).json({ message: "Invalid token" });
  }
};
