import firebase from "firebase/compat/app";
import Timestamp = firebase.firestore.Timestamp;

export function convertSnaps<T>(results) {
  return <T[]> results.docs.map(snap => {
    return {
      id: snap.id,
      ...<any> snap.data() as any
    };
  });
}

export function convertOneSnap<T>(snap) {
  return <T>{
      id: snap.id,
      ...<any> snap.data() as any
    };
}

export function comparTwoDates(dateA: Timestamp, dateB: Timestamp ){
  return dateA.toDate().getMonth() == dateB.toDate().getMonth()
        && dateA.toDate().getDate() == dateB.toDate().getDate()
        && dateA.toDate().getFullYear() == dateB.toDate().getFullYear()
}

