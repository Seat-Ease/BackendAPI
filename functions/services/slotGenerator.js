const {v4: uuidv4} = require("uuid");

/**
 * Génère des créneaux de réservation en UTC.
 *
 * @param {Object} settings
 * @param {Object} settings.schedule
 * @param {Object} settings.availabilities
 * @param {string} settings.account_uid
 * @param {number} [daysToGenerate=14]
 * @return {Array<Object>} Reservation slots
 */
function generateReservationSlots(
    settings,
    daysToGenerate = 14,
) {
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

  // Use startDate if provided, else today
  let now;
  if (settings.startDate) {
    now = new Date(settings.startDate + "T00:00:00Z");
  } else {
    now = new Date();
    now.setUTCHours(0, 0, 0, 0);
  }

  for (let i = 0; i < daysToGenerate; i++) {
    const date = new Date(Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate() + i,
        0, 0, 0, 0,
    ));
    const dayName = daysMap[date.getUTCDay()];

    if (!schedule[dayName]) continue;
    if (!schedule.opening_time || !schedule.closing_time) continue;

    const [openHour, openMinute] = schedule.opening_time.split(":").map(Number);
    const [closeHour, closeMinute] = schedule.closing_time
        .split(":").map(Number);

    const openMinutes = openHour * 60 + openMinute;
    let closeMinutes = closeHour * 60 + closeMinute;

    // Si la fermeture est le lendemain
    if (closeMinutes <= openMinutes) {
      closeMinutes += 24 * 60;
    }

    // Dernier créneau commence 1h avant fermeture
    const lastSlotMinutes = closeMinutes - 60;

    const slotTimes = [];
    for (let minutes = openMinutes;
      minutes <= lastSlotMinutes; minutes += intervalle
    ) {
      const slotHour = Math.floor(minutes / 60) % 24;
      const slotMinute = minutes % 60;
      const timeStrMin = `${slotMinute.toString().padStart(2, "0")}`;
      const timeStrHour = `${slotHour.toString().padStart(2, "0")}`;
      // Format time as HH:MM
      const timeStr = `${timeStrHour}:${timeStrMin}`;
      slotTimes.push(timeStr);
    }

    const formattedDate = date.toISOString().split("T")[0]; // YYYY-MM-DD

    for (const time of slotTimes) {
      slots.push({
        id: uuidv4(),
        restaurant_id: restaurantId,
        time,
        date: formattedDate,
        tables_available: availableTables,
      });
    }
  }

  return slots;
}

module.exports = generateReservationSlots;
