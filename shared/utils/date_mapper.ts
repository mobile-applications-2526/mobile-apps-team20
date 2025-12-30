export class DateMapper {
  /**
   * Formats a Date object to YYYY-MM-DD
   * ensuring local time is respected.
   */
  static toPersistence(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  /**
   * Formats a Date to LocalDateTime format: YYYY-MM-DDTHH:mm:ss
   * (ISO 8601 without timezone, using device local time)
   */
  static toISOStringLocal(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  }
  
  /**
   * Resets any Date object to 00:00:00
   */
  static toStartOfDay(date: Date): Date {
    const newDate = new Date(date);
    newDate.setHours(0, 0, 0, 0);
    return newDate;
  }
}