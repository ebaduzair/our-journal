

# Implementation Plan: Features 3, 4, and 5

This plan covers three new features to enhance relationship engagement and self-reflection:
- **Weekly Check-ins & Gratitude** - Relationship health prompts and daily gratitude
- **Love Language Quiz** - Discover your love languages with personalized insights
- **Relationship Stats Dashboard** - Visualize your relationship activity

---

## Feature Overview

### Feature 3: Weekly Check-ins & Gratitude
A dedicated space for relationship reflection with weekly prompts and daily gratitude entries.

**What you'll get:**
- Weekly relationship check-in with 5 guided questions
- Quick daily gratitude entries (1-minute logs)
- Mood tracking with cute emoji indicators
- History view showing patterns over time

### Feature 4: Love Language Quiz
An interactive quiz to discover your and your partner's love languages.

**What you'll get:**
- 15-question quiz for each partner
- Visual results showing love language rankings
- Personalized tips based on each person's primary language
- Ability to retake the quiz over time

### Feature 5: Relationship Stats Dashboard
A visual summary of your relationship activity and milestones.

**What you'll get:**
- Charts showing notes sent, challenges completed, and reasons added over time
- Milestone counters (days together, total hearts given, streaks)
- Monthly activity summary
- "Relationship Health Score" based on engagement

---

## Implementation Steps

### Step 1: Add New Types

Add to `src/types/index.ts`:

```text
// Weekly Check-ins
CheckInEntry:
  - id: string
  - weekString: string (ISO week like "2025-W05")
  - createdAt: Date
  - responses: object with questions and answers
  - overallMood: 1-5 rating

// Gratitude Entries
GratitudeEntry:
  - id: string
  - content: string
  - mood: emoji string
  - createdAt: Date
  - author: 'me' | 'partner'

// Love Language Quiz
LoveLanguageResult:
  - person: 'me' | 'partner'
  - scores: object with each language score
  - primaryLanguage: string
  - completedAt: Date
```

---

### Step 2: Create Weekly Check-ins & Gratitude Page

**New file:** `src/pages/CheckIns.tsx`

**Sections:**
1. **Weekly Check-in Card** - Shows if check-in is completed for the week, prompts to do it if not
2. **Gratitude Quick-Add** - Simple input to log daily gratitude with mood emoji picker
3. **Recent Gratitude Entries** - Scrollable list of recent entries
4. **Check-in History** - Collapsible section showing past weekly check-ins

**Check-in Questions (weekly rotation):**
- How connected did you feel this week? (1-5)
- What's one thing your partner did that made you happy?
- Is there anything unresolved between you?
- What are you grateful for in your relationship this week?
- What's one thing you'd like to do together next week?

**Mood Options:** Happy, Loved, Grateful, Calm, Tired, Stressed

---

### Step 3: Create Love Language Quiz Page

**New file:** `src/pages/LoveLanguageQuiz.tsx`

**Five Love Languages:**
1. Words of Affirmation
2. Acts of Service
3. Receiving Gifts
4. Quality Time
5. Physical Touch

**Quiz Flow:**
1. Select who is taking the quiz (Me or Partner)
2. Answer 15 scenario-based questions (each maps to a love language)
3. Calculate scores and show results with bar chart
4. Display primary language with description and tips
5. Save results to local storage

**Results Display:**
- Bar chart showing all 5 languages ranked
- Primary language highlighted with description
- Tips for how partner can show love in that language
- Option to retake quiz

---

### Step 4: Create Relationship Stats Dashboard Page

**New file:** `src/pages/Stats.tsx`

**Dashboard Sections:**

1. **Hero Stats Card:**
   - Days together (calculated from first event or custom start date)
   - Total love notes written
   - Challenge streak
   - Total hearts given across all content

2. **Activity Chart:**
   - Line/bar chart using Recharts (already installed)
   - Shows notes, reasons, and challenges completed by month
   - Last 6 months of data

3. **Quick Stats Grid:**
   - Most active day
   - Favorite challenge category
   - Average challenge rating
   - Love language compatibility (if quiz taken)

4. **Relationship Score:**
   - Fun gamified score based on:
     - Weekly check-in completion
     - Challenge streak
     - Regular note/reason adding
     - Gratitude entries

---

### Step 5: Add Quiz Question Data

**New file:** `src/data/loveLanguageQuiz.ts`

Contains 15 quiz questions, each offering two choices that map to different love languages. Example:

```text
Question: When you're feeling down, you'd prefer your partner to...
A) Give you a long hug (Physical Touch)
B) Tell you how much they love you (Words of Affirmation)
```

---

### Step 6: Update Routing and Navigation

**Update `src/App.tsx`:**
- Add routes for `/check-ins`, `/love-quiz`, and `/stats`

**Update Home Page (`src/pages/Index.tsx`):**
- Add quick-access cards for new features
- Show relationship score widget
- Show love language compatibility if available

---

## Navigation Access

Since bottom nav is full, new features will be accessed via:
- **Home page quick actions** - Cards linking to each feature
- **Stats accessible from** - Home page hero section
- **Check-ins reminder** - Notification-style card on home if weekly check-in is due
- **Quiz accessed from** - A "Discover" section on home or via the Love section

---

## File Summary

| File | Action |
|------|--------|
| `src/types/index.ts` | Add CheckInEntry, GratitudeEntry, LoveLanguageResult types |
| `src/data/loveLanguageQuiz.ts` | Create quiz questions database |
| `src/pages/CheckIns.tsx` | Create weekly check-ins and gratitude page |
| `src/pages/LoveLanguageQuiz.tsx` | Create love language quiz page |
| `src/pages/Stats.tsx` | Create relationship stats dashboard |
| `src/App.tsx` | Add three new routes |
| `src/pages/Index.tsx` | Add quick-access cards for new features |

---

## Technical Notes

- All data persisted with `useLocalStorage` hook (no backend needed)
- Charts built with Recharts (already in dependencies)
- Animations with Framer Motion for quiz transitions and score reveals
- Follows existing romantic theme: gradients, rounded corners, soft shadows
- Mobile-first responsive design matching existing pages

---

## Implementation Order

1. **Types first** - Add all new interfaces
2. **Quiz data** - Create love language questions
3. **Check-ins page** - Weekly prompts + gratitude
4. **Love Language Quiz** - Interactive quiz with results
5. **Stats Dashboard** - Charts and metrics
6. **Home page integration** - Add access cards

