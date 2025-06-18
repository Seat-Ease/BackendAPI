const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");
const isSameOrBefore = require("dayjs/plugin/isSameOrBefore");
const {v4: uuidv4} = require("uuid");

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isSameOrBefore);

const daysMap = {
  0: "sunday",
  1: "monday",
  2: "tuesday",
  3: "wednesday",
  4: "thursday",
  5: "friday",
  6: "saturday",
};

/**
 * Generates reservation time slots for a restaurant based on its opening hours,
 * available tables, and slot interval duration.
 *
 * This function produces future time slots for the next `daysToGenerate` days,
 * filtering out days when the restaurant is closed. It also avoids generating
 * slots that would begin less than one hour
 * before the restaurant's closing time.
 *
 * Each slot has the following structure:
 * {
 *   id: string,               // UUID for the slot
 *   restaurant_id: string,    // From settings.account_uid
 *   time: string,             // Start time in "HH:mm" format
 *   date: string,             // Slot date in "YYYY-MM-DD" format
 *   tables_available: number  // Number of tables available at that time
 * }
 *
 * @function generateReservationSlots
 * @param {Object} settings - The restaurant's configuration settings.
 * @param {Object} settings.schedule - Object with keys as weekdays and
 * booleans indicating open status. Also contains opening_time and closing_time.
 * @param {Object} settings.availabilities - Includes `intervalle`
 * (duration in minutes) and `available_tables` (max reservations per slot).
 * @param {string} settings.account_uid - Unique identifier for the restaurant.
 * @param {number} [daysToGenerate=14] - Number of future days
 *      for which to generate slots.
 * @param {string} [timeZone="America/Toronto"]
 * - Time zone in which slots are created.
 * @return {Array<Object>} An array of slot objects, each representing
 *      a valid reservation time slot.
 */
function generateReservationSlots(settings, daysToGenerate = 14,
    timeZone = "America/Toronto") {
  const slots = [];
  const schedule = settings.schedule;
  const intervalle = settings.availabilities.intervalle;
  const availableTables = settings.availabilities.available_tables;
  const restaurantId = settings.account_uid;

  const now = dayjs().tz(timeZone).startOf("day");

  for (let i = 0; i < daysToGenerate; i++) {
    const date = now.add(i, "day");
    const dayName = daysMap[date.day()];

    if (!schedule[dayName]) continue;

    const open = dayjs.tz(`${date.format("YYYY-MM-DD")} 
        ${schedule.opening_time}`, timeZone);
    const close = dayjs.tz(`${date.format("YYYY-MM-DD")} 
        ${schedule.closing_time}`, timeZone);
    const latestSlotStart = close.subtract(1, "hour");

    let current = open;

    while (
      current.add(intervalle, "minute").isSameOrBefore(close) &&
      current.isSameOrBefore(latestSlotStart)
    ) {
      const startTime = current.format("HH:mm");
      const formattedDate = date.format("YYYY-MM-DD");

      slots.push({
        id: uuidv4(),
        restaurant_id: restaurantId,
        time: startTime,
        date: formattedDate,
        tables_available: availableTables,
      });

      current = current.add(intervalle, "minute");
    }
  }

  return slots;
}

module.exports = generateReservationSlots;
