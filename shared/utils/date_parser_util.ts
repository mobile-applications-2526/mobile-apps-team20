import { format, parseISO } from 'date-fns';
import { capitalize } from './word_capitalizer';

// Interface for type safety
export interface DateComponents {
  dayName: string;   // "Monday"
  month: string;     // "November"
  day: string;       // "15"
  year: string;      // "2020"
  shortDate: string; // "11/11/2020"
  time: string;      // "19:00"
}

export const dateParser = (isoString: string | null | undefined): DateComponents => {
  // Default fallback values
  const fallback: DateComponents = { 
    dayName: "", month: "", day: "", year: "", shortDate: "", time: "" 
  };

  if (!isoString) return fallback;

  try {
    const date = parseISO(isoString);
    
    return {
      dayName: capitalize(format(date, 'EEEE')),
      month: capitalize(format(date, 'MMMM')),
      day: format(date, 'd'),
      year: format(date, 'yyyy'),
      shortDate: format(date, 'dd/MM/yyyy'),
      time: format(date, 'HH:mm'),
    };
  } catch (error) {
    return fallback;
  }
};

