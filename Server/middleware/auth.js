const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
    try {
        // Check if Authorization header exists
        const authHeader = req.headers['authorization'];
        //console.log(authHeader+"test");
        if (!authHeader) {
            return res.status(401).json({ message: 'No token provided' });
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'Invalid token format' });
        }

        // Verify token
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                return res.status(403).json({ message: 'Invalid or expired token' });
            }
            req.user = decoded; // Attach decoded user to request
            next(); // Call next to proceed
        });

    } catch (error) {
        console.error('Auth Middleware Error:', error);
        return res.status(500).json({ message: 'Authentication error' });
    }
};

module.exports = authenticateToken;
