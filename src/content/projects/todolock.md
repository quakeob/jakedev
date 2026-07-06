---
title: "TodoLock"
description: "Minimal iOS to-do list where distracting apps stay shielded until today's tasks are done. Family Controls with real consequences."
status: "In Development"
emoji: "🔒"
tags: ["Swift", "SwiftUI", "SwiftData", "Family Controls"]
order: 5
---

## The Problem

Productivity apps don't make you productive; they let you organize tasks you already wanted to do. Screen-time apps don't make you disciplined; they let you set rules you can override. The combination — tying screen-time consequences to task completion — closes that loop.

## The Approach

One short list a day. Check things off. Apps unlock. Reset overnight.

TodoLock is a sleek, minimal to-do list whose core differentiator is that the apps you choose stay shielded (via Apple's Family Controls) until you make progress on today's tasks. You pick the apps to block, how strict the gate is, and how the unlock works. The discipline is adaptive; the consequence is real.

## Architecture

Five targets sharing one local Swift package:

```
TodoLockApp.xcodeproj
├── TodoLockApp                       (main iOS app)
├── ShieldConfigurationExtension      (renders the custom shield UI)
├── ShieldActionExtension             (handles shield button taps)
├── DeviceActivityMonitorExtension    (background hooks: reset + thresholds)
└── TodoLockWidget                    (home / lock screen widget)

TodoCore/                             (shared Swift package)
├── Models · Storage · Domain · Blocking · Theme
```

The blocking logic lives in `TodoCore/Blocking` as a pure policy — state + event in, action + state delta out — so the gate rules are testable without touching the Family Controls APIs.

## Key Decisions

**Template vs. occurrence.** `TaskItem` is the template the user creates; `TaskOccurrence` is the per-day instance the Today screen shows. A daily-recurring task has to be re-completable each day — storing `completedAt` on the template would freeze it as done forever after one check-off.

**Privacy-first scope.** Single device, no accounts, no CloudKit in v1 — keeps the privacy story clean enough to pass App Store review with the Family Controls entitlement.

**No gamification.** No streaks, no badges. The unlock mechanic is the motivation.

## Stack

- **UI:** SwiftUI, iOS 17+
- **Persistence:** SwiftData (tasks) + App Group UserDefaults (settings, daily state)
- **Screen time:** FamilyControls · ManagedSettings · DeviceActivity
- **Widget:** WidgetKit
- **Path:** Personal use → TestFlight → App Store
