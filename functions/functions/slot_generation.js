const functions = require("firebase-functions");
const admin = require("firebase-admin");
const generateReservationSlots = require("../services/slotGenerator");
const dayjs = require("dayjs");

admin.initializeApp();
const db = admin.firestore();

/**
 * Cloud Function that runs daily at 00:00 AM (America/Toronto time) to generate
 * reservation slots for all restaurants in the Firestore database.
 *
 * It checks each restaurant document in the 'restaurants' collection for the
 * following conditions:
 * - Must have a defined `schedule`, `availabilities`, and `account_uid`
 * - Only generates new slots if
 *      `last_slot_generated_on` is missing or older than 7 days
 *
 * For each eligible restaurant, it:
 * - Generates reservation slots for the next 14 days using business rules
 * - Saves the slots to the global 'availabilities'
 *      collection with UUIDs as document IDs
 * - Updates the `last_slot_generated_on`
 *      field with the current server timestamp
 *
 * Slots include the following structure:
 * {
 *   // Unique UUID
 *   id: string,
 *   // From account_uid
 *   restaurant_id: string,
*    // Start time in 'HH:mm' format
 *   time: string,
 *   // Date in 'YYYY-MM-DD' format
 *   date: string,
 *   // Number of available tables for that slot
 *   tables_available: number
 * }
 *
 * @function onScheduleGenerateSlots
 * @returns {Promise<void>} A promise that resolves when
 *      all slots are generated and written
 */
exports.onScheduleGenerateSlots = functions.pubsub
    .schedule("every day 00:00")
    .timeZone("America/Toronto")
    .onRun(async () => {
      const restaurantSnapshot = await db.collection("restaurants").get();
      const batch = db.batch();
      const daysToGenerate = 14;
      const now = dayjs();

      for (const doc of restaurantSnapshot.docs) {
        const restaurantData = doc.data();
        const restaurantRef = doc.ref;

        // Skip if incomplete
        if (
          !restaurantData.schedule ||
                !restaurantData.availabilities ||
                !restaurantData.account_uid
        ) {
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

        // Generate slots
        const slots = generateReservationSlots(
            {
              schedule: restaurantData.schedule,
              availabilities: restaurantData.availabilities,
              account_uid: restaurantData.account_uid,
            },
            daysToGenerate,
        );

        slots.forEach((slot) => {
          const slotRef = db.collection("availabilities").doc(slot.id);
          batch.set(slotRef, slot);
        });

        // Update the last_slot_generated_on field
        batch.update(restaurantRef, {
          last_slot_generated_on: admin.firestore.FieldValue.serverTimestamp(),
        });

        console.log(`✅ Generated slots for ${restaurantData.account_uid}`);
      }

      await batch.commit();
      console.log("🎉 All eligible restaurants processed");
    });
