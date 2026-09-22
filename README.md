# Aero Vision Workshop 2026

React + TypeScript + Vite + Tailwind CSS application for the Aero Vision Workshop 2026 post-workshop quiz and feedback flow.

## Run locally

```bash
npm install
npm run dev
```

The app follows this sequence: quiz, quiz result, feedback form, completion screen. A typed submission record is saved to browser `localStorage` under `aero-vision-workshop-submissions`, ready to be replaced with a Firebase or Supabase repository later.

## Certificate template

Add the supplied certificate image as `public/certificate-template.png`. The completion screen will place the participant name over the template's `NAME` area and download a personalized PNG certificate.
