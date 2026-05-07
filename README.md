# 🎓 QuizVibe

**A full-stack competitive quiz platform with real-time PvP duels, live tournaments, and AI-powered question generation.**

---

## 📖 About

QuizVibe is a modern, full-stack quiz platform that transforms traditional learning into a competitive experience. Players can challenge their knowledge through solo quizzes, go head-to-head in real-time PvP duels across three distinct battle modes, and compete in structured tournaments with live bracket tracking — all powered by an AI question engine and backed by Supabase Realtime for instant synchronization.

---

## ✨ Features

### 🧠 Solo Quiz Engine

- Timed quiz sessions with configurable **category**, **difficulty**, and **question count**
- Real-time progress bar and per-question feedback with explanations
- Automatic score calculation and results summary

### ⚡ Blitz Round (PvP)

- 60-second infinite question race — answer as many as possible before time runs out
- Live opponent score tracking via Supabase Realtime presence
- Ranked by most correct answers; tiebroken by speed

### 🏹 Category Wars (PvP)

- Each player secretly picks their **strongest category**
- Questions alternate between both players' categories (Q1 = yours, Q2 = theirs, ...)
- **Turf banner** highlights home vs. away questions for strategic tension

### 🏆 Tournament Bracket

- Admin creates 4-player or 8-player single-elimination brackets
- Auto-generates matchups with seeding and creates a duel room per match
- **Live public Tournament Board** with real-time bracket updates via Supabase subscriptions
- Automatic bracket advancement — winners are promoted, losers eliminated, champion crowned

### 🤖 AI Question Generator

- Admin tool powered by **Gemini AI** to generate quiz questions on any topic
- Outputs structured questions with options, correct answer, and explanation
- Supports creating new categories inline during the generation flow

### 📊 Multi-Mode Leaderboard

- **Solo Quiz** — ranked by accuracy then speed, with gold/silver/bronze podium
- **Blitz** — best score (correct answers in 60s) and duel wins
- **Category Wars** — win count and best score per player
- **Tournaments** — championship titles (🏆) and total match wins

### 🛠 Admin Dashboard

- Full **CRUD for questions and categories** with rich management UI
- **Quiz Request system** — users submit topic requests, admins accept/reject and generate questions
- **Tournament management** — create, start, view live bracket, and manually report match winners
- Pending request badge counter in sidebar

### 🔐 Authentication

- Admin-only protected routes via Supabase Auth
- Secure login page with session management

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Vanilla CSS with Material Design tokens |
| Animations | Motion/React (Framer Motion) |
| Database | Supabase (PostgreSQL) |
| Realtime | Supabase Realtime + Presence |
| AI | Google Gemini API |
| Deployment | Vercel |

---

## 👥 Team

| Member | Role |
|---|---|
| **DERBAL Mehdi** | G02 GL |
| **DEKOUNE Abderrahmen** | G01 GL |
| **BOUFEDJI Amine** | G01 GL |

---

## 📁 Repository & Live Demo

🔗 **[https://github.com/abdurrahmen/quiz-vibe](https://github.com/abdurrahmen/quiz-vibe)**
🔗 **[https://quiz-vibe-seven.vercel.app](https://quiz-vibe-seven.vercel.app)**

---
