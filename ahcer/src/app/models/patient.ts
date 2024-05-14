import firebase from "firebase/compat";
import Timestamp = firebase.firestore.Timestamp;

export interface Patient {
  id: string,
  firstName: string,
  lastName: string,
  gender?: string,
  birthDate: Timestamp,
  dateOfDiagnosis?: Timestamp,
  primaryPhysicianName?: string,
  primaryPhysicianPhone?: string,
  otherDoctorInfo?: string,
  gene?: string,
  mutation?: string,
  weight?: string,
  otherMutation?: string
}
