import firebase from "firebase/compat";

export function convertSnaps<T>(results: firebase.firestore.QuerySnapshot<unknown>) {
  return <T[]> results.docs.map(snap => {
    return {
      id: snap.id,
      ...<any> snap.data() as any
    };
  });
}
