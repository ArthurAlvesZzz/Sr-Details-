import { BookingRequest, ScheduleSettings, Service } from '../types.ts';

export function timeToMinutes(time: string): number {
  if (!time) return 0;
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

export function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

export function getServiceDuration(service: Service): { minutes: number; days: number } {
  return {
    minutes: service.durationMinutes || 0,
    days: service.durationDays || 0
  };
}

export function isWorkingDay(dateStr: string, settings: ScheduleSettings): boolean {
  const date = new Date(dateStr + 'T12:00:00Z');
  const dayOfWeek = date.getUTCDay();
  return settings.workingDays.includes(dayOfWeek);
}

export function isDateBlocked(dateStr: string, settings: ScheduleSettings): boolean {
  return settings.blockedDates.includes(dateStr);
}

export function getBookingsForDate(dateStr: string, bookings: BookingRequest[]): BookingRequest[] {
  const targetDate = new Date(dateStr + 'T12:00:00Z');
  
  return bookings.filter(b => {
    if (b.status === 'Cancelado' || b.status === 'Finalizado') return false;
    
    if (b.date === dateStr) return true;
    
    // Check multi-day bleeding
    if (b.serviceDurationDays && b.serviceDurationDays > 1) {
      const bDate = new Date(b.date + 'T12:00:00Z');
      const diffTime = targetDate.getTime() - bDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      // If target is within the duration days of the booking (e.g., booked day + 1)
      if (diffDays > 0 && diffDays < b.serviceDurationDays) {
         return true;
      }
    }
    
    return false;
  });
}

export function hasCapacityForSlot(
  dateStr: string, 
  startTimeStr: string, 
  durationMinutes: number, 
  bookings: BookingRequest[], 
  settings: ScheduleSettings,
  durationDays: number = 0
): boolean {
  const daysToCheck = durationDays > 0 ? durationDays : 1;
  const startDate = new Date(dateStr + 'T12:00:00Z');

  for (let i = 0; i < daysToCheck; i++) {
    const currentCheckDate = new Date(startDate);
    currentCheckDate.setDate(currentCheckDate.getDate() + i);
    const currDateStr = currentCheckDate.toISOString().split('T')[0];

    if (!isWorkingDay(currDateStr, settings) || isDateBlocked(currDateStr, settings)) {
      return false; // Cannot book if any required day is blocked or closed
    }

    const startMins = i === 0 ? timeToMinutes(startTimeStr) : timeToMinutes(settings.businessHours.start);
    const endMins = durationDays > 0 ? timeToMinutes(settings.businessHours.end) : startMins + durationMinutes;

    if (endMins > timeToMinutes(settings.businessHours.end)) {
      return false; // Exceeds business hours
    }

    // Check generic blocked slots
    for (const block of settings.blockedTimeSlots) {
      if (block.date === currDateStr) {
        const blockStart = timeToMinutes(block.startTime);
        const blockEnd = timeToMinutes(block.endTime);
        if ((startMins >= blockStart && startMins < blockEnd) || 
            (endMins > blockStart && endMins <= blockEnd) ||
            (startMins <= blockStart && endMins >= blockEnd)) {
          return false;
        }
      }
    }

    // Check bookings overlapping
    const dateBookings = getBookingsForDate(currDateStr, bookings);
    
    let overlappingCount = 0;
    for (const b of dateBookings) {
      const bStartMins = timeToMinutes(b.startTime || b.time || '00:00') - settings.bufferBetweenBookingsMinutes;
      const bEndMins = timeToMinutes(b.endTime || calculateEndTime(b.time, b.serviceDurationMinutes || 120)) + settings.bufferBetweenBookingsMinutes;
      
      const bIsMultiDay = (b.serviceDurationDays || 0) > 0;
      
      if (bIsMultiDay) {
         overlappingCount++; // Occupies the team for the whole day
      } else {
        if ((startMins >= bStartMins && startMins < bEndMins) || 
            (endMins > bStartMins && endMins <= bEndMins) ||
            (startMins <= bStartMins && endMins >= bEndMins)) {
          overlappingCount++;
        }
      }
    }

    if (overlappingCount >= settings.teamsCapacity) {
       return false;
    }
  }

  return true;
}

export function getAvailableSlots(dateStr: string, service: Service, bookings: BookingRequest[], settings: ScheduleSettings): string[] {
  if (!isWorkingDay(dateStr, settings) || isDateBlocked(dateStr, settings)) {
    return [];
  }
  
  const { minutes: durationMinutes, days: durationDays } = getServiceDuration(service);
  
  let currentMins = timeToMinutes(settings.businessHours.start);
  const endMins = timeToMinutes(settings.businessHours.end);
  const availableSlots: string[] = [];

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const currentTotalMins = now.getHours() * 60 + now.getMinutes();

  if (dateStr === todayStr && !settings.allowSameDayBooking) {
    return [];
  }

  while (currentMins < endMins) {
    // If it's today, it needs to be strictly in the future by minimumNoticeMinutes
    let isValidTime = true;
    if (dateStr === todayStr) {
      if (currentMins < currentTotalMins + settings.minimumNoticeMinutes) {
        isValidTime = false;
      }
    }

    if (isValidTime) {
      const timeStr = minutesToTime(currentMins);
      if (hasCapacityForSlot(dateStr, timeStr, durationMinutes, bookings, settings, durationDays)) {
        availableSlots.push(timeStr);
      }
    }

    currentMins += settings.slotIntervalMinutes;
  }

  return availableSlots;
}

export function isDateFullyBooked(dateStr: string, service: Service, bookings: BookingRequest[], settings: ScheduleSettings): boolean {
  if (!isWorkingDay(dateStr, settings) || isDateBlocked(dateStr, settings)) return true;
  const slots = getAvailableSlots(dateStr, service, bookings, settings);
  return slots.length === 0;
}

export function findNextAvailableSlot(service: Service, bookings: BookingRequest[], settings: ScheduleSettings, fromDateStr: string): { date: string; time: string } | null {
  const fromDate = new Date(fromDateStr + 'T12:00:00Z');
  
  // Check up to 30 days ahead
  for (let i = 0; i <= 30; i++) {
    const currentCheckDate = new Date(fromDate);
    currentCheckDate.setDate(currentCheckDate.getDate() + i);
    const dateStr = currentCheckDate.toISOString().split('T')[0];
    
    if (!isWorkingDay(dateStr, settings) || isDateBlocked(dateStr, settings)) continue;
    
    const slots = getAvailableSlots(dateStr, service, bookings, settings);
    if (slots.length > 0) {
      return { date: dateStr, time: slots[0] };
    }
  }
  return null;
}

export function calculateEndTime(startTime: string, durationMinutes: number): string {
  if (!startTime) return '';
  return minutesToTime(timeToMinutes(startTime) + durationMinutes);
}
