export function oneYearFromNow() {
  const date = new Date();
  date.setFullYear(date.getFullYear() + 1);
  return date;
}

export function thirtyDaysFromNow() {
  const date = new Date();
  date.setTime(date.getTime() + 30 * 24 * 60 * 60 * 1000);
  return date;
}

export function fifteenMinutesFromNow() {
  const date = new Date();
  date.setTime(date.getTime() + 15 * 60 * 1000);
  return date;
}

export const ONE_DAY_MS = 24 * 60 * 60 * 1000