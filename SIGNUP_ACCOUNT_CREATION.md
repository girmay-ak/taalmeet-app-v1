# Signup & Account Creation - Implementation Details

This document details all the signup and account creation features implemented in the TAALMEET app.

---

## 📱 Signup Flow Overview

The signup process is a **multi-step wizard** that collects user information progressively, creating the account only at the final step. The flow consists of:

1. **Onboarding Screens** - Welcome/intro screens
2. **Step 1: Account Creation** - Name, email, password
3. **Step 2: Language Selection** - Learning and teaching languages
4. **Step 3: Location Setup** - City and country
5. **Step 4: Profile Completion** - Bio, interests, avatar
6. **Success Screen** - Confirmation and navigation

---

## 🎯 Components Structure

### Main Components

#### 1. `SignupFlow.tsx` - Main Orchestrator
**Location:** `components/signup/SignupFlow.tsx`

**Purpose:** Orchestrates the entire multi-step signup process.

**Features:**
- Manages current step state
- Collects data from each step
- Stores collected data in state
- Triggers account creation only at Step 4 completion
- Uses `useFullSignUp` hook for final submission

**Data Flow:**
- Step 1 → Stores: `name`, `email`, `password`
- Step 2 → Stores: `learning` languages array, `teaching` language with level
- Step 3 → Stores: `city`, `country`
- Step 4 → Collects `bio`, `interests`, `avatar` → **SUBMITS ALL DATA**

**State Management:**
```typescript
interface SignupData {
  // Step 1
  name?: string;
  email?: string;
  password?: string;
  // Step 2
  learning?: Language[];
  teaching?: TeachingLanguage;
  // Step 3
  city?: string;
  country?: string;
  // Step 4
  bio?: string;
  interests?: string[];
  avatar?: string;
}
```

---

#### 2. `OnboardingScreens.tsx` - Welcome Screens
**Location:** `components/signup/OnboardingScreens.tsx`

**Purpose:** Introduces the app to new users.

**Features:**
- Multiple onboarding slides
- Skip option
- Welcome messaging
- App introduction

**Navigation:**
- On complete → Goes to Step 1
- On skip → Goes to Step 1

---

#### 3. `SignupStep1.tsx` - Account Creation
**Location:** `components/signup/SignupStep1.tsx`

**Purpose:** Collects basic account information.

**Fields Collected:**
- **Full Name** (required)
  - Text input with validation
  - Auto-capitalize words
  - Person icon

- **Email** (required)
  - Email keyboard type
  - Auto-complete support
  - Email validation
  - Mail icon

- **Password** (required)
  - Secure text entry (toggle visibility)
  - Password strength indicator
  - Real-time strength calculation
  - Strength levels: Weak, Fair, Good, Strong
  - Visual strength bar with color coding
  - Password requirements checklist:
    - ✅ 8+ characters
    - ✅ 1 uppercase letter
    - ✅ 1 number

- **Confirm Password** (required)
  - Must match password
  - Visual error state if mismatch
  - Toggle visibility option

**Validation:**
- Name must not be empty
- Email format validation
- Password minimum 8 characters
- Passwords must match
- Button disabled until all validations pass

**UI Features:**
- Step indicator (1/4)
- Back button (returns to login)
- Close button
- Dark mode support
- Keyboard avoiding view
- Scroll view for small screens
- "Already have an account? Log In" link

**Password Strength Algorithm:**
```typescript
// Strength calculation:
- 8+ characters: +25%
- Uppercase + Lowercase: +25%
- Contains number: +25%
- Special character: +25%
```

---

#### 4. `SignupStep2.tsx` - Language Selection
**Location:** `components/signup/SignupStep2.tsx`

**Purpose:** Collects language preferences for learning and teaching.

**Features:**

**Learning Languages:**
- Multi-select language picker
- Search/filter languages
- Visual language cards with flags
- Selected languages highlighted
- Can select multiple languages

**Teaching Language:**
- Single language selection
- Proficiency level selection:
  - Native
  - Advanced (C1-C2)
  - Intermediate (B1-B2)
  - Beginner (A1-A2)
- Visual level indicators with colors

**Supported Languages:**
- English 🇬🇧
- Dutch 🇳🇱
- German 🇩🇪
- French 🇫🇷
- Spanish 🇪🇸
- Italian 🇮🇹
- Portuguese 🇵🇹
- Japanese 🇯🇵
- Korean 🇰🇷
- Chinese 🇨🇳
- Arabic 🇸🇦
- Russian 🇷🇺

**Validation:**
- At least one learning language required
- One teaching language with level required
- Button disabled until both selected

**UI Features:**
- Step indicator (2/4)
- Back button (returns to Step 1)
- Search bar for language filtering
- Language cards with flags and names
- Level selector with color-coded badges

---

#### 5. `SignupStep3.tsx` - Location Setup
**Location:** `components/signup/SignupStep3.tsx`

**Purpose:** Collects user location information.

**Features:**

**City Input:**
- Text input for city name
- Auto-complete suggestions (if available)
- Location icon

**Country Selection:**
- Dropdown/picker for country
- Country flags displayed
- Pre-populated countries:
  - Netherlands 🇳🇱
  - Belgium 🇧🇪
  - Germany 🇩🇪
  - France 🇫🇷
  - Spain 🇪🇸
  - United Kingdom 🇬🇧
  - United States 🇺🇸
  - Italy 🇮🇹

**GPS Auto-Detection:**
- "Use GPS" button
- Requests location permission
- Automatically fills city and country
- Uses Expo Location API
- Reverse geocoding for address
- Error handling if permission denied

**Validation:**
- City must not be empty
- Country must be selected
- Button disabled until both provided

**UI Features:**
- Step indicator (3/4)
- Back button (returns to Step 2)
- GPS button with loading state
- Permission handling
- Error messages for location errors

---

#### 6. `SignupStep4.tsx` - Profile Completion
**Location:** `components/signup/SignupStep4.tsx`

**Purpose:** Final profile details before account creation.

**Features:**

**Bio:**
- Multi-line text input
- Character counter (max 150 characters)
- Placeholder text
- Real-time character count display

**Interests:**
- Multi-select from predefined interests
- Visual interest chips/badges
- Maximum 8 interests
- Tap to select/deselect
- Predefined interests include:
  - ☕ Coffee
  - 🎵 Music
  - ✈️ Travel
  - 🎨 Art
  - 📚 Books
  - 🍕 Food
  - ⚽ Sports
  - 🎮 Gaming
  - 🎬 Movies
  - 📸 Photography
  - 🏃 Fitness
  - 🧘 Yoga
  - 🍷 Wine
  - 🎭 Theater
  - 🌿 Nature
  - 💻 Technology

**Avatar Upload:**
- Optional profile picture
- Image picker integration
- Camera roll access
- Image cropping (1:1 aspect ratio)
- Preview of selected image
- Image quality optimization (0.8)
- Permission handling

**Terms & Conditions:**
- Checkbox to agree to terms
- Required to proceed
- Link to terms (if implemented)

**Validation:**
- Bio required (not empty)
- At least one interest required
- Terms agreement required
- Avatar optional

**UI Features:**
- Step indicator (4/4)
- Back button (returns to Step 3)
- Character counter for bio
- Interest chips with selection state
- Avatar preview
- Image picker button
- Loading state during submission
- Submit button disabled during submission

---

#### 7. `SuccessScreen.tsx` - Completion Screen
**Location:** `components/signup/SuccessScreen.tsx`

**Purpose:** Confirms successful account creation.

**Features:**
- Success message
- Celebration animation/icon
- Welcome message
- "Get Started" button
- Navigation to main app

**Navigation:**
- On complete → Navigates to `/(tabs)` (main app)

---

## 🔧 Backend Implementation

### Service Layer

#### `authService.ts` - Authentication Service
**Location:** `services/authService.ts`

**Signup Function:**
```typescript
signUp(email: string, password: string, fullName: string): Promise<SignUpResponse>
```

**Features:**
- Creates Supabase auth user
- Stores full name in user metadata
- Returns user and session
- Checks for email verification requirement
- Error handling:
  - UserAlreadyExistsError
  - ValidationError
  - AuthError

**Email Check Function:**
```typescript
checkEmailExists(email: string): Promise<boolean>
```
- Checks if email is already registered
- Best-effort check (Supabase also validates on signup)

**Other Auth Functions:**
- `signIn()` - Sign in with email/password
- `signOut()` - Sign out current user
- `getSession()` - Get current session
- `getCurrentUser()` - Get current authenticated user
- `sendPasswordResetEmail()` - Password reset
- `resendVerificationEmail()` - Resend verification email
- `deleteAccount()` - Delete user account

---

### Profile Service

#### `profileService.ts` - Profile Management
**Location:** `services/profileService.ts`

**Functions Used in Signup:**
- `createProfile()` - Creates user profile in database
- `updateUserLanguages()` - Saves language preferences

**Profile Creation:**
- Stores: displayName, avatarUrl, bio, city, country
- Creates record in `profiles` table
- Links to auth user via userId

**Language Storage:**
- Stores learning languages
- Stores teaching language with proficiency level
- Creates records in `user_languages` table

---

### Storage Service

#### `storageService.ts` - File Storage
**Location:** `services/storageService.ts`

**Functions Used in Signup:**
- `uploadAvatar()` - Uploads profile picture
- Uploads to Supabase Storage
- Returns public URL for avatar
- Handles errors gracefully

---

## 🎣 React Query Hooks

### `useAuth.ts` - Authentication Hooks
**Location:** `hooks/useAuth.ts`

#### `useFullSignUp()` - Complete Signup Mutation

**Purpose:** Handles the complete signup process with all collected data.

**Process:**
1. Creates auth user via `authService.signUp()`
2. Uploads avatar (if provided) via `storageService.uploadAvatar()`
3. Creates profile via `profileService.createProfile()`
4. Saves languages via `profileService.updateUserLanguages()`
5. Invalidates auth queries
6. Handles errors with user-friendly messages

**Input Type:**
```typescript
interface FullSignUpInput {
  name: string;
  email: string;
  password: string;
  learning?: Language[];
  teaching?: TeachingLanguage;
  city?: string;
  country?: string;
  bio?: string;
  interests?: string[];
  avatar?: string; // Local URI
}
```

**Error Handling:**
- Shows alerts for errors
- Special handling for "User already exists" error
- Offers navigation to sign-in if email exists
- Logs errors for debugging

**Success Handling:**
- Invalidates auth queries
- Session becomes available via AuthProvider
- User is automatically signed in (if email verification not required)

---

### Other Auth Hooks

- `useSignIn()` - Sign in mutation
- `useSignOut()` - Sign out mutation
- `useSession()` - Get current session query
- `useCurrentUser()` - Get current user query
- `useForgotPassword()` - Password reset mutation
- `useUpdatePassword()` - Update password mutation
- `useResendVerification()` - Resend verification email
- `useCheckEmail()` - Check email existence
- `useDeleteAccount()` - Delete account mutation

---

## 📝 Validation Schema

### Zod Schemas
**Location:** `utils/validators.ts`

#### `signUpSchema` - Basic Signup
```typescript
{
  email: string (valid email format)
  password: string (min 8 chars, strong password rules)
  name: string (min 2, max 100)
}
```

#### `fullSignupSchema` - Complete Signup
```typescript
{
  // Step 1 - Account
  name: string (min 2, max 100, trimmed)
  email: valid email
  password: strong password (min 8 chars)
  
  // Step 2 - Languages
  learning?: Language[] (optional)
  teaching?: TeachingLanguage (optional)
  
  // Step 3 - Location
  city?: string (optional)
  country?: string (optional)
  
  // Step 4 - Profile
  bio?: string (optional)
  interests?: string[] (max 8, optional)
  avatar?: string (optional)
}
```

---

## 🎨 UI/UX Features

### Design System
- **NativeWind (Tailwind CSS)** - Utility-first styling
- **Dark Mode Support** - Full dark mode implementation
- **Theme Provider** - Centralized theme management
- **Responsive Design** - Works on all screen sizes

### User Experience
- **Progressive Disclosure** - Collects info step by step
- **Visual Feedback** - Loading states, success indicators
- **Error Handling** - Clear error messages
- **Validation** - Real-time validation feedback
- **Keyboard Handling** - KeyboardAvoidingView for inputs
- **Scroll Support** - ScrollView for small screens
- **Step Indicators** - Shows progress (1/4, 2/4, etc.)
- **Back Navigation** - Can go back to previous steps
- **Skip Options** - Can skip onboarding

### Accessibility
- Proper labels for inputs
- Icon indicators
- Color contrast
- Touch target sizes
- Clear error states

---

## 🔐 Security Features

### Password Security
- Minimum 8 characters
- Strength requirements:
  - Uppercase and lowercase letters
  - Numbers
  - Special characters (recommended)
- Password strength indicator
- Secure text entry (masked input)
- Password confirmation

### Email Validation
- Format validation
- Duplicate email checking
- Supabase email verification (if enabled)

### Data Validation
- Zod schema validation
- Input sanitization
- Type safety with TypeScript

### Error Handling
- User-friendly error messages
- No sensitive data in errors
- Proper error logging

---

## 📊 Data Flow

### Signup Flow Diagram

```
Onboarding Screens
      ↓
   Step 1: Account Info
   (name, email, password)
      ↓
   Step 2: Languages
   (learning, teaching + level)
      ↓
   Step 3: Location
   (city, country)
      ↓
   Step 4: Profile
   (bio, interests, avatar)
      ↓
   useFullSignUp() Hook
      ↓
   ┌─────────────────────┐
   │ 1. authService.signUp() │ → Creates auth user
   │ 2. storageService.uploadAvatar() │ → Uploads avatar (if provided)
   │ 3. profileService.createProfile() │ → Creates profile
   │ 4. profileService.updateUserLanguages() │ → Saves languages
   └─────────────────────┘
      ↓
   Success Screen
      ↓
   Navigate to /(tabs)
```

### State Management

**Local State (SignupFlow):**
- Current step
- Collected signup data

**React Query:**
- Auth session
- User data
- Query invalidation on success

**Supabase:**
- Auth user
- Profile data
- Languages
- Avatar storage

---

## 🚀 Navigation

### Screen Route
**Location:** `app/(auth)/sign-up.tsx`

```typescript
<SignupFlow
  onComplete={() => router.replace('/(tabs)')}
  onBackToLogin={() => router.back()}
/>
```

### Navigation Flow
- **Sign In Screen** → Sign Up button → Sign Up Screen
- **Sign Up Screen** → Step 1 → Step 2 → Step 3 → Step 4 → Success → Main App
- **Back Navigation** → Previous step or Sign In

---

## ✅ Features Summary

### Implemented Features

✅ **Multi-step signup wizard**
- 4 data collection steps
- Onboarding screens
- Success screen

✅ **Account Creation (Step 1)**
- Name input
- Email input with validation
- Password with strength indicator
- Password confirmation
- Real-time validation

✅ **Language Selection (Step 2)**
- Multiple learning languages
- Single teaching language
- Proficiency level selection
- Language search/filter

✅ **Location Setup (Step 3)**
- City input
- Country selection
- GPS auto-detection
- Location permissions

✅ **Profile Completion (Step 4)**
- Bio with character counter
- Interest selection (up to 8)
- Avatar upload
- Terms agreement

✅ **Backend Integration**
- Auth user creation
- Profile creation
- Language storage
- Avatar upload
- Error handling

✅ **UX Features**
- Dark mode support
- Loading states
- Error messages
- Step indicators
- Back navigation
- Validation feedback

✅ **Security**
- Password strength requirements
- Email validation
- Data validation with Zod
- Secure password storage

---

## 📝 Notes

1. **Account Creation Timing:** The account is only created at the END of Step 4, after all data is collected. Data from previous steps is stored in component state.

2. **Avatar Upload:** Avatar upload is optional. If it fails, signup continues without avatar.

3. **Email Verification:** If email verification is required by Supabase, the user will need to verify their email before they can sign in.

4. **Error Recovery:** Users can go back to previous steps if they need to correct information.

5. **Data Persistence:** Data is only saved to the database after Step 4 submission. If the user closes the app before completing Step 4, no account is created.

6. **Validation:** Each step has its own validation rules. The submit button is disabled until all required fields are valid.

---

## 🔄 Future Enhancements (Not Yet Implemented)

- [ ] Social signup (Google, Apple)
- [ ] Email verification screen
- [ ] Phone number verification
- [ ] Profile picture from camera
- [ ] More languages support
- [ ] Location autocomplete with map
- [ ] Interest suggestions based on profile
- [ ] Profile preview before submission
- [ ] Save progress (draft signup)

---

This implementation provides a complete, production-ready signup and account creation flow with proper validation, error handling, and user experience considerations.

