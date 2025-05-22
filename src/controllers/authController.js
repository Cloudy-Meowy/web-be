const admin = require('../firebaseAdmin');

// console.log('admin initialized =', !!admin);

/**
 * Registers a new user with email and password in Firebase Authentication.
 * This does NOT log the user in automatically on the backend; the frontend
 * needs to handle the subsequent login (e.g., using signInWithEmailAndPassword).
 */
exports.register = async (req, res) => {
	const { email, password } = req.body;

	if (!email || !password) {
		return res.status(400).json({ message: 'Email and password are required.' });
	}

	try {
		const userRecord = await admin.auth().createUser({
			email: email,
			password: password,
			emailVerified: false, // Set to false for email verification
			disabled: false,
		});

		console.log('Successfully created new user:', userRecord.uid);

		res.status(201).json({
			message: 'User registered successfully!',
			uid: userRecord.uid,
			email: userRecord.email,
		});
	} catch (error) {
		console.error('Error creating new user:', error);
		// Handle specific Firebase error codes
		if (error.code === 'auth/email-already-in-use') {
			return res.status(409).json({ message: 'Email already exists.' });
		}
		if (error.code === 'auth/weak-password') {
			return res.status(400).json({ message: 'Password is too weak. Must be at least 6 characters.' });
		}
		res.status(500).json({ message: 'Failed to register user.', error: error.message });
	}
};

/**
 * Handles login by verifying a Firebase ID Token received from the frontend.
 * The frontend is responsible for obtaining this ID Token via:
 * - Email/Password login (firebase.auth().signInWithEmailAndPassword())
 * - Google Sign-In (firebase.auth().signInWithPopup(new firebase.auth.GoogleAuthProvider()))
 * - GitHub Sign-In (firebase.auth().signInWithPopup(new firebase.auth.GithubAuthProvider()))
 *
 * This endpoint verifies the token and returns user details.
 */
exports.loginWithIdToken = async (req, res) => {
	const { idToken } = req.body; // Expecting the ID token from the frontend

	if (!idToken) {
		return res.status(400).json({ message: 'ID token is required.' });
	}

    try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const uid = decodedToken.uid;
        const email = decodedToken.email;
        const name = decodedToken.name;
        const provider = decodedToken.firebase.sign_in_provider || 'none'; // e.g., 'google.com', 'github.com'

        // do anything if valid token
        res.status(200).send({
			uid: uid,
			email: email,
			name: name,
			provider: provider,
			message: `User authenticated successfully.`
        });

    } catch (error) {
        console.error('Error verifying ID token:', error);
        // Handle specific Firebase error codes for token verification
        if (error.code === 'auth/argument-error' || error.code === 'auth/invalid-id-token') {
        return res.status(401).json({ message: 'Invalid or expired Firebase ID token.', error: error.message });
        }
        res.status(500).json({ message: 'Failed to authenticate.', error: error.message });
    }
};
