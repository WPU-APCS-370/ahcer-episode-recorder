import firebase from "firebase/compat";
import Timestamp = firebase.firestore.Timestamp;

export interface Medication {
  name: string,
  type: string,
  frequency?:string
  doseInfo: {
    amount: number,
    unit: string
  },
  id: string,
  active?: boolean,
  archived?: boolean,
  archiveDate?: Timestamp
}
