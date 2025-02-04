export const secondsToHourString = (seconds: number) => (seconds / 3600).toFixed(2);

export const hourStringToSecondsString = (hourString: string) =>
  hourString.length === 0 ? "0" : Math.floor(parseFloat(hourString) * 3600).toString();
