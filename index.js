(()=>{
    const express = require('express');
    const firebase = require('firebase-admin');
    const serviceAccount = require('./desktopnews-f7f75-firebase-adminsdk-fbsvc-7dbd6be92a.json');

    const defaultApp = firebase.initializeApp({
        credential: firebase.credential.cert(serviceAccount),
        databaseURL: 'https://desktopnews-f7f75-default-rtdb.firebaseio.com'
    });

    const app = express();
    app.use(express.json());

    app.post('/login', async(req, res) => {
        try {
            const userRecord = await defaultApp.auth().createUser ({
                email: req.body['email'],
                emailVerified: false,
                phoneNumber: req.body['phone'],
                password: req.body['password'],
                displayName: req.body['name'],
                photoURL: 'https://static.wikia.nocookie.net/disco-elysium3537/images/c/ce/%D0%A1%D0%B8%D0%BB%D0%B0_%D0%B2%D0%BE%D0%BB%D0%B8.png/revision/latest?cb=20210704100328&path-prefix=ru',
                disabled: false
            });
            res.json({ content: true, uid: userRecord.uid });
        } catch (error) {
            console.error('Error creating new user:', error);
            res.status(500).json({ error: 'Failed to create user' });
        }
    });
    app.post('/api/hello', (req, res) => {
        res.json({ content: req.body});
    });
    app.post('/register', (req, res) => {
        const {name, email, password} = req.body;
        RegisterModel.findOne({email: email})
        .then(user => {
            if(user) {
                res.json('Already have an account')
            } else {
                RegisterModel.create({name: name, email: email, password: password})
                .then(result => res.json(result))
                .catch(err => res.json(err))
            }
        }).catch(err => res.json(err))
    });
    
    app.listen(3001, () => {});

    module.exports = app;
})();
