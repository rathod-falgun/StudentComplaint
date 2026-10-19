package com.project.ComplaintApp.services;

import static org.junit.jupiter.api.Assertions.assertEquals;

import java.time.DayOfWeek;
import java.time.LocalDateTime;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import com.project.ComplaintApp.Enums.ComplaintPriority;

class WorkingHoursDeadlineServiceTest {

    private WorkingHoursDeadlineService deadlineService;

    @BeforeEach
    void setUp() {
        deadlineService = new WorkingHoursDeadlineService();
    }

    @Test
    void testHighPriorityWithinWorkingHours() {
        // Monday 10:00 AM, HIGH = 12 working hours
        // Mon 10:00 - 17:00 = 7 hours (5 hours remaining)
        // Tue 09:00 - 14:00 = 5 hours
        // Expected: Tuesday 14:00 (02:00 PM)
        LocalDateTime submitted = LocalDateTime.of(2026, 10, 19, 10, 0); // Oct 19, 2026 is Monday
        assertEquals(DayOfWeek.MONDAY, submitted.getDayOfWeek());

        LocalDateTime deadline = deadlineService.calculateDeadline(submitted, ComplaintPriority.HIGH);
        assertEquals(LocalDateTime.of(2026, 10, 20, 14, 0), deadline);
    }

    @Test
    void testMediumPriorityAcrossWorkingDays() {
        // Monday 09:00 AM, MEDIUM = 24 working hours (3 full working days: Mon, Tue, Wed)
        // Mon (8h) + Tue (8h) + Wed (8h) = 24h -> Ends at Wednesday 05:00 PM (17:00)
        LocalDateTime submitted = LocalDateTime.of(2026, 10, 19, 9, 0);

        LocalDateTime deadline = deadlineService.calculateDeadline(submitted, ComplaintPriority.MEDIUM);
        assertEquals(LocalDateTime.of(2026, 10, 21, 17, 0), deadline);
    }

    @Test
    void testWeekendSkippedWhenSpanningWeekend() {
        // Friday 04:00 PM (16:00), HIGH = 12 working hours
        // Fri 16:00 - 17:00 = 1 hour (11 hours remaining)
        // Sat & Sun: skipped (closed)
        // Mon 09:00 - 17:00 = 8 hours (3 hours remaining)
        // Tue 09:00 - 12:00 = 3 hours
        // Expected: Tuesday 12:00 PM
        LocalDateTime submitted = LocalDateTime.of(2026, 10, 23, 16, 0); // Oct 23, 2026 is Friday
        assertEquals(DayOfWeek.FRIDAY, submitted.getDayOfWeek());

        LocalDateTime deadline = deadlineService.calculateDeadline(submitted, ComplaintPriority.HIGH);
        assertEquals(LocalDateTime.of(2026, 10, 27, 12, 0), deadline);
    }

    @Test
    void testSubmittedOnWeekendAdjustsToMonday() {
        // Saturday 02:00 PM, HIGH = 12 working hours
        // Should adjust to Monday 09:00 AM
        // Mon 09:00 - 17:00 = 8 hours (4 hours remaining)
        // Tue 09:00 - 13:00 = 4 hours
        // Expected: Tuesday 13:00 (01:00 PM)
        LocalDateTime submitted = LocalDateTime.of(2026, 10, 24, 14, 0); // Oct 24, 2026 is Saturday
        assertEquals(DayOfWeek.SATURDAY, submitted.getDayOfWeek());

        LocalDateTime deadline = deadlineService.calculateDeadline(submitted, ComplaintPriority.HIGH);
        assertEquals(LocalDateTime.of(2026, 10, 27, 13, 0), deadline);
    }

    @Test
    void testLowPriorityAcrossTwoWeeks() {
        // Monday 09:00 AM, LOW = 48 working hours (6 working days: Mon-Fri = 40h, next Mon = 8h)
        // Week 1: Mon-Fri (5 days * 8h = 40h)
        // Sat & Sun: skipped (closed)
        // Week 2: Mon (8h) -> Ends next Monday at 05:00 PM (17:00)
        LocalDateTime submitted = LocalDateTime.of(2026, 10, 19, 9, 0);

        LocalDateTime deadline = deadlineService.calculateDeadline(submitted, ComplaintPriority.LOW);
        assertEquals(LocalDateTime.of(2026, 10, 26, 17, 0), deadline);
    }
}
