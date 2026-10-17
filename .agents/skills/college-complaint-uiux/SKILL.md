---
name: college-complaint-uiux
description: UI/UX design standards, component guidelines, and implementation workflows for the College Complaint Management System (Expo React Native + Spring Boot). Activate when designing, refactoring, or polishing frontend screens, student/admin flows, forms, or visual design tokens.
---

# College Complaint Management System — UI/UX Design Standards & Guidelines

This skill provides comprehensive UI/UX standards, design tokens, component architecture, and implementation workflows for the **College Complaint Management System** built with **Expo React Native (frontend)** and **Spring Boot REST API (backend)**.

---

## 1. Visual Design System

### 1.1 Color Palette & Tokens
The application utilizes a dark, modern, and professional aesthetic tailored for college student and administration portals.

| Token | Hex / Value | Usage |
| :--- | :--- | :--- |
| `bg.primary` | `#17171C` | Screen root background |
| `bg.card` | `#1E1E24` or `#1B1B21` | Form containers, cards, dropdowns |
| `bg.surfaceSubtle` | `#222229` | Icon circles, button backgrounds |
| `border.default` | `#303038` or `#3A3A44`| Standard container and input borders |
| `border.focus` | `#007AFF` or `#2563EB` | Active/focused input and dropdown borders |
| `primary.accent` | `#007AFF` / `#2563EB` | Primary buttons, active tabs, action highlights |
| `primary.accentHover`| `#1D4ED8` | Pressed/active primary button state |
| `text.primary` | `#FFFFFF` | Headings, primary labels, card titles |
| `text.secondary` | `#E8E8ED` | Field labels, secondary body copy |
| `text.muted` | `#8D8D98` or `#9CA3AF`| Placeholders, helper captions, timestamps |
| `status.pending` | `#F59E0B` (text) / `rgba(245, 158, 11, 0.12)` (bg) | Pending triage |
| `status.inProgress` | `#3B82F6` (text) / `rgba(59, 130, 246, 0.12)` (bg) | Investigation / in progress |
| `status.resolved` | `#10B981` (text) / `rgba(16, 185, 129, 0.12)` (bg) | Successfully resolved |
| `status.rejected` | `#EF4444` (text) / `rgba(239, 68, 68, 0.12)` (bg) | Rejected / invalid |

### 1.2 Typography Hierarchy
- **Screen Title (`H1`)**: `fontSize: 24 - 28`, `fontWeight: '700'`, `color: '#FFFFFF'`, `letterSpacing: 0.3`
- **Section Heading (`H2`)**: `fontSize: 18 - 20`, `fontWeight: '700'`, `color: '#FFFFFF'`
- **Card Title / Subhead (`H3`)**: `fontSize: 15 - 16`, `fontWeight: '600'`, `color: '#FFFFFF'`
- **Form Field Label**: `fontSize: 13 - 14`, `fontWeight: '600'`, `color: '#E8E8ED'`, `marginBottom: 8`
- **Body / Content Text**: `fontSize: 14 - 15`, `fontWeight: '400'`, `color: '#E0E0E6'`, `lineHeight: 22`
- **Helper / Timestamp / Caption**: `fontSize: 11 - 12`, `fontWeight: '500'`, `color: '#8D8D98'`

### 1.3 Spacing, Borders & Shadows
- **Spacing Scale**: 4px, 8px, 12px, 16px, 20px, 24px, 32px.
- **Horizontal Screen Padding**: `20px` to `22px` for comfortable mobile reach.
- **Border Radii**:
  - Cards & Modal Containers: `12px` to `16px`
  - Input Fields & Dropdowns: `10px` to `11px`
  - Primary Action Buttons: `10px` to `12px`
  - Badges & Pills: `16px` to `20px`
  - Circular Avatars & Icons: `width / 2`
- **Elevation & Shadows**:
  - Accent glow: `shadowColor: '#007AFF'`, `shadowOffset: { width: 0, height: 6 }`, `shadowOpacity: 0.25`, `shadowRadius: 10`, `elevation: 4`
  - Dark card elevation: `shadowColor: '#000000'`, `shadowOffset: { width: 0, height: 2 }`, `shadowOpacity: 0.3`, `shadowRadius: 6`, `elevation: 2`

### 1.4 Iconography
- Always use `@expo/vector-icons` (`Ionicons`, `MaterialIcons`, `Feather`).
- Standard icon sizes: `18px` for inline/badge icons, `22-24px` for headers/tabs, `32-38px` for empty states/avatars.

---

## 2. Student Screens Architecture

### 2.1 Login & Registration
- **Email Validation**: Enforce `@scet.ac.in` official college email domain with real-time feedback (green checkmark for `@scet.ac.in`, warning for personal domains).
- **OTP Verification Card**:
  - Show OTP card conditionally upon `otpSent === true`.
  - Display clear 6-digit PIN input with monospace spacing (`letterSpacing: 6`, `textAlign: 'center'`).
  - Provide a cooldown resend countdown timer (e.g., 60 seconds).
  - Transition border to green (`#10B981`) when 6 digits are typed.
- **Password Hygiene**: Password visibility toggle, minimum 6 characters validation, confirm password match.
- **Profile Photo Picker**: Clean circular avatar preview with camera/gallery choice and crop support.
- **Academic Fields**: Searchable department & division dropdowns via `react-native-element-dropdown`.

### 2.2 Student Dashboard
- **Welcome Header**: Display student name, roll/email, department badge, and profile picture avatar.
- **Quick Action Bar**: Prominent `"Submit New Complaint"` primary action button with plus icon.
- **Metrics Summary**: Cards for *Total Complaints*, *Pending*, *In Progress*, and *Resolved*.
- **Recent Complaints List**: Showing recent 3-5 complaints with status badges and quick navigation to details.

### 2.3 Add Complaint Form
- **Form Layout**: Scrollable with `KeyboardAvoidingView` (`behavior={Platform.OS === 'ios' ? 'padding' : undefined}`).
- **Input Fields**:
  - Department / Category selector (prefilled with student department by default).
  - Title (concise, clear).
  - Description (`multiline`, min 4 lines, character counter).
  - Image / Attachment preview area with remove button (`X`).
- **Progressive Submission**: Show spinner (`ActivityIndicator`) and disable submit button while uploading.

### 2.4 My Complaints & Complaint Details
- **Complaint Card**:
  - Title, category tag, creation date/time relative formatting.
  - Distinct colored status chip (`PENDING`, `IN_PROGRESS`, `RESOLVED`, `REJECTED`).
  - Active press feedback with `activeOpacity={0.7}`.
- **Detail Screen**:
  - Status progression stepper (Submitted → In Review → Resolved).
  - Attached complaint photo with tap-to-view/zoom.
  - Official Admin resolution notes / feedback container when status changes.

---

## 3. Admin Screens Architecture

### 3.1 Admin Dashboard
- **Executive Metric Cards**: Total complaints count, pending triage count, resolved percentage, department breakdown.
- **Quick Filters**: One-tap filter pills (`All`, `Pending`, `In Progress`, `Resolved`, `High Priority`).
- **Recent Activity Feed**: Real-time list of newly filed student grievances.

### 3.2 Complaint Management & List
- **Search & Filter Controls**:
  - Instant text search across student name, roll number, complaint title.
  - Filter modal or bottom sheet for department, category, and date range.
- **Density & Readability**: Compact card layout displaying student details, complaint excerpt, submission timestamp, and current status.

### 3.3 Complaint Details & Action Panel
- **Student Profile Snapshot**: Student name, college email, department, division.
- **Evidence Inspection**: Display attached photos with full resolution preview.
- **Status Update Workflow**:
  - Status dropdown/segmented control (`PENDING`, `IN_PROGRESS`, `RESOLVED`, `REJECTED`).
  - Mandatory admin response/remarks field when resolving or rejecting.
  - Confirmation prompt (`Alert.alert`) before submitting status change.

---

## 4. Core UX Principles

### 4.1 State Management & Feedback
Every asynchronous view must handle 4 states:
1. **Loading State**: Centered `ActivityIndicator` with `#007AFF` and optional status text (`"Loading complaints..."`).
2. **Empty State**: Friendly icon (e.g. `document-text-outline`), title (`"No Complaints Found"`), supportive description, and refresh/action button.
3. **Success State**: Native `Alert` or toast confirming successful save, redirecting or updating local list state.
4. **Error / Failure State**: Clear error message explaining what failed, with a `"Try Again"` button.

### 4.2 Form UX & Validation
- Never submit empty required fields; validate inline before triggering API requests.
- Disable submit buttons and display `ActivityIndicator` during network requests to prevent duplicate submissions.
- Always dismiss keyboard on submit or background tap using `Keyboard.dismiss()`.

### 4.3 Accessibility & Touch Targets
- Minimum touch target: `44x44 dp` for buttons, back arrows, and icon toggles.
- Contrast ratio: High contrast white text (`#FFFFFF`) on dark cards (`#1B1B21`), muted text (`#8D8D98` or lighter) for readability.
- Clear active opacities on `TouchableOpacity` (use `activeOpacity={0.75}`).

### 4.4 Web & Mobile Responsiveness
- Handle both mobile screens and browser viewport widths (refer to `frontend/constants/responsive.ts`).
- Keep maximum card content widths (e.g. `maxWidth: 600` centered) on wide desktop screens to prevent overstretched forms.

---

## 5. Expo React Native Implementation Rules

### 5.1 Existing Stack & Component Reuse
- **React Native Core**: Use `View`, `Text`, `TextInput`, `TouchableOpacity`, `ScrollView`, `FlatList`, `ActivityIndicator`, `KeyboardAvoidingView`, `Platform`, `Alert`.
- **Existing Libraries**:
  - Navigation: `expo-router` (`router.push`, `router.replace`, `router.back`, `useLocalSearchParams`).
  - Dropdowns: `react-native-element-dropdown`.
  - Media: `expo-image-picker`, `expo-image`.
  - Icons: `@expo/vector-icons`.
  - Storage: `@react-native-async-storage/async-storage` via `@/utils/authStorage`.
  - API Client: `@/constants/api` (`apiFetch`, `API_BASE_URL`).
- **No Unapproved Dependencies**: Do not introduce heavy UI kits (NativeWind, Tailwind, Tamagui, Paper) unless explicitly requested; use standard `StyleSheet.create`.

### 5.2 Navigation Conventions
- Use standard Expo Router file-based routing:
  - Student: `app/login.tsx`, `app/register.tsx`, `app/dashboard.tsx`, `app/addComplaint.tsx`, `app/myComplaints.tsx`, `app/profile.tsx`.
  - Admin: `app/admin/dashboard.tsx`, `app/admin/complaints.tsx`, `app/admin/complaintDetails.tsx`.
- Consistent top navigation header:
  - Back button with `router.back()`
  - Center title (`fontSize: 18`, `fontWeight: '700'`)
  - Right spacer (`width: 42`) for balanced centering

### 5.3 Web vs Native Compatibility
- Never use web-only elements (`<div>`, `<span>`, `<input>`, `<button>`) in React Native `.tsx` files.
- Protect web-specific APIs (`window`, `localStorage`) behind `Platform.OS === 'web'`.

---

## 6. Project Safety & Non-Negotiables

1. **Backend & API Safety**:
   - Do **NOT** modify Spring Boot controller endpoints, entity models, database tables, or DTO contracts merely to tweak visual presentation.
   - Respect backend response shapes (`ComplaintResponse`, `UserResponse`, `RegisterRequest`).
2. **Authentication & Authorization**:
   - Preserve JWT storage and headers in `@/constants/api` and `@/utils/authStorage`.
   - Preserve role-based guard logic (`ROLE_STUDENT` vs `ROLE_ADMIN`).
3. **No Fake Data / No Mockups**:
   - Never replace working dynamic API fetches with hardcoded fake complaint lists or fake metric numbers.
4. **Targeted Refactoring**:
   - Make clean, surgical edits to stylesheets, layout containers, and components without rewriting unrelated working logic.

---

## 7. Design Implementation Workflow

When improving or redesigning a screen:

1. **Inspect First**:
   - Read the existing screen file completely to identify its state, API integrations, and handlers.
2. **Identify Usability Issues**:
   - Check touch targets, layout consistency, form validation, and feedback states.
3. **Apply Tokens & Styles**:
   - Ensure color hexes, typography, card containers, and button states match Section 1 design tokens.
4. **Preserve Business Logic**:
   - Keep all `fetch`/`apiFetch` calls, form data preparation, image upload handling, and navigation untouched.
5. **Verify Changes**:
   - Check for TypeScript syntax and diagnostics (`tsc`).
   - Verify all style keys referenced in JSX are defined in `StyleSheet.create`.
6. **Report**:
   - Summarize the UI/UX enhancements made, files updated, and verification results.
