const admin = require('firebase-admin');

const serviceAccountPath = process.argv[2];

console.log(`Using service account ${serviceAccountPath}.`);
console.log("Populating all medication documents with archived field.")

admin.initializeApp({
  credential: admin.credential.cert(serviceAccountPath)
})

async function addArchivedFieldToMedications() {
  let db = admin.firestore();
  let userDocs = (await db.collection('users').get()).docs;
  for (let userDoc of userDocs) {
    let patientsSnapshot = await db.collection(`users/${userDoc.id}/patients`).get();
    console.log(`Working on user ${userDoc.id}...`)
    if(!patientsSnapshot.empty) {
      let patientDocs = patientsSnapshot.docs;
      for (let patientDoc of patientDocs) {
        let medicationsSnapshot = (await db
          .collection(`users/${userDoc.id}/patients/${patientDoc.id}/medications`)
          .get());
        if(!medicationsSnapshot.empty) {
          let medicationDocs = medicationsSnapshot.docs;
          for (let medicationDoc of medicationDocs) {
            if((typeof medicationDoc.data().archived) === 'undefined') {
              await db.collection(`users/${userDoc.id}/patients/${patientDoc.id}/medications`)
                .doc(medicationDoc.id)
                .update({
                  archived: false
                })
            }
          }
        }
      }
    }
  }
}

addArchivedFieldToMedications()
  .then(()=> {
    console.log("Job complete! Exiting...");
    process.exit();
  })
