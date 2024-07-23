import firebase from "firebase/compat";
import Timestamp = firebase.firestore.Timestamp;
export interface Episode {
  symptoms?: {
    seizure: {present?: boolean, time?: Timestamp},
    lossOfConsciousness: {present?: boolean, time?: Timestamp},
    fullBody: {type?: string, time?: Timestamp},
    eyes: {type?: string, time?: Timestamp},
    leftArm: {type?: string, time?: Timestamp},
    leftHand: {type?: string, time?: Timestamp},
    leftLeg: {type?: string, time?: Timestamp},
    rightArm: {type?: string, time?: Timestamp},
    rightHand: {type?: string, time?: Timestamp},
    rightLeg: {type?: string, time?: Timestamp},
    apnea_breathing: {time?: Timestamp},
    autonomic_dysfunction: {type?: string, text?:string, time?: Timestamp},
    swallowing_choking: {type?: string, time?: Timestamp},
    chorea_tremors: {type?: string, time?: Timestamp},
  },
  id: string,
  startTime?: Timestamp,
  endTime?: Timestamp,
  status?:string,
  otherMedication?: string,
  otherTrigger?: string,
  knownTriggers?: [string],
  notes?: string,
  medications?: {
    rescueMeds?: {
      id: string,
      doseInfo: {
        amount: number,
        unit: string
      },
      time: Timestamp
    }[],
    prescriptionMeds?: {
      name: string,
      doseInfo: {
        amount: number,
        unit: string
      }
    }[]
  },
  behavior?: string
}
