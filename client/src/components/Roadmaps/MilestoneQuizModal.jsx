import { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import {
    X, Brain, CheckCircle2, XCircle, Trophy, RotateCcw,
    ChevronRight, ChevronLeft, Loader2, Sparkles, Target, AlertCircle
} from 'lucide-react';

// --- Confetti Effect ---
const ConfettiPiece = ({ style }) => (
    <div
        className="absolute w-2 h-2 rounded-sm animate-bounce"
        style={style}
    />
);

const Confetti = () => {
    const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'];
    const pieces = Array.from({ length: 30 }, (_, i) => ({
        id: i,
        style: {
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 40}%`,
            backgroundColor: colors[Math.floor(Math.random() * colors.length)],
            animationDuration: `${0.8 + Math.random() * 1.2}s`,
            animationDelay: `${Math.random() * 0.5}s`,
            transform: `rotate(${Math.random() * 360}deg)`,
            opacity: 0.8,
        }
    }));
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {pieces.map(piece => <ConfettiPiece key={piece.id} style={piece.style} />)}
        </div>
    );
};

// --- Loading Screen ---
const LoadingScreen = ({ milestoneTitle }) => (
    <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
        <div className="relative mb-8">
            <div className="w-24 h-24 rounded-full bg-indigo-100 flex items-center justify-center">
                <Brain className="w-12 h-12 text-indigo-600" />
            </div>
            <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-amber-400 flex items-center justify-center animate-bounce">
                <Sparkles className="w-4 h-4 text-white" />
            </div>
        </div>
        <div className="flex items-center gap-2 mb-3">
            <Loader2 className="w-5 h-5 text-indigo-500 animate-spin" />
            <span className="text-lg font-bold text-slate-800">AI đang soạn câu hỏi...</span>
        </div>
        <p className="text-slate-500 text-sm max-w-xs leading-relaxed">
            Đang phân tích nội dung chặng <span className="font-semibold text-indigo-600">"{milestoneTitle}"</span> để tạo bộ đề kiểm tra phù hợp.
        </p>
        {/* Pulsing dots */}
        <div className="flex gap-1.5 mt-6">
            {[0, 1, 2].map(i => (
                <div
                    key={i}
                    className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                />
            ))}
        </div>
    </div>
);

// --- Question Card ---
const OPTION_LABELS = ['A', 'B', 'C', 'D'];

const QuestionCard = ({ question, questionIndex, totalQuestions, selectedAnswer, onSelect, isSubmitted }) => {
    return (
        <div className="flex flex-col gap-5">
            {/* Question header */}
            <div className="flex items-start gap-3">
                <span className="shrink-0 w-8 h-8 rounded-full bg-indigo-600 text-white text-sm font-extrabold flex items-center justify-center mt-0.5">
                    {questionIndex + 1}
                </span>
                <p className="text-slate-900 font-semibold text-base leading-relaxed">{question.question}</p>
            </div>

            {/* Options */}
            <div className="flex flex-col gap-3 pl-11">
                {question.options.map((option, optIndex) => {
                    const isSelected = selectedAnswer === optIndex;
                    const isCorrect = optIndex === question.correctAnswer;

                    let baseClass = 'flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all text-sm font-medium select-none';

                    if (!isSubmitted) {
                        baseClass += isSelected
                            ? ' bg-indigo-50 border-indigo-400 text-indigo-800 shadow-sm shadow-indigo-100'
                            : ' bg-white border-slate-200 text-slate-700 hover:border-indigo-200 hover:bg-indigo-50/40';
                    } else {
                        if (isCorrect) {
                            baseClass += ' bg-emerald-50 border-emerald-400 text-emerald-800';
                        } else if (isSelected && !isCorrect) {
                            baseClass += ' bg-rose-50 border-rose-400 text-rose-800';
                        } else {
                            baseClass += ' bg-slate-50 border-slate-200 text-slate-500';
                        }
                    }

                    return (
                        <div
                            key={optIndex}
                            className={baseClass}
                            onClick={() => !isSubmitted && onSelect(optIndex)}
                        >
                            <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-extrabold shrink-0 transition-colors ${!isSubmitted
                                    ? isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'
                                    : isCorrect ? 'bg-emerald-500 text-white' : isSelected ? 'bg-rose-500 text-white' : 'bg-slate-200 text-slate-500'
                                }`}>
                                {OPTION_LABELS[optIndex]}
                            </span>
                            <span className="flex-1">{option}</span>
                            {isSubmitted && isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />}
                            {isSubmitted && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-rose-500 shrink-0" />}
                        </div>
                    );
                })}
            </div>

            {/* Explanation (after submit) */}
            {isSubmitted && (
                <div className={`ml-11 p-4 rounded-xl border flex gap-3 text-sm ${selectedAnswer === question.correctAnswer
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                        : 'bg-amber-50 border-amber-200 text-amber-800'
                    }`}>
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <div>
                        <span className="font-bold">Giải thích: </span>
                        {question.explanation}
                    </div>
                </div>
            )}
        </div>
    );
};

// --- Result Screen ---
const ResultScreen = ({ score, total, questions, answers, onRetry, onClose }) => {
    const percent = Math.round((score / total) * 100);
    const isPerfect = score >= total - 1; // >= 4/5

    let resultConfig = {
        emoji: '😔',
        label: 'Cần ôn tập thêm',
        desc: 'Đừng nản lòng! Hãy ôn lại kiến thức và thử lại nhé.',
        color: 'text-rose-600',
        bgColor: 'bg-rose-50',
        borderColor: 'border-rose-200',
        barColor: 'bg-rose-500',
    };
    if (percent >= 80) {
        resultConfig = {
            emoji: '🎉',
            label: 'Xuất sắc!',
            desc: 'Bạn đã nắm vững kiến thức của chặng này rồi. Hãy tiếp tục phát huy!',
            color: 'text-emerald-600',
            bgColor: 'bg-emerald-50',
            borderColor: 'border-emerald-200',
            barColor: 'bg-emerald-500',
        };
    } else if (percent >= 60) {
        resultConfig = {
            emoji: '👍',
            label: 'Khá tốt!',
            desc: 'Bạn đã hiểu được phần lớn kiến thức. Ôn lại phần còn sai để hoàn thiện hơn nhé.',
            color: 'text-amber-600',
            bgColor: 'bg-amber-50',
            borderColor: 'border-amber-200',
            barColor: 'bg-amber-500',
        };
    }

    return (
        <div className="flex flex-col gap-6">
            {/* Score Banner */}
            <div className={`relative rounded-2xl border-2 p-6 text-center overflow-hidden ${resultConfig.bgColor} ${resultConfig.borderColor}`}>
                {isPerfect && <Confetti />}
                <div className="text-5xl mb-3">{resultConfig.emoji}</div>
                <h3 className={`text-2xl font-extrabold mb-1 ${resultConfig.color}`}>{resultConfig.label}</h3>
                <p className="text-slate-600 text-sm mb-4 max-w-xs mx-auto">{resultConfig.desc}</p>

                {/* Score number */}
                <div className="flex items-end justify-center gap-1 mb-4">
                    <span className={`text-6xl font-black ${resultConfig.color}`}>{score}</span>
                    <span className="text-2xl text-slate-400 font-bold mb-2">/{total}</span>
                </div>

                {/* Progress bar */}
                <div className="w-full max-w-xs mx-auto bg-white/70 rounded-full h-3 overflow-hidden border border-white">
                    <div
                        className={`h-full rounded-full transition-all duration-1000 ease-out ${resultConfig.barColor}`}
                        style={{ width: `${percent}%` }}
                    />
                </div>
                <p className="text-xs font-bold text-slate-500 mt-2">{percent}% chính xác</p>
            </div>

            {/* Question Review */}
            <div className="flex flex-col gap-3">
                <h4 className="font-bold text-slate-800 flex items-center gap-2 text-sm uppercase tracking-widest">
                    <Target className="w-4 h-4 text-indigo-500" /> Phân tích từng câu
                </h4>
                {questions.map((q, idx) => {
                    const userAns = answers[idx];
                    const isCorrect = userAns === q.correctAnswer;
                    return (
                        <div key={idx} className={`flex items-start gap-3 p-4 rounded-xl border text-sm ${isCorrect ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'}`}>
                            {isCorrect
                                ? <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                                : <XCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />}
                            <div className="flex-1 min-w-0">
                                <p className={`font-semibold mb-1 ${isCorrect ? 'text-emerald-800' : 'text-rose-800'}`}>
                                    Câu {idx + 1}: {q.question}
                                </p>
                                {!isCorrect && (
                                    <p className="text-xs text-slate-600">
                                        <span className="font-bold text-rose-600">Bạn chọn:</span> {userAns !== null && userAns !== undefined ? `${OPTION_LABELS[userAns]}. ${q.options[userAns]}` : 'Chưa trả lời'} •{' '}
                                        <span className="font-bold text-emerald-600">Đáp án đúng:</span> {OPTION_LABELS[q.correctAnswer]}. {q.options[q.correctAnswer]}
                                    </p>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 pt-2">
                <button
                    onClick={onRetry}
                    className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors"
                >
                    <RotateCcw className="w-4 h-4" /> Làm lại
                </button>
                <button
                    onClick={onClose}
                    className="flex-1 flex items-center justify-center gap-2 py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors shadow-lg shadow-indigo-200"
                >
                    <Trophy className="w-4 h-4" /> Hoàn tất
                </button>
            </div>
        </div>
    );
};

// --- Main Modal ---
const MilestoneQuizModal = ({ milestone, onClose }) => {
    const TOTAL_QUESTIONS = 5;

    const [phase, setPhase] = useState('loading'); // 'loading' | 'quiz' | 'result'
    const [questions, setQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState({}); // { questionIndex: optionIndex }
    const [submittedIndex, setSubmittedIndex] = useState(null); // which question was submitted
    const [isAllSubmitted, setIsAllSubmitted] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchQuiz();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchQuiz = async () => {
        setPhase('loading');
        setError(null);
        setAnswers({});
        setCurrentIndex(0);
        setSubmittedIndex(null);
        setIsAllSubmitted(false);

        try {
            const tasksPayload = milestone.tasks.map(t => ({
                title: t.title,
                content: t.content || ''
            }));

            const res = await axiosClient.post('/ai/quiz/generate', {
                milestoneTitle: milestone.title,
                tasks: tasksPayload
            });

            if (res.data.success) {
                setQuestions(res.data.data);
                setPhase('quiz');
            } else {
                throw new Error(res.data.message);
            }
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Có lỗi xảy ra.');
            setPhase('error');
        }
    };

    const handleSelectAnswer = (optionIndex) => {
        setAnswers(prev => ({ ...prev, [currentIndex]: optionIndex }));
    };

    const handleSubmitCurrent = () => {
        setSubmittedIndex(currentIndex);
    };

    const handleNext = () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setSubmittedIndex(null);
        } else {
            // All done
            setIsAllSubmitted(true);
            setPhase('result');
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
            setSubmittedIndex(null);
        }
    };

    const score = isAllSubmitted
        ? questions.reduce((acc, q, idx) => acc + (answers[idx] === q.correctAnswer ? 1 : 0), 0)
        : 0;

    const currentQuestion = questions[currentIndex];
    const currentAnswer = answers[currentIndex];
    const isCurrentSubmitted = submittedIndex === currentIndex;
    const hasAnsweredCurrent = currentAnswer !== undefined;

    return (
        <div
            className="fixed inset-0 z-[200] flex items-center justify-center p-4"
            style={{ background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(8px)' }}
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-300">
                {/* Modal Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0 bg-gradient-to-r from-indigo-600 to-violet-600">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                            <Brain className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="font-extrabold text-white text-base leading-tight">Kiểm tra kiến thức</h2>
                            <p className="text-indigo-200 text-xs font-medium truncate max-w-[280px]">{milestone.title}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Progress Bar (quiz phase only) */}
                {phase === 'quiz' && questions.length > 0 && (
                    <div className="px-6 pt-4 shrink-0">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-2">
                            <span>Câu hỏi {currentIndex + 1} / {questions.length}</span>
                            <span>{Object.keys(answers).length}/{questions.length} đã trả lời</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div
                                className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                                style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                            />
                        </div>
                    </div>
                )}

                {/* Scrollable Content Area */}
                <div className="flex-1 overflow-y-auto px-6 py-5 overscroll-contain">
                    {/* Loading */}
                    {phase === 'loading' && <LoadingScreen milestoneTitle={milestone.title} />}

                    {/* Error */}
                    {phase === 'error' && (
                        <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-rose-100 flex items-center justify-center">
                                <XCircle className="w-8 h-8 text-rose-500" />
                            </div>
                            <div>
                                <h3 className="font-extrabold text-slate-900 mb-1">Có lỗi xảy ra</h3>
                                <p className="text-slate-500 text-sm">{error}</p>
                            </div>
                            <button
                                onClick={fetchQuiz}
                                className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors"
                            >
                                <RotateCcw className="w-4 h-4" /> Thử lại
                            </button>
                        </div>
                    )}

                    {/* Quiz */}
                    {phase === 'quiz' && currentQuestion && (
                        <QuestionCard
                            question={currentQuestion}
                            questionIndex={currentIndex}
                            totalQuestions={questions.length}
                            selectedAnswer={currentAnswer}
                            onSelect={handleSelectAnswer}
                            isSubmitted={isCurrentSubmitted}
                        />
                    )}

                    {/* Result */}
                    {phase === 'result' && (
                        <ResultScreen
                            score={score}
                            total={questions.length}
                            questions={questions}
                            answers={answers}
                            onRetry={fetchQuiz}
                            onClose={onClose}
                        />
                    )}
                </div>

                {/* Footer Navigation (quiz phase only) */}
                {phase === 'quiz' && (
                    <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 shrink-0 flex items-center justify-between gap-3">
                        <button
                            onClick={handlePrev}
                            disabled={currentIndex === 0}
                            className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                        >
                            <ChevronLeft className="w-4 h-4" /> Câu trước
                        </button>

                        <div className="flex gap-2">
                            {/* Submit current question */}
                            {!isCurrentSubmitted && (
                                <button
                                    onClick={handleSubmitCurrent}
                                    disabled={!hasAnsweredCurrent}
                                    className="px-5 py-2.5 text-sm font-bold text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-xl hover:bg-indigo-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                                >
                                    Kiểm tra
                                </button>
                            )}

                            {/* Next / Finish */}
                            {isCurrentSubmitted && (
                                <button
                                    onClick={handleNext}
                                    className="flex items-center gap-1.5 px-6 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-200 transition-all active:scale-95"
                                >
                                    {currentIndex === questions.length - 1 ? (
                                        <><Trophy className="w-4 h-4" /> Xem kết quả</>
                                    ) : (
                                        <>Câu tiếp <ChevronRight className="w-4 h-4" /></>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MilestoneQuizModal;
