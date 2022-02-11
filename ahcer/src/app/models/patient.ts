import firebase from "firebase/compat";
import Timestamp = firebase.firestore.Timestamp;

export interface Patient {
  firstName: string,
  lastName: string,
  gender?: string,
  birthDate: Timestamp,
  dateOfDiagnosis?: Timestamp,
  primaryPhysicianName: string,
  primaryPhysicianPhone: string
}
