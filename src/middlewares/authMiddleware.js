const admin = require('../app');

// Middleware to protect api that handles sensitive data
async function verifyFirebaseToken(req, res, next) {
    const authorizationHeader = req.headers.authorization;

    if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
        return res.status(403).send({ error: 'Unauthorized. No token provided.' });
    }

    const idToken = authorizationHeader.split('Bearer ')[1];

    try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        req.user = decodedToken; // Add user info to the request object
        next();
    } catch (error) {
        console.error('Error while verifying Firebase ID token:', error);
        if (error.code === 'auth/id-token-expired') {
            return res.status(401).send({ error: 'Token expired. Please login again.' });
        }
        return res.status(403).send({ error: 'Unauthorized. Invalid token.' });
    }
}

module.exports = verifyFirebaseToken;