(() => {
    const express = require("express");
    const firebase = require("firebase-admin");

    // ========== ИНИЦИАЛИЗАЦИЯ FIREBASE ==========
    console.log("Initializing Firebase...");
    
    if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
        console.error("FIREBASE_SERVICE_ACCOUNT_KEY environment variable is missing!");
        process.exit(1);
    }

    let serviceAccount;
    try {
        serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
        console.log("Service account loaded. Project ID:", serviceAccount.project_id);
    } catch (error) {
        console.error("Error parsing service account JSON:", error.message);
        process.exit(1);
    }

    try {
        firebase.initializeApp({
            credential: firebase.credential.cert(serviceAccount),
            databaseURL: "https://desktopnews-f7f75-default-rtdb.firebaseio.com",
        });
        console.log("✅ Firebase initialized successfully");
    } catch (error) {
        console.error("❌ Firebase initialization failed:", error.message);
        process.exit(1);
    }
    // ============================================

    const app = express();
    app.use(express.json());

    let listAllUsers = [];

    const setlistAllUsers = async (nextPageToken) => {
        try {
            console.log("Fetching users, nextPageToken:", nextPageToken || "none");
            const listUsersResult = await firebase.auth().listUsers(1000, nextPageToken);
            
            listUsersResult.users.forEach((userRecord) => {
                listAllUsers.push(userRecord.toJSON());
            });
            
            console.log(`Fetched ${listUsersResult.users.length} users, total: ${listAllUsers.length}`);
            
            if (listUsersResult.pageToken) {
                await setlistAllUsers(listUsersResult.pageToken);
            }
        } catch (error) {
            console.error("Error in setlistAllUsers:", error.message);
            throw error;
        }
    };

    app.get("/getNameAndPhotoUserByID", async (req, res) => {
        console.log("GET /getNameAndPhotoUserByID", req.query);
        
        if (req.query.apiKey != "7dbd6be92a7faeebcc1395f9f8c5d19dc77c8340") {
            res.status(403).json({ error: "Invalid access key" });
            return;
        }

        try {
            const dataUser = await firebase.auth().getUser(req.query.uid);
            res.status(200).json({ userName: dataUser.displayName, photoURL: dataUser.photoURL });
        } catch (error) {
            console.error("Error fetching user:", error);
            res.status(500).json({ error: error.message });
        }
    });

    app.get("/listAllUsersByPageNumber", async (req, res) => {
        console.log("GET /listAllUsersByPageNumber", req.query);
        
        if (req.query.apiKey != "7dbd6be92a7faeebcc1395f9f8c5d19dc77c8340") {
            res.status(403).json({ error: "Invalid access key" });
            return;
        }

        try {
            listAllUsers = [];
            await setlistAllUsers(req.query.page);
            res.status(200).json({ listAllUsers: listAllUsers });
        } catch (error) {
            console.error("Error in /listAllUsersByPageNumber:", error);
            res.status(500).json({ error: error.message });
        }
    });

    app.post("/disabelUserByID", async (req, res) => {
        console.log("POST /disabelUserByID", req.body);
        
        if (
            req.body["apiKey"] != "7dbd6be92a7faeebcc1395f9f8c5d19dc77c8340" ||
            req.body["apiKey"] === undefined ||
            req.body["apiKey"] === null
        ) {
            res.status(403).json({ error: "Invalid access key" });
            return;
        }

        try {
            await firebase.auth().updateUser(req.body["uid"], {
                disabled: req.body["disabled"],
            });
            res.status(200).json({ statusOperation: "success" });
        } catch (error) {
            console.error("Error disabling user:", error);
            res.status(500).json({ error: error.message });
        }
    });

    app.post("/updateUserByID", async (req, res) => {
        console.log("POST /updateUserByID", req.body);
        
        if (
            req.body["apiKey"] != "7dbd6be92a7faeebcc1395f9f8c5d19dc77c8340" ||
            req.body["apiKey"] === undefined ||
            req.body["apiKey"] === null
        ) {
            res.status(403).json({ error: "Invalid access key" });
            return;
        }

        try {
            await firebase.database().ref("users").child(req.body["uid"]).set({
                age: req.body["age"],
                role: req.body["role"],
            });
            res.status(200).json({ statusOperation: "success" });
        } catch (error) {
            console.error("Error updating user:", error);
            res.status(500).json({ error: error.message });
        }
    });

    // Тестовый эндпоинт для проверки подключения
    app.get("/test-firebase", async (req, res) => {
        try {
            const auth = firebase.auth();
            console.log("Testing Firebase Auth...");
            
            // Пробуем получить список пользователей (1 штука)
            const result = await auth.listUsers(1);
            res.status(200).json({ 
                success: true, 
                message: "Firebase connected successfully",
                userCount: result.users.length 
            });
        } catch (error) {
            console.error("Test failed:", error);
            res.status(500).json({ 
                success: false, 
                error: error.message,
                stack: error.stack 
            });
        }
    });

    module.exports = app;
})();