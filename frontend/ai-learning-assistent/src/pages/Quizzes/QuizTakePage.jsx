import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react";
import quizService from "../../services/quizService";
import PageHeader from "../../components/common/PageHeader";
import Spinner from "../../components/common/Spinner";
import toast from "react-hot-toast";
import Button from "../../components/common/Button";

const QuizTakePage = () => {
  const navigate = useNavigate();
  const { quizId } = useParams();
  const [loading, setLoading] = useState(true);
  const [quiz, setQuiz] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const response = await quizService.getQuizById(quizId);
        setQuiz(response);
        console.log("Quiz Response :- ", response);
      } catch (error) {
        toast.error(error.message || "Failed to fetch quiz");
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [quizId]);

  const handleOptionChange = (questionId, optionIndex) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  const handleNextQuestion = () => {
    if (quiz && currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleGoToQuestion = (index) => {
    setCurrentQuestionIndex(index);
  };

  const handleSubmitQuiz = async () => {
    if (!quiz) return;

    setSubmitting(true);
    try {
      const answers = Object.entries(selectedAnswers).map(
        ([questionId, optionIndex]) => {
          const questionIndex = quiz.questions.findIndex(
            (question) => question._id === questionId,
          );
          const selectedAnswer =
            quiz.questions[questionIndex]?.options?.[optionIndex];
          return {
            questionIndex,
            selectedAnswer,
          };
        },
      );

      await quizService.submitQuiz(quizId, answers);
      toast.success("Quiz submitted successfully");
      navigate(`/quizzes/${quizId}/results`);
    } catch (error) {
      toast.error(error.message || "Failed to submit quiz");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!quiz || !quiz.questions || quiz.questions.length === 0) {
    return (
      <div className="p-6">
        <p className="text-slate-700">
          Quiz not found or no questions available.
        </p>
      </div>
    );
  }

  const totalQuestions = quiz.questions.length;
  const currentQuestion = quiz.questions[currentQuestionIndex];
  const selectedOptionIndex = selectedAnswers[currentQuestion._id];
  const answeredCount = Object.keys(selectedAnswers).length;
  const progressPercent = Math.round(
    ((currentQuestionIndex + 1) / totalQuestions) * 100,
  );
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;

  return (
    <div className="space-y-6 px-4 py-6 sm:px-6">
      <PageHeader
        title={quiz.title || "Quiz"}
        subtitle={`Question ${currentQuestionIndex + 1} of ${totalQuestions}`}
      />

      <div className="mx-auto w-full max-w-6xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm xl:px-8 xl:py-8">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
              Progress
            </p>
            <p className="mt-1 text-sm text-slate-600">
              {answeredCount} answered • {totalQuestions} total
            </p>
          </div>
          <div className="text-sm font-semibold text-slate-700">
            {progressPercent}% completed
          </div>
        </div>

        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="mt-8 rounded-3xl border border-slate-200 bg-slate-50 p-5 sm:p-6">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-emerald-600 shadow-sm">
              <CheckCircle2 className="h-4 w-4" />
              Question {currentQuestionIndex + 1}
            </div>
            <span className="text-sm text-slate-500">
              {currentQuestion.timeLimit
                ? `${currentQuestion.timeLimit} sec`
                : ""}
            </span>
          </div>

          <h2 className="text-xl font-semibold text-slate-900">
            {currentQuestion.question ||
              currentQuestion.questionText ||
              "Untitled question"}
          </h2>

          <div className="mt-6 space-y-3">
            {(currentQuestion.options || []).map((option, index) => {
              const isSelected = selectedOptionIndex === index;
              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleOptionChange(currentQuestion._id, index)}
                  className={`w-full rounded-2xl border p-4 text-left transition ${
                    isSelected
                      ? "border-emerald-500 bg-emerald-50 text-slate-900"
                      : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-100"
                  }`}
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <span
                      className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border text-sm font-semibold ${
                        isSelected
                          ? "border-emerald-500 bg-emerald-500 text-white"
                          : "border-slate-300 bg-white text-slate-500"
                      }`}
                    >
                      {isSelected ? "✓" : index + 1}
                    </span>
                    <span className="text-sm sm:text-base">{option}</span>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-4 sm:p-5">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
              Jump to question
            </p>
            <div className="mx-auto grid w-full grid-cols-5 gap-2 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 xl:max-w-4xl justify-center">
              {quiz.questions.map((question, index) => {
                const isActive = index === currentQuestionIndex;
                const isAnsweredQuestion = selectedAnswers.hasOwnProperty(
                  question._id,
                );
                return (
                  <button
                    key={question._id || index}
                    type="button"
                    onClick={() => handleGoToQuestion(index)}
                    className={`aspect-square rounded-full border text-sm font-semibold transition ${
                      isActive
                        ? "border-emerald-500 bg-emerald-500 text-white"
                        : isAnsweredQuestion
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex w-full gap-3 sm:w-auto">
              <Button
                type="button"
                variant="secondary"
                onClick={handlePreviousQuestion}
                disabled={currentQuestionIndex === 0}
                className="w-full sm:w-auto"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
            </div>

            <div className="flex w-full items-center gap-3 sm:w-auto">
              {!isLastQuestion ? (
                <Button
                  type="button"
                  variant="primary"
                  onClick={handleNextQuestion}
                  className="w-full sm:w-auto"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="primary"
                  onClick={handleSubmitQuiz}
                  disabled={submitting}
                  className="w-full sm:w-auto"
                >
                  Submit Quiz
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizTakePage;
