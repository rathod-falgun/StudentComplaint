package com.project.ComplaintApp.services;

import java.time.DayOfWeek;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.EnumSet;
import java.util.Set;

import org.springframework.stereotype.Service;

import com.project.ComplaintApp.Enums.ComplaintPriority;

@Service
public class WorkingHoursDeadlineService {

    // College working hours: 09:00 AM to 05:00 PM (8 working hours per day)
    public static final LocalTime WORK_START = LocalTime.of(9, 0);
    public static final LocalTime WORK_END = LocalTime.of(17, 0);

    // Working days: Monday to Friday (Saturday & Sunday closed)
    public static final Set<DayOfWeek> WORK_DAYS = EnumSet.of(
            DayOfWeek.MONDAY,
            DayOfWeek.TUESDAY,
            DayOfWeek.WEDNESDAY,
            DayOfWeek.THURSDAY,
            DayOfWeek.FRIDAY);

    /**
     * Priority Working Hours:
     * - HIGH: 12 working hours (1.5 working days)
     * - MEDIUM: 24 working hours (3 working days)
     * - LOW: 48 working hours (6 working days)
     */
    public int getSlaWorkingHours(ComplaintPriority priority) {
        if (priority == null) {
            return 24;
        }
        return switch (priority) {
            case HIGH -> 12;
            case MEDIUM -> 24;
            case LOW -> 48;
        };
    }

    /**
     * Calculates the resolution deadline based on college working hours:
     * 9:00 AM - 5:00 PM, Monday through Saturday.
     */
    public LocalDateTime calculateDeadline(LocalDateTime startDateTime, ComplaintPriority priority) {
        if (startDateTime == null) {
            startDateTime = LocalDateTime.now();
        }

        int targetWorkingHours = getSlaWorkingHours(priority);
        long remainingMinutes = (long) targetWorkingHours * 60;

        LocalDateTime current = adjustToNextWorkingWindow(startDateTime);

        while (remainingMinutes > 0) {
            long availableTodayMinutes = Duration.between(current.toLocalTime(), WORK_END).toMinutes();

            if (remainingMinutes <= availableTodayMinutes) {
                current = current.plusMinutes(remainingMinutes);
                remainingMinutes = 0;
            } else {
                remainingMinutes -= availableTodayMinutes;
                // Move to start of next working day
                current = moveToNextWorkingDayStart(current.toLocalDate());
            }
        }

        return current;
    }

    /**
     * Adjusts the start time to fall inside an active college working window.
     * If submitted on Sunday, moves to Monday 09:00 AM.
     * If submitted before 09:00 AM, moves to 09:00 AM today.
     * If submitted at or after 05:00 PM, moves to 09:00 AM of next working day.
     */
    public LocalDateTime adjustToNextWorkingWindow(LocalDateTime dateTime) {
        LocalDate date = dateTime.toLocalDate();
        LocalTime time = dateTime.toLocalTime();

        // If today is not a working day (Sunday)
        if (!WORK_DAYS.contains(date.getDayOfWeek())) {
            return moveToNextWorkingDayStart(date);
        }

        // Before 9:00 AM
        if (time.isBefore(WORK_START)) {
            return date.atTime(WORK_START);
        }

        // After 5:00 PM
        if (!time.isBefore(WORK_END)) {
            return moveToNextWorkingDayStart(date);
        }

        // Currently within working hours
        return dateTime;
    }

    /**
     * Finds the next working day starting from the day after the given date at 09:00 AM.
     */
    private LocalDateTime moveToNextWorkingDayStart(LocalDate date) {
        LocalDate nextDate = date.plusDays(1);
        while (!WORK_DAYS.contains(nextDate.getDayOfWeek())) {
            nextDate = nextDate.plusDays(1);
        }
        return nextDate.atTime(WORK_START);
    }
}
