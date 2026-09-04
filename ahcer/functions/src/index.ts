import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import {Response} from "express";

admin.initializeApp();

type UserAccessData = {
  PI?: string;
  isAdmin?: boolean;
  parentId?: string;
  study?: string;
};

const allowedOrigins = new Set([
  "http://localhost:4200",
  "https://ahcer.org",
  "https://www.ahcer.org",
  "https://wpu-ahcer.web.app",
  "https://wpu-ahcer.firebaseapp.com",
]);

const setCorsHeaders = (origin: string | undefined, response: Response) => {
  if (origin && allowedOrigins.has(origin)) {
    response.set("Access-Control-Allow-Origin", origin);
  }
  response.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  response.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
};

const getBearerToken = (authorizationHeader?: string) => {
  if (!authorizationHeader) {
    return null;
  }

  const [scheme, token] = authorizationHeader.split(" ");
  if (scheme !== "Bearer" || !token) {
    return null;
  }

  return token;
};

exports.deleteAccount = functions.https.onRequest(async (request, response) => {
  const origin = request.get("Origin");
  setCorsHeaders(origin, response);

  try {
    if (!origin || !allowedOrigins.has(origin)) {
      response.status(403).send({
        success: false,
        message: "Origin not allowed.",
      });
      return;
    }

    if (request.method === "OPTIONS") {
      response.status(204).send("");
      return;
    }

    if (request.method !== "POST") {
      response.status(405).send({
        message: "Method Not Allowed. Please use POST.",
      });
      return;
    }

    const idToken = getBearerToken(request.get("Authorization"));
    if (!idToken) {
      response.status(401).send({
        success: false,
        message: "Authentication required.",
      });
      return;
    }

    let decodedToken: admin.auth.DecodedIdToken;
    try {
      decodedToken = await admin.auth().verifyIdToken(idToken);
    } catch (error) {
      console.error("Error verifying caller token:", error);
      response.status(401).send({
        success: false,
        message: "Authentication required.",
      });
      return;
    }

    const uid = request.body?.uid;

    if (typeof uid !== "string" || !uid.trim()) {
      response.status(400).send({
        message: "Missing UID in request body.",
      });
      return;
    }

    const [callerSnapshot, targetSnapshot] = await Promise.all([
      admin.firestore().doc(`users/${decodedToken.uid}`).get(),
      admin.firestore().doc(`users/${uid}`).get(),
    ]);

    const caller = callerSnapshot.data() as UserAccessData | undefined;
    const target = targetSnapshot.data() as UserAccessData | undefined;
    const canDeleteSelf = decodedToken.uid === uid;
    const canDeleteChild = target?.parentId === decodedToken.uid;
    const canDeleteStudyUser =
      Boolean(caller?.PI) && caller?.PI === target?.study;
    const isAdmin = caller?.isAdmin === true;

    if (!(canDeleteSelf || canDeleteChild || canDeleteStudyUser || isAdmin)) {
      response.status(403).send({
        success: false,
        message: "Permission denied.",
      });
      return;
    }

    await admin.firestore().doc(`users/${uid}`).delete();
    await admin.auth().deleteUser(uid);

    response.status(200).send({
      success: true,
      message: "User has been deleted successfully.",
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    response.status(500).send({
      success: false,
      message: "Error deleting user.",
    });
  }
});
