const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'No token provided' });
        }

        const token = authHeader.split(' ')[1];
        jwt.verify(token, process.env.JWT_SECRET || 'secret', (err, decoded) => {
            if (err) {
                return res.status(401).json({ message: 'Invalid token' });
            }
            req.userId = decoded.id || decoded._id || decoded.userId;
            req.userRole = decoded.role;

            if (!req.userId) {
                return res.status(401).json({ message: 'Token missing user identification' });
            }
            next();
        });
    } catch (error) {
        console.error('Verify Token Error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

module.exports = { verifyToken };
