import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

exports.deleteAccount = functions.https.onRequest(async (request, response) => {
    try {
        if (request.method !== "POST") {
            response.status(405).send({ message: "Method Not Allowed. Please use POST." });
            return;
        }

        const uid = request.body.uid;

        if (!uid) {
            response.status(400).send({ message: "Missing UID in request body." });
            return;
        }

        await admin.auth().deleteUser(uid);

        response.status(200).send({ success: true, message: `User has been deleted successfully.` });
    } catch (error) {
        console.error("Error deleting user:", error);
        response.status(500).send({ success: false, message: `Error deleting user: ${error}` });
    }
});
