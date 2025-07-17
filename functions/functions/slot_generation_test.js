const {onRequest} = require("firebase-functions/v2/https");
const {initializeApp} = require("firebase-admin/app");
const {getFirestore} = require("firebase-admin/firestore");
const generateReservationSlots = require("../services/slotGenerator");
const dayjs = require("dayjs");

initializeApp();
const db = getFirestore();

exports.testGenerateSlots = onRequest(
    {
      region: "africa-south1",
      timeoutSeconds: 300,
      memory: "1GiB",
      cors: true,
    },
    async (req, res) => {
      try {
        const restaurants = await db.collection("restaurants").get();
        const daysToGenerate = 14;
        const now = dayjs();

        for (const doc of restaurants.docs) {
          console.log("Going thru restaurants");
          const restaurantData = doc.data();
          //   const restaurantRef = doc.ref;

          // Skip if incomplete
          if (
            !restaurantData.schedule ||
                    !restaurantData.availabilities ||
                    !restaurantData.account_uid
          ) {
            console.log("Incomplete");
            continue;
          }

          // Check last_slot_generated_on
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

          console.log("About to generate slot");
          // Generate slots
          const slots = generateReservationSlots(
              {
                schedule: restaurantData.schedule,
                availabilities: restaurantData.availabilities,
                account_uid: restaurantData.account_uid,
              },
              daysToGenerate,
          );
          console.log("Slots generated, ", slots);

          console.log("going thru slots");
          slots.forEach(async (slot) => {
            try {
              await db.collection("availabiities")
                  .add(slot);
            } catch (e) {
              console.log(e);
            }
          });
        }

        res.send("Success");
      } catch (err) {
        console.error("❌ Error generating slots:", err);
        res.status(500).send("Failed");
      }
    },
);
