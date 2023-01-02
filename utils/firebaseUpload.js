const firebase = require("../db");

const firestore = firebase.firestore();
require("firebase/storage");

const storage = firebase.storage().ref();

const addImage = async (req, res) => {
  try {
    const file = req.file;
    const timestamp = Date.now();
    const name = file.originalname.split(".")[0];
    const type = file.originalname.split(".")[1];
    const fileName = `${name}_${timestamp}.${type}`;
    const imageRef = storage.child(fileName);
    const snapshot = await imageRef.put(file.buffer);
    const downloadUrl = await snapshot.ref.getDownloadURL();
    res.send(downloadUrl);
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: error.message });
  }
};

module.exports = addImage;
