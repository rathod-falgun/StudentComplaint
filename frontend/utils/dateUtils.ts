/**
 * Date and Time utilities for Indian Standard Time (IST, UTC+05:30).
 * Ensures dates and times are accurately interpreted and formatted in Indian time
 * across all client devices and operating systems.
 */

export const parseIndianDate = (dateStr?: string | null): Date | null => {
    if (!dateStr || typeof dateStr !== "string") return null;
    let normalized = dateStr.trim();
    if (!normalized) return null;

    // If dateStr has no timezone indicator (no 'Z' and no [+-]HH:mm offset),
    // append '+05:30' so the ECMAScript Date parser strictly treats it as Indian Standard Time (IST).
    if (!normalized.endsWith("Z") && !/[+-]\d{2}:\d{2}$/.test(normalized)) {
        normalized = normalized + "+05:30";
    }

    const parsed = new Date(normalized);
    return isNaN(parsed.getTime()) ? null : parsed;
};

/**
 * Formats date into readable Indian date, e.g. "28 Oct 2026"
 */
export const formatDate = (dateStr?: string | null): string => {
    const d = parseIndianDate(dateStr);
    if (!d) return "-";
    return d.toLocaleDateString("en-IN", {
        timeZone: "Asia/Kolkata",
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

/**
 * Formats date and time into readable Indian date-time, e.g. "28 Oct 2026, 12:12 pm"
 */
export const formatDateTime = (dateStr?: string | null): string => {
    const d = parseIndianDate(dateStr);
    if (!d) return "-";
    return d.toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    });
};

/**
 * Formats time into readable Indian time, e.g. "12:12 pm"
 */
export const formatTime = (dateStr?: string | null): string => {
    const d = parseIndianDate(dateStr);
    if (!d) return "-";
    return d.toLocaleTimeString("en-IN", {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    });
};

