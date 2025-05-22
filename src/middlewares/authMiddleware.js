const admin = require('../firebaseAdmin');

async function verifyFirebaseToken(req, res, next) {
    const authorizationHeader = req.headers.authorization;

    if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
        return res.status(403).send({ error: 'Unauthorized. No token provided.' });
    }

    const idToken = authorizationHeader.split('Bearer ')[1];

    try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        req.user = decodedToken; // Adds Firebase user info (uid, email, etc.) to request
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