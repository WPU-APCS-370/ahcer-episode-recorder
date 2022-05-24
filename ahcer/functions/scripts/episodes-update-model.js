const admin = require('firebase-admin');

const serviceAccountPath = process.argv[2];

const updateGlobally = process.argv.includes('--global') || process.argv.includes('-g');

console.log(`Using service account ${serviceAccountPath}.`);
if(updateGlobally)
  console.log("Updating all episodes.")
else
  console.log("Updating all episodes under test account.")

admin.initializeApp({
  credential: admin.credential.cert(serviceAccountPath)
})

async function updateEpisodes() {
  let db = admin.firestore();
  let userDocs = (await db.collection('users').get()).docs;
  for (let userDoc of userDocs) {
    if (!updateGlobally) {
      if(userDoc.id !== "CXby5i0PPnTpnd4SWCwx7HlMYAj2") {
        continue;
      }
    } else {
      console.log(`Working on user ${userDoc.id}...`)
    }

    let patientsSnapshot = await db.collection(`users/${userDoc.id}/patients`).get();
    if(!patientsSnapshot.empty) {
      let patientDocs = patientsSnapshot.docs;
      for (let patientDoc of patientDocs) {
        if(!updateGlobally) {
          console.log(`Working on patient ${patientDoc.id}...`);
        }
        let episodesSnapshot = (await db
          .collection(`users/${userDoc.id}/patients/${patientDoc.id}/episodes`)
          .get());
        if(!episodesSnapshot.empty) {
          let episodeDocs = episodesSnapshot.docs;
          for (let episodeDoc of episodeDocs) {
            let updateData = {}
            if((typeof episodeDoc.data().symptoms) !== 'undefined') {
              let symptoms = {}
              for (let key in episodeDoc.data().symptoms) {
                let symptom = episodeDoc.data().symptoms[key];
                if((typeof symptom) !== 'string' && (typeof symptom) !== 'boolean')
                  break;
                if(symptom) {
                  if (key !== "seizure" && key !== "lossOfConsciousness") {
                    symptoms[key] = {
                      type: symptom,
                      time: episodeDoc.data().startTime
                    };
                  } else {
                    symptoms[key] = {
                      present: true,
                      time: episodeDoc.data().startTime
                    };
                  }
                }
                else
                  symptoms[key] = {};
              }

              let newKeys = ["seizure", "lossOfConsciousness", "fullBody"];

              for (let key of newKeys) {
                if (!Object.keys(episodeDoc.data().symptoms).includes(key)) {
                  if (Object.keys(symptoms).length <= 0)
                    symptoms = episodeDoc.data().symptoms;
                  symptoms[key] = {};
                }
              }
              if(Object.keys(symptoms).length > 0)
                updateData['symptoms'] = symptoms;
            }

            if((typeof episodeDoc.data().medications) !== 'undefined') {
              let medications = episodeDoc.data().medications;
              if((typeof medications.rescueMeds) !== 'undefined') {
                let rescueMeds = [];
                for (let index = 0; index < medications.rescueMeds.length; index++) {
                  let rescueMed = medications.rescueMeds[index];
                  if ((typeof rescueMed.time) !== 'undefined')
                    break;
                  rescueMed['time'] = episodeDoc.data().startTime;
                  rescueMeds.push(rescueMed);
                }
                if(rescueMeds.length <= 0)
                  delete medications.rescueMeds;
                else
                  medications.rescueMeds = rescueMeds;
                updateData.medications = medications;
              }
            }

            if (Object.keys(updateData).length > 0) {
              await db.collection(`users/${userDoc.id}/patients/${patientDoc.id}/episodes`)
                .doc(episodeDoc.id)
                .update(updateData)
            }
          }
        }
      }
    }
  }
}

updateEpisodes()
  .then(()=> {
    console.log("Job complete! Exiting...");
    process.exit();
  })
