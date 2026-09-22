import { useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { ArrowLeft, ArrowRight, Award, Check, ChevronRight, CircleHelp, Download, Gauge, Headphones, LockKeyhole, Plane, RotateCcw, Send, ShieldCheck, Sparkles, Star, Target, Trophy, Users, Wifi, X } from 'lucide-react';
import { defaultFeedback, defaultParticipant, questions, type Feedback, type ParticipantDetails, type Submission } from './data';

type Phase = 'workshop' | 'quiz' | 'result' | 'feedback' | 'complete';
const STORAGE_KEY = 'aero-vision-workshop-submissions';
const OWNER_CODE = 'AERO-OWNER';

function loadSubmissions(): Submission[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') as Submission[]; } catch { return []; }
}

function downloadCertificate(participantName: string) {
  const image = new Image();
  image.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    const context = canvas.getContext('2d');
    if (!context) return;
    context.drawImage(image, 0, 0);
    const scale = canvas.width / 1264;
    const nameAreaX = Math.round(320 * scale);
    const nameAreaY = Math.round(500 * scale);
    const nameAreaWidth = Math.round(625 * scale);
    const nameAreaHeight = Math.round(78 * scale);
    context.fillStyle = '#f8f5ee';
    context.fillRect(nameAreaX, nameAreaY, nameAreaWidth, nameAreaHeight);
    context.strokeStyle = '#243754';
    context.lineWidth = Math.max(1, Math.round(2 * scale));
    context.beginPath();
    context.moveTo(Math.round(360 * scale), Math.round(575 * scale));
    context.lineTo(Math.round(920 * scale), Math.round(575 * scale));
    context.stroke();
    context.fillStyle = '#132b4f';
    let fontSize = Math.round(46 * scale);
    context.font = `600 ${fontSize}px Georgia, serif`;
    while (context.measureText(participantName.toUpperCase()).width > Math.round(560 * scale) && fontSize > 24) {
      fontSize -= 1;
      context.font = `600 ${fontSize}px Georgia, serif`;
    }
    context.textAlign = 'center';
    context.fillText(participantName.toUpperCase(), canvas.width / 2, Math.round(canvas.height * 0.665));
    const link = document.createElement('a');
    link.download = `${participantName.replace(/\s+/g, '-').toLowerCase()}-aero-vision-certificate.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };
  image.onerror = () => window.alert('The certificate template could not be loaded.');
  image.src = '/certificate-template.jpeg';
}

function App() {
  const [phase, setPhase] = useState<Phase>('workshop');
  const [participant, setParticipant] = useState<ParticipantDetails>(defaultParticipant);
  const [answers, setAnswers] = useState<number[]>(Array(questions.length).fill(-1));
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<Feedback>(defaultFeedback);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [quizError, setQuizError] = useState('');
  const [feedbackError, setFeedbackError] = useState('');
  const [dashboardOpen, setDashboardOpen] = useState(() => new URLSearchParams(window.location.search).get('dashboard') === '1');
  const [dashboardUnlocked, setDashboardUnlocked] = useState(false);
  const [ownerCode, setOwnerCode] = useState('');

  const percentage = Math.round((score / questions.length) * 100);
  const updateParticipant = (field: keyof ParticipantDetails, value: string) => setParticipant((current) => ({ ...current, [field]: value }));
  const updateFeedback = <K extends keyof Feedback>(field: K, value: Feedback[K]) => setFeedback((current) => ({ ...current, [field]: value }));

  const startQuiz = () => {
    if (!participant.fullName.trim()) { setQuizError('Enter your name before starting the quiz.'); return; }
    setQuizError(''); setPhase('quiz');
  };
  const chooseAnswer = (answer: number) => {
    setAnswers((current) => current.map((value, index) => index === currentQuestion ? answer : value));
    setQuizError('');
  };
  const submitQuiz = () => {
    if (answers.some((answer) => answer < 0)) { setQuizError('Answer every question before submitting the quiz.'); return; }
    const total = answers.reduce((sum, answer, index) => sum + (answer === questions[index].answer ? 1 : 0), 0);
    setScore(total); setPhase('result'); setQuizError('');
  };
  const startOver = () => {
    setPhase('workshop'); setParticipant(defaultParticipant); setAnswers(Array(questions.length).fill(-1)); setCurrentQuestion(0); setScore(0); setFeedback(defaultFeedback); setSubmission(null); setQuizError(''); setFeedbackError('');
  };
  const submitFeedback = (event: FormEvent) => {
    event.preventDefault();
    const requiredText = [feedback.usefulPart, feedback.learned, feedback.favoriteSession, feedback.improvement];
    const requiredRatings = [feedback.overall, feedback.technical, feedback.handsOn, feedback.facilitator, feedback.organization, feedback.learning];
    if (!participant.institution || !participant.email || !participant.branch || !participant.year || requiredRatings.some((rating) => rating === 0) || requiredText.some((value) => !value.trim())) {
      setFeedbackError('Complete your participant details, all ratings and every feedback question.'); return;
    }
    const record: Submission = { id: crypto.randomUUID(), participant, answers, score, percentage, feedback, submittedAt: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...loadSubmissions(), record]));
    setSubmission(record); setFeedbackError(''); setPhase('complete');
  };

  return <div className="min-h-screen overflow-hidden bg-[#081321] text-ink">
    <div className="pointer-events-none fixed inset-0 aviation-grid opacity-80" />
    <div className="pointer-events-none fixed left-1/2 top-0 h-px w-1/2 scanline" />
    <div className="relative mx-auto flex min-h-screen w-full max-w-[1240px] flex-col px-5 py-5 sm:px-8 lg:px-10">
      <Header phase={phase} />
      <main className="flex-1 py-8 sm:py-12">{phase === 'workshop' && <Workshop participant={participant} updateParticipant={updateParticipant} error={quizError} onStart={startQuiz} />}{phase === 'quiz' && <Quiz current={currentQuestion} answers={answers} error={quizError} onChoose={chooseAnswer} onPrevious={() => { setCurrentQuestion((value) => Math.max(0, value - 1)); setQuizError(''); }} onNext={() => { if (answers[currentQuestion] < 0) { setQuizError('Choose an answer to continue.'); return; } setCurrentQuestion((value) => Math.min(questions.length - 1, value + 1)); setQuizError(''); }} onSubmit={submitQuiz} />}{phase === 'result' && <Result participant={participant} score={score} percentage={percentage} onContinue={() => setPhase('feedback')} />}{phase === 'feedback' && <FeedbackForm participant={participant} updateParticipant={updateParticipant} feedback={feedback} updateFeedback={updateFeedback} error={feedbackError} onSubmit={submitFeedback} />}{phase === 'complete' && submission && <Completion submission={submission} onViewResult={() => setPhase('result')} onStartOver={startOver} />}</main>
      <Footer />
    </div>
    {dashboardOpen && <Dashboard unlocked={dashboardUnlocked} ownerCode={ownerCode} onCodeChange={setOwnerCode} onUnlock={() => setDashboardUnlocked(ownerCode === OWNER_CODE)} onClose={() => setDashboardOpen(false)} />}
  </div>;
}

function Header({ phase }: { phase: Phase }) {
  const labels: Record<Phase, string> = { workshop: 'Workshop briefing', quiz: 'Knowledge check', result: 'Quiz result', feedback: 'Workshop feedback', complete: 'Submission complete' };
  return <header className="flex items-center justify-between border-b border-line/70 pb-5"><div className="flex items-center gap-3"><div className="grid h-11 w-11 place-items-center rounded-xl border border-sky/60 bg-sky/10 text-sky"><Plane size={22} /></div><div><p className="font-mono text-[10px] uppercase tracking-[.22em] text-sky">Aero Vision Workshop 2026</p><p className="mt-1 text-xs font-semibold text-muted">JSS ATE Bengaluru <span className="mx-1 text-line">/</span> IEEE RAS Student Chapter</p></div></div><div className="flex items-center gap-4"><a href="?dashboard=1" className="inline-flex items-center gap-2 rounded-lg border border-line px-3 py-2 text-[10px] font-bold uppercase tracking-[.12em] text-muted transition hover:border-sky hover:text-ink"><LockKeyhole size={13} /> Feedback dashboard</a><div className="hidden items-center gap-2 sm:flex"><span className="h-2 w-2 rounded-full bg-lime shadow-[0_0_14px_#c4f15b]" /><span className="font-mono text-[10px] uppercase tracking-[.18em] text-muted">{labels[phase]}</span></div></div></header>;
}

function Footer() { return <footer className="flex flex-col gap-2 border-t border-line/70 py-5 text-[10px] uppercase tracking-[.15em] text-muted sm:flex-row sm:items-center sm:justify-between"><span>Department of Robotics &amp; Automation</span><span>In association with IEEE Robotics &amp; Automation Society</span></footer>; }

function Progress({ phase }: { phase: Phase }) {
  const steps = [{ label: 'Quiz', active: ['quiz', 'result'].includes(phase), done: ['result', 'feedback', 'complete'].includes(phase) }, { label: 'Feedback', active: phase === 'feedback', done: phase === 'complete' }, { label: 'Complete', active: phase === 'complete', done: false }];
  return <div className="mb-8 flex max-w-xl items-center gap-2 sm:gap-4">{steps.map((step, index) => <div className="flex flex-1 items-center gap-2" key={step.label}><div className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border text-[11px] font-bold ${step.active || step.done ? 'border-sky bg-sky text-[#081321]' : 'border-line text-muted'}`}>{step.done ? <Check size={14} /> : index + 1}</div><span className={`hidden text-[11px] font-bold uppercase tracking-[.12em] sm:block ${step.active || step.done ? 'text-ink' : 'text-muted'}`}>{step.label}</span>{index < steps.length - 1 && <div className={`h-px flex-1 ${step.done ? 'bg-sky' : 'bg-line'}`} />}</div>)}</div>;
}

function Workshop({ participant, updateParticipant, error, onStart }: { participant: ParticipantDetails; updateParticipant: (field: keyof ParticipantDetails, value: string) => void; error: string; onStart: () => void }) {
  return <section className="float-in grid items-center gap-12 lg:grid-cols-[1.15fr_.85fr]"><div><Progress phase="workshop" /><p className="mb-5 font-mono text-xs uppercase tracking-[.18em] text-sky">Post-workshop mission log / 01</p><h1 className="max-w-3xl text-4xl font-extrabold leading-[1.02] tracking-[-.04em] sm:text-6xl">Take the <span className="text-sky">flight</span> beyond the classroom.</h1><p className="mt-6 max-w-2xl text-base leading-7 text-muted sm:text-lg">Test your understanding of drone systems, sensing, computer vision and autonomous navigation from today&apos;s Aero Vision Workshop.</p><div className="mt-9 max-w-md"><label className="mb-2 block font-mono text-[10px] uppercase tracking-[.16em] text-muted" htmlFor="pilot-name">Participant name</label><input id="pilot-name" value={participant.fullName} onChange={(event) => updateParticipant('fullName', event.target.value)} className="w-full rounded-xl border border-line bg-panel/80 px-4 py-3.5 text-sm text-ink outline-none transition placeholder:text-muted/60 focus:border-sky" placeholder="Enter your full name" />{error && <p className="mt-2 text-xs text-orange">{error}</p>}<button onClick={onStart} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-lime px-5 py-3.5 text-sm font-extrabold text-[#081321] transition hover:bg-[#d4ff73] sm:w-auto">Begin knowledge check <ArrowRight size={17} /></button></div></div><div className="relative rounded-3xl border border-line bg-panel/80 p-6 shadow-2xl shadow-black/20 sm:p-8"><div className="absolute right-6 top-6 font-mono text-[10px] text-sky">AV / 26</div><div className="mb-12 grid h-28 place-items-center rounded-2xl border border-sky/20 bg-[#0a1a2b]"><div className="relative"><Target className="text-sky" size={52} strokeWidth={1.2} /><div className="absolute inset-0 animate-ping rounded-full border border-sky/20" /></div></div><p className="font-mono text-[10px] uppercase tracking-[.18em] text-muted">Mission brief</p><h2 className="mt-3 text-2xl font-extrabold">A sharper view of flight.</h2><div className="mt-6 space-y-4">{[['20', 'Questions', 'One focused question at a time'], ['10', 'Minutes', 'Your pace, your knowledge'], ['01', 'Mission', 'Finish with your workshop feedback']].map(([number, title, copy]) => <div className="flex items-center gap-4 border-t border-line/70 pt-4" key={title}><span className="font-mono text-xl text-lime">{number}</span><div><p className="text-sm font-bold">{title}</p><p className="text-xs text-muted">{copy}</p></div></div>)}</div></div></section>;
}

function Quiz({ current, answers, error, onChoose, onPrevious, onNext, onSubmit }: { current: number; answers: number[]; error: string; onChoose: (answer: number) => void; onPrevious: () => void; onNext: () => void; onSubmit: () => void }) {
  const question = questions[current]; const isLast = current === questions.length - 1; const answered = answers.filter((answer) => answer >= 0).length;
  return <section className="float-in mx-auto max-w-4xl"><Progress phase="quiz" /><div className="mb-5 flex items-end justify-between gap-4"><div><p className="font-mono text-[10px] uppercase tracking-[.18em] text-sky">{question.topic}</p><h1 className="mt-2 text-2xl font-extrabold sm:text-4xl">Question {current + 1} <span className="font-normal text-muted">of {questions.length}</span></h1></div><span className="font-mono text-xs text-muted">{answered.toString().padStart(2, '0')} / {questions.length} answered</span></div><div className="mb-8 h-2 overflow-hidden rounded-full bg-panel"><div className="h-full rounded-full bg-sky transition-all duration-500" style={{ width: `${((current + 1) / questions.length) * 100}%` }} /></div><div className="rounded-3xl border border-line bg-panel/90 p-6 shadow-2xl shadow-black/20 sm:p-10"><div className="flex items-start justify-between gap-4"><CircleHelp className="shrink-0 text-lime" size={24} /><h2 className="max-w-3xl flex-1 text-xl font-bold leading-8 sm:text-2xl">{question.question}</h2><span className="font-mono text-xs text-muted">{String(question.id).padStart(2, '0')}</span></div><div className="mt-8 grid gap-3">{question.options.map((option, index) => <button key={option} onClick={() => onChoose(index)} className={`flex items-center gap-4 rounded-2xl border px-4 py-4 text-left text-sm transition ${answers[current] === index ? 'border-sky bg-sky/10 text-ink' : 'border-line bg-[#0c1b2c] text-muted hover:border-sky/60 hover:text-ink'}`}><span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg border font-mono text-xs ${answers[current] === index ? 'border-sky bg-sky text-[#081321]' : 'border-line text-sky'}`}>{String.fromCharCode(65 + index)}</span><span>{option}</span>{answers[current] === index && <Check className="ml-auto text-lime" size={18} />}</button>)}</div>{error && <p className="mt-5 rounded-lg border border-orange/30 bg-orange/10 px-3 py-2 text-xs text-orange">{error}</p>}<div className="mt-8 flex flex-col-reverse justify-between gap-3 border-t border-line/70 pt-6 sm:flex-row"><button onClick={onPrevious} disabled={current === 0} className="inline-flex items-center justify-center gap-2 rounded-xl border border-line px-5 py-3 text-sm font-bold text-muted transition hover:border-sky hover:text-ink disabled:cursor-not-allowed disabled:opacity-30"><ArrowLeft size={16} /> Previous</button>{isLast ? <button onClick={onSubmit} className="inline-flex items-center justify-center gap-2 rounded-xl bg-lime px-5 py-3 text-sm font-extrabold text-[#081321] transition hover:bg-[#d4ff73]">Submit quiz <Send size={16} /></button> : <button onClick={onNext} className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky px-5 py-3 text-sm font-extrabold text-[#081321] transition hover:bg-[#9be7ff]">Next question <ArrowRight size={16} /></button>}</div></div></section>;
}

function Result({ participant, score, percentage, onContinue }: { participant: ParticipantDetails; score: number; percentage: number; onContinue: () => void }) {
  const message = percentage >= 80 ? 'Excellent systems thinking. You are ready to take your flight knowledge further.' : percentage >= 60 ? 'Strong foundations. A little more practice will make your flight plan even sharper.' : 'Every flight starts with a first lift. Review what you learned and keep exploring.';
  return <section className="float-in mx-auto max-w-3xl"><Progress phase="result" /><div className="rounded-3xl border border-line bg-panel/90 p-7 text-center shadow-2xl shadow-black/20 sm:p-12"><div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl border border-lime/40 bg-lime/10 text-lime"><Trophy size={30} /></div><p className="mt-6 font-mono text-[10px] uppercase tracking-[.18em] text-sky">Flight log processed</p><h1 className="mt-3 text-3xl font-extrabold sm:text-5xl">Quiz Completed!</h1><p className="mt-3 text-muted">Nice work, {participant.fullName}. Here is your mission result.</p><div className="mx-auto mt-9 grid max-w-xl grid-cols-2 divide-x divide-line overflow-hidden rounded-2xl border border-line bg-[#0b1b2c] sm:grid-cols-4 sm:divide-y-0"><Metric label="Score" value={`${score} / ${questions.length}`} accent /><Metric label="Percentage" value={`${percentage}%`} /><Metric label="Correct" value={`${score}`} /><Metric label="Incorrect" value={`${questions.length - score}`} /></div><p className="mx-auto mt-7 max-w-xl text-sm leading-6 text-muted">{message}</p><button onClick={onContinue} className="mt-8 inline-flex items-center gap-2 rounded-xl bg-lime px-6 py-3.5 text-sm font-extrabold text-[#081321] transition hover:bg-[#d4ff73]">Continue to Feedback <ChevronRight size={17} /></button></div></section>;
}
function Metric({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) { const displayValue = value.replace(' / 10', ` / ${questions.length}`); return <div className="p-4 sm:p-5"><p className="font-mono text-[10px] uppercase tracking-[.12em] text-muted">{label}</p><p className={`mt-2 text-xl font-extrabold sm:text-2xl ${accent ? 'text-lime' : 'text-ink'}`}>{displayValue}</p></div>; }

function FeedbackForm({ participant, updateParticipant, feedback, updateFeedback, error, onSubmit }: { participant: ParticipantDetails; updateParticipant: (field: keyof ParticipantDetails, value: string) => void; feedback: Feedback; updateFeedback: <K extends keyof Feedback>(field: K, value: Feedback[K]) => void; error: string; onSubmit: (event: React.FormEvent) => void }) {
  const ratings: { key: keyof Feedback; label: string }[] = [{ key: 'overall', label: 'Overall workshop experience' }, { key: 'technical', label: 'Quality of technical sessions' }, { key: 'handsOn', label: 'Hands-on activities' }, { key: 'facilitator', label: 'Instructor knowledge' }, { key: 'organization', label: 'Workshop organization' }, { key: 'learning', label: 'Learning experience' }];
  return <section className="float-in mx-auto max-w-5xl"><Progress phase="feedback" /><div className="mb-8"><p className="font-mono text-[10px] uppercase tracking-[.18em] text-sky">Mission debrief / 02</p><h1 className="mt-2 text-3xl font-extrabold sm:text-5xl">Help us improve the next flight.</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-muted">Your honest feedback helps the Department of Robotics &amp; Automation design better technical experiences.</p></div><form onSubmit={onSubmit} className="space-y-6"><FormSection icon={<Users size={18} />} title="Participant details" copy="Tell us who joined the mission."><div className="grid gap-4 sm:grid-cols-2">{([['fullName', 'Full name', 'text'], ['institution', 'College / institution', 'text'], ['email', 'Email ID', 'email'], ['branch', 'Branch / department', 'text']] as const).map(([key, label, type]) => <Field key={key} label={label}><input required type={type} value={participant[key]} onChange={(event) => updateParticipant(key, event.target.value)} className="field" /></Field>)}<Field label="Year of study"><select required value={participant.year} onChange={(event) => updateParticipant('year', event.target.value)} className="field"><option value="">Select year</option><option>1st Year</option><option>2nd Year</option><option>3rd Year</option><option>4th Year</option><option>Postgraduate</option></select></Field></div></FormSection><FormSection icon={<Star size={18} />} title="Rate the workshop" copy="Select one to five stars for each area."><div className="grid gap-x-8 gap-y-5 sm:grid-cols-2">{ratings.map(({ key, label }) => <StarRating key={key} label={label} value={feedback[key] as number} onChange={(value) => updateFeedback(key, value)} />)}</div></FormSection><FormSection icon={<Headphones size={18} />} title="Your perspective" copy="A few thoughtful notes help us tune the next workshop."><div className="grid gap-5 sm:grid-cols-2"><TextArea label="What was the most useful part?" value={feedback.usefulPart} onChange={(value) => updateFeedback('usefulPart', value)} /><TextArea label="What did you learn?" value={feedback.learned} onChange={(value) => updateFeedback('learned', value)} /><TextArea label="Which session did you enjoy most?" value={feedback.favoriteSession} onChange={(value) => updateFeedback('favoriteSession', value)} /><TextArea label="What can we improve?" value={feedback.improvement} onChange={(value) => updateFeedback('improvement', value)} /></div><div className="mt-5 grid gap-5 sm:grid-cols-2"><Choice label="Would you recommend this workshop?" value={feedback.recommend} onChange={(value) => updateFeedback('recommend', value)} /><Choice label="Attend future IEEE RAS workshops?" value={feedback.futureWorkshops} onChange={(value) => updateFeedback('futureWorkshops', value)} /></div></FormSection>{error && <p className="rounded-xl border border-orange/30 bg-orange/10 px-4 py-3 text-sm text-orange">{error}</p>}<div className="flex justify-end"><button className="inline-flex items-center gap-2 rounded-xl bg-lime px-6 py-3.5 text-sm font-extrabold text-[#081321] transition hover:bg-[#d4ff73]" type="submit">Submit feedback <Send size={16} /></button></div></form></section>;
}
function FormSection({ icon, title, copy, children }: { icon: ReactNode; title: string; copy: string; children: ReactNode }) { return <div className="rounded-3xl border border-line bg-panel/90 p-6 shadow-xl shadow-black/10 sm:p-8"><div className="mb-6 flex items-start gap-3"><div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-sky/10 text-sky">{icon}</div><div><h2 className="text-lg font-extrabold">{title}</h2><p className="mt-1 text-xs text-muted">{copy}</p></div></div>{children}</div>; }
function Field({ label, children }: { label: string; children: ReactNode }) { return <label className="block"><span className="mb-2 block text-xs font-bold text-muted">{label}</span>{children}</label>; }
function TextArea({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) { return <label className="block"><span className="mb-2 block text-xs font-bold text-muted">{label}</span><textarea required value={value} onChange={(event) => onChange(event.target.value)} className="field min-h-28 resize-y" /></label>; }
function StarRating({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) { return <div><p className="mb-2 text-xs font-bold text-muted">{label}</p><div className="flex gap-1">{[1, 2, 3, 4, 5].map((star) => <button type="button" aria-label={`${star} stars`} key={star} onClick={() => onChange(star)} className={`rounded-lg p-1.5 transition ${star <= value ? 'text-orange' : 'text-line hover:text-orange/70'}`}><Star size={21} fill={star <= value ? 'currentColor' : 'none'} /></button>)}</div></div>; }
function Choice({ label, value, onChange }: { label: string; value: 'Yes' | 'No'; onChange: (value: 'Yes' | 'No') => void }) { return <div><p className="mb-2 text-xs font-bold text-muted">{label}</p><div className="flex gap-2">{(['Yes', 'No'] as const).map((choice) => <button type="button" key={choice} onClick={() => onChange(choice)} className={`rounded-lg border px-5 py-2 text-xs font-bold transition ${value === choice ? 'border-sky bg-sky/10 text-sky' : 'border-line text-muted hover:border-sky/60'}`}>{choice}</button>)}</div></div>; }

function Completion({ submission, onViewResult, onStartOver }: { submission: Submission; onViewResult: () => void; onStartOver: () => void }) { return <section className="float-in mx-auto max-w-3xl"><Progress phase="complete" /><div className="rounded-3xl border border-line bg-panel/90 p-7 text-center shadow-2xl shadow-black/20 sm:p-12"><div className="relative mx-auto grid h-20 w-20 place-items-center rounded-3xl border border-lime/50 bg-lime/10 text-lime"><Award size={38} /><span className="absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-full bg-lime text-[#081321]"><Check size={14} /></span></div><p className="mt-7 font-mono text-[10px] uppercase tracking-[.18em] text-sky">Aero Vision Workshop 2026</p><h1 className="mt-3 text-3xl font-extrabold sm:text-5xl">Thank You for Participating!</h1><p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-muted">Thank you for participating in the Aero Vision Workshop 2026. Your feedback helps us improve future technical workshops.</p><div className="mx-auto mt-8 grid max-w-xl grid-cols-2 gap-3 sm:grid-cols-3"><Metric label="Participant" value={submission.participant.fullName} /><Metric label="Quiz score" value={`${submission.score} / 10`} accent /><Metric label="Percentage" value={`${submission.percentage}%`} /></div><div className="mt-7 inline-flex items-center gap-2 rounded-full border border-lime/30 bg-lime/10 px-4 py-2 text-xs font-bold text-lime"><Check size={15} /> Feedback submitted successfully</div><div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row"><button onClick={onViewResult} className="inline-flex items-center justify-center gap-2 rounded-xl border border-line px-5 py-3 text-sm font-bold text-ink transition hover:border-sky"><Trophy size={16} /> View quiz result</button><button onClick={onStartOver} className="inline-flex items-center justify-center gap-2 rounded-xl bg-lime px-5 py-3 text-sm font-extrabold text-[#081321] transition hover:bg-[#d4ff73]"><RotateCcw size={16} /> Submit another response</button><button type="button" onClick={() => downloadCertificate(submission.participant.fullName)} title="Download your participation certificate" className="inline-flex items-center justify-center gap-2 rounded-xl border border-line px-5 py-3 text-sm font-bold text-ink transition hover:border-sky"><Download size={16} /> Download certificate</button></div></div></section>; }

function Dashboard({ unlocked, ownerCode, onCodeChange, onUnlock, onClose }: { unlocked: boolean; ownerCode: string; onCodeChange: (value: string) => void; onUnlock: () => void; onClose: () => void }) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [error, setError] = useState('');
  const unlock = (event: FormEvent) => { event.preventDefault(); if (ownerCode !== OWNER_CODE) { setError('Incorrect owner code.'); return; } setSubmissions(loadSubmissions().reverse()); setError(''); onUnlock(); };
  return <div className="fixed inset-0 z-50 overflow-y-auto bg-[#081321]/95 p-4 backdrop-blur-sm sm:p-8"><div className="mx-auto max-w-5xl rounded-3xl border border-line bg-panel p-6 shadow-2xl sm:p-9"><div className="flex items-start justify-between gap-5 border-b border-line pb-6"><div><p className="font-mono text-[10px] uppercase tracking-[.18em] text-sky">Organizer view</p><h2 className="mt-2 text-2xl font-extrabold sm:text-3xl">Workshop feedback</h2><p className="mt-2 text-sm text-muted">Private feedback stored on this browser.</p></div><button onClick={onClose} aria-label="Close dashboard" className="rounded-lg border border-line p-2 text-muted transition hover:border-sky hover:text-ink"><X size={18} /></button></div>{!unlocked ? <form onSubmit={unlock} className="mx-auto max-w-md py-12"><div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-sky/10 text-sky"><LockKeyhole size={25} /></div><h3 className="mt-5 text-center text-xl font-extrabold">Owner access</h3><p className="mt-2 text-center text-sm leading-6 text-muted">Enter your owner code to view participant feedback.</p><input autoFocus type="password" value={ownerCode} onChange={(event) => onCodeChange(event.target.value)} placeholder="Owner code" className="field mt-6" />{error && <p className="mt-2 text-xs text-orange">{error}</p>}<button className="mt-4 w-full rounded-xl bg-lime px-5 py-3 text-sm font-extrabold text-[#081321]" type="submit">Unlock dashboard</button></form> : <div className="pt-6">{submissions.length === 0 ? <p className="rounded-xl border border-dashed border-line p-8 text-center text-sm text-muted">No feedback submitted yet on this browser.</p> : <div className="space-y-4">{submissions.map((item) => <article key={item.id} className="rounded-2xl border border-line bg-[#0b1b2c] p-5"><div className="flex flex-col justify-between gap-3 sm:flex-row"><div><h3 className="font-bold">{item.participant.fullName}</h3><p className="mt-1 text-xs text-muted">{item.participant.institution} · {item.participant.branch} · {item.participant.year}</p><p className="mt-1 text-xs text-muted">{item.participant.email}</p></div><div className="text-left sm:text-right"><p className="font-mono text-sm text-lime">Quiz {item.score}/{questions.length} · {item.percentage}%</p><p className="mt-1 text-xs text-orange">Overall rating: {item.feedback.overall}/5</p></div></div><div className="mt-4 grid gap-3 border-t border-line pt-4 text-sm text-muted sm:grid-cols-2"><p><strong className="text-ink">Most useful:</strong> {item.feedback.usefulPart}</p><p><strong className="text-ink">Learned:</strong> {item.feedback.learned}</p><p><strong className="text-ink">Favorite session:</strong> {item.feedback.favoriteSession}</p><p><strong className="text-ink">Improvement:</strong> {item.feedback.improvement}</p></div><p className="mt-4 text-xs text-muted">Recommend: <span className="text-ink">{item.feedback.recommend}</span> · Future IEEE RAS workshops: <span className="text-ink">{item.feedback.futureWorkshops}</span></p></article>)}</div>}</div>}</div></div>;
}

export default App;
