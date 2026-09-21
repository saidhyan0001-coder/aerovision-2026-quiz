// Vercel Serverless Function
// Accepts a completed AeroVision 2026 quiz submission and calculates the score
// on the server so the result is not dependent on client-side scoring.

const ANSWER_KEY = [
  1, 1, 1, 2, 1,
  1, 1, 0, 0, 2,
  2, 2, 1, 2, 0,
  1, 1, 1, 2, 1
];

function json(res, status, body) {
  res.status(status).setHeader("Content-Type", "application/json").json(body);
}

export default function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return json(res, 405, { ok: false, error: "Method not allowed" });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;

    if (!body || typeof body !== "object") {
      return json(res, 400, { ok: false, error: "Invalid request body" });
    }

    const participant = body.participant || {};
    const answers = body.answers;

    if (!participant.name || !participant.college) {
      return json(res, 400, {
        ok: false,
        error: "Participant name and college are required"
      });
    }

    if (!Array.isArray(answers) || answers.length !== ANSWER_KEY.length) {
      return json(res, 400, {
        ok: false,
        error: "Exactly 20 answers are required"
      });
    }

    const validAnswers = answers.every(
      (answer) => Number.isInteger(answer) && answer >= 0 && answer <= 3
    );

    if (!validAnswers) {
      return json(res, 400, {
        ok: false,
        error: "Each answer must be an option index from 0 to 3"
      });
    }

    let correct = 0;
    const results = answers.map((answer, index) => {
      const isCorrect = answer === ANSWER_KEY[index];
      if (isCorrect) correct += 1;

      return {
        question: index + 1,
        selected: answer,
        correct: ANSWER_KEY[index],
        isCorrect
      };
    });

    const score = correct * 10;
    const percentage = Math.round((correct / ANSWER_KEY.length) * 100);

    let badge = "Drone Rookie";
    if (percentage >= 90) badge = "AeroVision Expert";
    else if (percentage >= 80) badge = "Mission Ready";
    else if (percentage >= 60) badge = "Flight Trainee";
    else if (percentage >= 40) badge = "Drone Learner";

    return json(res, 200, {
      ok: true,
      participant: {
        name: String(participant.name).slice(0, 60),
        college: String(participant.college).slice(0, 100),
        branch: String(participant.branch || "").slice(0, 80),
        year: String(participant.year || "").slice(0, 40)
      },
      totalQuestions: ANSWER_KEY.length,
      correct,
      incorrect: ANSWER_KEY.length - correct,
      score,
      maxScore: ANSWER_KEY.length * 10,
      percentage,
      badge,
      results
    });
  } catch (error) {
    return json(res, 400, {
      ok: false,
      error: "Could not process quiz submission"
    });
  }
}
