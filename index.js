(() => {
  const express = require("express");
  const firebase = require("firebase-admin");
  const serviceAccount = require("./desktopnews-f7f75-firebase-adminsdk-fbsvc-f951b49b05.json");

  firebase.initializeApp({
    credential: firebase.credential.cert(serviceAccount),
    databaseURL: "https://desktopnews-f7f75-default-rtdb.firebaseio.com",
  });

  const app = express();
  app.use(express.json());

  let listAllUsers = [];

  const setlistAllUsers = async (nextPageToken) => {
    await firebase
      .auth()
      .listUsers(1000, nextPageToken)
      .then((listUsersResult) => {
        listUsersResult.users.forEach((userRecord) => {
          listAllUsers.push(userRecord.toJSON());
        });
        if (listUsersResult.pageToken) {
          setlistAllUsers(listUsersResult.pageToken);
        }
      });
  };

  app.get("/getNameAndPhotoUserByID", async (req, res) => {
    if (req.query.apiKey != "7dbd6be92a7faeebcc1395f9f8c5d19dc77c8340") {
      res.status(403).json({ error: "Invalid access key" });
    }

    const dataUser = await firebase.auth().getUser(req.query.uid);
    res
      .status(200)
      .json({ userName: dataUser.displayName, photoURL: dataUser.photoURL });
  });

  app.get("/listAllUsersByPageNumber", async (req, res) => {
    if (req.query.apiKey != "7dbd6be92a7faeebcc1395f9f8c5d19dc77c8340") {
      res.status(403).json({ error: "Invalid access key" });
    }

    listAllUsers = [];
    await setlistAllUsers(req.query.page);

    res.status(200).json({ listAllUsers: listAllUsers });
  });

  app.post("/disabelUserByID", async (req, res) => {
    if (
      req.body["apiKey"] != "7dbd6be92a7faeebcc1395f9f8c5d19dc77c8340" ||
      req.body["apiKey"] === undefined ||
      req.body["apiKey"] === null
    ) {
      res.status(403).json({ error: "Invalid access key" });
    }

    await firebase.auth().updateUser(req.body["uid"], {
      disabled: req.body["disabled"],
    });

    res.status(200).json({ statusOperation: "success" });
  });

  app.post("/updateUserByID", async (req, res) => {
    if (
      req.body["apiKey"] != "7dbd6be92a7faeebcc1395f9f8c5d19dc77c8340" ||
      req.body["apiKey"] === undefined ||
      req.body["apiKey"] === null
    ) {
      res.status(403).json({ error: "Invalid access key" });
    }

    await firebase.database().ref("users").child(req.body["uid"]).set({
      age: req.body["age"],
      role: req.body["role"],
    });

    res.status(200).json({ statusOperation: "success" });
  });

  app.listen(3001, () => {});
  module.exports = app;
})();
