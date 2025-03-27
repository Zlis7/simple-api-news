(()=>{
    const express = require('express');
    const firebase = require('firebase-admin');
    const serviceAccount = require('./desktopnews-f7f75-firebase-adminsdk-fbsvc-7dbd6be92a.json');

    const defaultApp = firebase.initializeApp({
        credential: firebase.credential.cert(serviceAccount),
        databaseURL: 'https://desktopnews-f7f75-default-rtdb.firebaseio.com'
    });

    const db = firebase.database();
    const app = express();
    app.use(express.json());

    app.post('/login', async(req, res) => {
        try {
            const userRecord = await defaultApp.auth().getUserByEmail(req.body['email'])

            res.json({ content: true, user: userRecord});
        } catch (error) {
            res.status(403).json({error:error.message});
        }
    });

    app.post('/registration', async(req, res) => {
        try {
            const userRecord = await defaultApp.auth().createUser ({
                email: req.body['email'],
                password: req.body['password'],
                emailVerified: false,
                disabled: false
            });

            res.json({ content: true, uid: userRecord.uid });
        } catch (error) {
            res.status(403).json({error:error.message});
        }
    });
    
    
    app.listen(3001, () => {});

    module.exports = app;
})();
