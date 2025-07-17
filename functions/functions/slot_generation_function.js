const {onSchedule} = require("firebase-functions/v2/scheduler");
const {initializeApp} = require("firebase-admin/app");
const {getFirestore} = require("firebase-admin/firestore");
const generateReservationSlots = require("../services/slotGenerator");
const dayjs = require("dayjs");

initializeApp();
const db = getFirestore();

exports.dailySlotGeneration = onSchedule(
    {
      schedule: "0 2 * * *", // Tous les jours à 2h du matin UTC
      region: "africa-south1",
      timeoutSeconds: 300,
      memory: "1GiB",
    },
    async (event) => {
      try {
        const restaurants = await db.collection("restaurants").get();
        const daysToGenerate = 14;
        const now = dayjs();

        for (const doc of restaurants.docs) {
          const restaurantData = doc.data();

          if (
            !restaurantData.schedule ||
            !restaurantData.availabilities ||
            !restaurantData.account_uid
          ) {
            console.log("Incomplete");
            continue;
          }

          const lastGenerated = restaurantData.last_slot_generated_on ?
            dayjs(restaurantData.last_slot_generated_on.toDate()) :
            null;

          const shouldGenerate =
            !lastGenerated || now.diff(lastGenerated, "day") >= 7;

          if (!shouldGenerate) {
            console.log(`Skipping ${restaurantData.account_uid}
               (slots generated recently)`);
            continue;
          }

          const slots = generateReservationSlots(
              {
                schedule: restaurantData.schedule,
                availabilities: restaurantData.availabilities,
                account_uid: restaurantData.account_uid,
              },
              daysToGenerate,
          );

          console.log(
              `Generated ${slots.length} 
              slots for ${restaurantData.account_uid}`,
          );

          for (const slot of slots) {
            try {
              await db.collection("availabilities").add(slot);
            } catch (e) {
              console.log(e);
            }
          }
        }

        console.log("✅ Daily slot generation completed");
      } catch (err) {
        console.error("❌ Error generating slots:", err);
      }
    },
);
