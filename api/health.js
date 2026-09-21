export default function handler(req, res) {
  res.status(200).json({
    ok: true,
    service: "AeroVision 2026 Quiz API",
    version: "1.0.0"
  });
}
