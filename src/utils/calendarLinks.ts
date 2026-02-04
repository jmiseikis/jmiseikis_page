// Calendar link generators for various calendar applications

export interface CalendarEvent {
  name: string;
  startDate: string;
  finishDate: string;
  location: string;
  description: string;
  officialUrl: string;
}

// Parse Google Sheets date format: "Date(year,month,day)"
const parseSheetDate = (dateStr: string): Date | null => {
  if (!dateStr) return null;
  const dateMatch = dateStr.match(/Date\((\d+),(\d+),(\d+)\)/);
  if (dateMatch) {
    const [, year, month, day] = dateMatch;
    return new Date(parseInt(year), parseInt(month), parseInt(day));
  }
  // Try regular date string
  const date = new Date(dateStr);
  return isNaN(date.getTime()) ? null : date;
};

// Format date to YYYYMMDD for Google Calendar
const formatDateForGoogle = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
};

// Format date to ISO format for Outlook
const formatDateForOutlook = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

// Format date for ICS (YYYYMMDD for all-day events)
const formatDateForICS = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
};

// Add one day to a date (for end dates in all-day events)
const addOneDay = (date: Date): Date => {
  const newDate = new Date(date);
  newDate.setDate(newDate.getDate() + 1);
  return newDate;
};

export const generateGoogleCalendarUrl = (event: CalendarEvent): string | null => {
  const startDate = parseSheetDate(event.startDate);
  const endDate = parseSheetDate(event.finishDate);
  
  if (!startDate || !endDate) return null;
  
  // For all-day events, Google Calendar needs end date to be exclusive (day after)
  const endDateExclusive = addOneDay(endDate);
  
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.name,
    dates: `${formatDateForGoogle(startDate)}/${formatDateForGoogle(endDateExclusive)}`,
    location: event.location,
    details: `${event.description}\n\nMore info: ${event.officialUrl}`,
  });
  
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
};

export const generateOutlookCalendarUrl = (event: CalendarEvent): string | null => {
  const startDate = parseSheetDate(event.startDate);
  const endDate = parseSheetDate(event.finishDate);
  
  if (!startDate || !endDate) return null;
  
  const params = new URLSearchParams({
    subject: event.name,
    startdt: formatDateForOutlook(startDate),
    enddt: formatDateForOutlook(endDate),
    location: event.location,
    body: `${event.description}\n\nMore info: ${event.officialUrl}`,
    allday: 'true',
    path: '/calendar/action/compose',
  });
  
  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
};

export const generateICSContent = (event: CalendarEvent): string | null => {
  const startDate = parseSheetDate(event.startDate);
  const endDate = parseSheetDate(event.finishDate);
  
  if (!startDate || !endDate) return null;
  
  // For all-day events in ICS, end date is exclusive
  const endDateExclusive = addOneDay(endDate);
  
  const uid = `${event.name.replace(/\s+/g, '-').toLowerCase()}-${formatDateForICS(startDate)}@techeventsswitzerland`;
  const now = new Date();
  const dtstamp = now.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  
  // Escape special characters for ICS
  const escapeICS = (str: string) => str.replace(/[,;\\]/g, '\\$&').replace(/\n/g, '\\n');
  
  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Tech Events Switzerland//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${dtstamp}`,
    `DTSTART;VALUE=DATE:${formatDateForICS(startDate)}`,
    `DTEND;VALUE=DATE:${formatDateForICS(endDateExclusive)}`,
    `SUMMARY:${escapeICS(event.name)}`,
    `LOCATION:${escapeICS(event.location)}`,
    `DESCRIPTION:${escapeICS(event.description + '\\n\\nMore info: ' + event.officialUrl)}`,
    event.officialUrl && event.officialUrl !== '[URL]' ? `URL:${event.officialUrl}` : '',
    'END:VEVENT',
    'END:VCALENDAR',
  ].filter(Boolean).join('\r\n');
  
  return icsContent;
};

export const downloadICSFile = (event: CalendarEvent): void => {
  const icsContent = generateICSContent(event);
  if (!icsContent) return;
  
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${event.name.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
