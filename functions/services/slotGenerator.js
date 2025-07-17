const {v4: uuidv4} = require("uuid");

/**
 * Generates reservation time slots using native Date.
 *
 * @param {Object} settings
 * - Configuration settings
 * @param {Object} settings.schedule
 * - Days open and open/close time
 * @param {Object} settings.availabilities
 * - intervalle and available tables
 * @param {string} settings.account_uid
 * - Restaurant ID
 * @param {number} [daysToGenerate=14]
 * - Number of days to generate
 * @param {string} [timeZone="Africa/Johannesburg"]
 * - Timezone (not used in Date version)
 * @return {Array<Object>} Reservation slots
 */
function generateReservationSlots(
    settings,
    daysToGenerate = 14,
    timeZone = "Africa/Johannesburg") {
  const slots = [];
  const schedule = settings.schedule;
  const intervalle = settings.availabilities.intervalle;
  const availableTables = settings.availabilities.available_tables;
  const restaurantId = settings.account_uid;

  const daysMap = [
    "sunday", "monday",
    "tuesday", "wednesday",
    "thursday", "friday",
    "saturday",
  ];

  const now = new Date();
  now.setHours(0, 0, 0, 0); // Start from today's midnight

  for (let i = 0; i < daysToGenerate; i++) {
    console.log()
    const date = new Date(now);
    date.setDate(now.getDate() + i);
    const dayName = daysMap[date.getDay()];

    if (!schedule[dayName]) continue;

    const [openHour, openMinute] = schedule
        .opening_time.split(":").map(Number);
    const [closeHour, closeMinute] = schedule
        .closing_time.split(":").map(Number);

    const open = new Date(date);
    open.setHours(openHour, openMinute, 0, 0);

    const close = new Date(date);
    close.setHours(closeHour, closeMinute, 0, 0);

    // Latest slot must start at least 1 hour before closing
    const latestSlotStart = new Date(close);
    latestSlotStart.setHours(latestSlotStart.getHours() - 1);

    let current = new Date(open);

    console.log(current <= latestSlotStart);
    console.log(new Date(current.getTime() +
    intervalle * 60000) <= close);

    while (
      current <= latestSlotStart &&
      new Date(current.getTime() + intervalle * 60000) <= close
    ) {
      const startTime = current.toTimeString().slice(0, 5); // HH:mm
      const formattedDate = current
          .toISOString().split("T")[0]; // YYYY-MM-DD

      slots.push({
        id: uuidv4(),
        restaurant_id: restaurantId,
        time: startTime,
        date: formattedDate,
        tables_available: availableTables,
      });

      current = new Date(
          current.getTime() + intervalle * 60000,
      );
    }
  }

  return slots;
}

module.exports = generateReservationSlots;
