import firebase from "firebase/compat";
import Timestamp = firebase.firestore.Timestamp;
export interface Episode {
  symptoms?: {
    seizure:boolean,
    lossOfConsciousness:boolean,
    fullBody:string,
    eyes: string,
    leftArm: string,
    leftHand: string,
    leftLeg: string,
    rightArm: string,
    rightHand: string,
    rightLeg: string,
  },
  id: string,
  startTime?: Timestamp,
  endTime?: Timestamp,
  otherMedication?: string,
  otherTrigger?: string,
  knownTriggers?: [string],
  notes?: string,
  rescueMedication?: [string],

}
