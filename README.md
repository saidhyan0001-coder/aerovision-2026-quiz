# AeroVision 2026 Quiz

IEEE Robotics & Automation Society — JSSATEB

## Frontend

The quiz is a static browser application in `index.html`.

## Backend

This repository now includes Vercel Serverless Functions:

- `GET /api/health` — API health check
- `POST /api/submit` — validates a participant submission and calculates the official score from the server-side answer key

### Submit format

```json
{
  "participant": {
    "name": "Participant Name",
    "college": "College Name",
    "branch": "Robotics & Automation",
    "year": "3rd Year"
  },
  "answers": [1, 1, 1, 2, 1, 1, 1, 0, 0, 2, 2, 2, 1, 2, 0, 1, 1, 1, 2, 1]
}
```

Each answer is an option index: `0=A`, `1=B`, `2=C`, `3=D`.

The API returns the server-calculated score, percentage, badge and per-question correctness.

## Deploy

Import this GitHub repository into Vercel. No build command is required for the static frontend and API functions.

After deployment:

- `https://YOUR-DOMAIN.vercel.app/`
- `https://YOUR-DOMAIN.vercel.app/api/health`

## Important

The current API calculates and returns results but does not persist participant submissions to a database. Database persistence can be added later using Vercel Postgres, Neon, Supabase, or another database.
