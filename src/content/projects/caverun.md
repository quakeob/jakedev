---
title: "CaveRun"
description: "Playable Unity roguelike survival prototype — auto-attacking weapons, scaling enemy waves, XP and level-ups. The entire arena is built at runtime by a single setup script."
status: "Prototype"
emoji: "🕹️"
tags: ["Unity", "C#", "Game Dev"]
order: 9
---

## The Problem

I wanted to know if I could build a Vampire Survivors-style game loop — auto-attacking player, swelling enemy hordes, XP-driven level-ups — from scratch in Unity, without a template.

## The Approach

A fully playable roguelike survival prototype with every core system implemented. The distinctive part: `GameSetup.cs` creates the entire game at runtime — the 100×100 arena, the player with all components, every system, the camera. No manual scene setup at all.

## Systems

**Player.** WASD physics-based movement, health with regeneration (0.5 HP/sec), armor, XP tracking and leveling, and an auto-attack weapon that targets the nearest enemy within a 30-unit range — with support for multiple projectiles in a spread pattern and crits.

**Enemies.** Chase-the-player AI, attacks in range, red flash on hit, XP gem drops on death. The spawner starts at 2 enemies/second and scales difficulty +50% per minute, with enemy stats scaling alongside and a 100-enemy performance cap.

**Combat.** Trigger-collision projectiles with a 5-second lifetime and piercing support wired in for future upgrades.

## Stack

- **Engine:** Unity
- **Language:** C#
- **Scope:** Prototype — complete core loop, playable start to death screen
