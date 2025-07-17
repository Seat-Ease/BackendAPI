const {onSchedule} = require("firebase-functions/v2/scheduler");
const {getFirestore} = require("firebase-admin/firestore");

const db = getFirestore();

/**
 * Scheduled Firebase function to remove duplicate availabilities daily.
 * Duplicates are docs with the same restaurant_id, date, and time.
 */
exports.removeAvailabilityDuplicates = onSchedule(
    {
      schedule: "0 3 * * *", // Every day at 03:00 UTC
      region: "africa-south1",
      timeoutSeconds: 300,
      memory: "1GiB",
    },
    async (event) => {
      try {
        const snapshot = await db.collection("availabilities").get();
        const seen = new Set();
        const batch = db.batch();
        let duplicates = 0;

        snapshot.forEach((doc) => {
          const data = doc.data();
          const key = `${data.restaurant_id}_${data.date}_${data.time}`;
          if (seen.has(key)) {
            batch.delete(doc.ref);
            duplicates++;
          } else {
            seen.add(key);
          }
        });

        if (duplicates > 0) {
          await batch.commit();
        }

        console.log(`Removed ${duplicates} duplicate availabilities.`);
      } catch (err) {
        console.error("Error removing duplicates:", err);
      }
    },
);
