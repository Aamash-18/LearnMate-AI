import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, XCircle } from "lucide-react";
import quizService from "../../services/quizService";
import PageHeader from "../../components/common/PageHeader";
import Spinner from "../../components/common/Spinner";
import Button from "../../components/common/Button";
import toast from "react-hot-toast";

const QuizResultPage = () => {
  const navigate = useNavigate();
  const { quizId } = useParams();
  const [loading, setLoading] = useState(true);
  const [quizResult, setQuizResult] = useState(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const data = await quizService.getQuizResults(quizId);
        setQuizResult(data);
      } catch (error) {
        toast.error(error.message || "Failed to load quiz results");
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [quizId]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!quizResult) {
    return (
      <div className="p-6">
        <p className="text-slate-700">Unable to load quiz results.</p>
      </div>
    );
  }

  const {
    title,
    score,
    totalQuestions,
    detailedResults,
    documentId,
    completedAt,
  } = quizResult;
  const correctCount = detailedResults.filter(
    (item) => item.selectedAnswer === item.correctAnswer,
  ).length;
  const incorrectCount = totalQuestions - correctCount;
  const formattedDate = completedAt
    ? new Date(completedAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

  return (
    <div className="space-y-6 px-4 py-6 sm:px-6">
      <div
        className="flex items-center gap-3 text-slate-600 hover:text-slate-900 cursor-pointer"
        onClick={() =>
          navigate(
            documentId?._id ? `/documents/${documentId._id}` : "/documents",
          )
        }
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="text-sm">Back to Document</span>
      </div>

      <PageHeader title={`${title || "Quiz"} - Quiz Results`} />

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-slate-500">
                  Your score
                </p>
                <p className="mt-3 text-5xl font-semibold text-slate-900">
                  {Math.round(score)}%
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  {formattedDate
                    ? `Completed on ${formattedDate}`
                    : "Quiz completed"}
                </p>
              </div>

              <div className="grid w-full grid-cols-3 gap-3 sm:max-w-xs lg:w-auto">
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-center min-w-0">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500 break-words whitespace-normal">
                    Total
                  </p>
                  <p className="mt-2 text-xl font-semibold text-slate-900">
                    {totalQuestions}
                  </p>
                </div>
                <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-4 text-center min-w-0">
                  <p className="text-xs uppercase tracking-[0.2em] text-emerald-700 break-words whitespace-normal">
                    Correct
                  </p>
                  <p className="mt-2 text-xl font-semibold text-emerald-700">
                    {correctCount}
                  </p>
                </div>
                <div className="rounded-3xl border border-rose-200 bg-rose-50 p-4 text-center min-w-0">
                  <p className="text-xs uppercase tracking-[0.2em] text-rose-700 break-words whitespace-normal">
                    Incorrect
                  </p>
                  <p className="mt-2 text-xl font-semibold text-rose-700">
                    {incorrectCount}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-slate-500">
                  Detailed Review
                </p>
                <p className="mt-2 text-slate-700">
                  Go through each question and see the answer you selected.
                </p>
              </div>
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate(`/quizzes/${quizId}/take`)}
              >
                Retake Quiz
              </Button>
            </div>

            <div className="space-y-6">
              {detailedResults.map((result) => {
                const isCorrect =
                  result.selectedAnswer === result.correctAnswer;
                return (
                  <div
                    key={result.questionIndex}
                    className="rounded-3xl border border-slate-200 bg-slate-50 p-5"
                  >
                    <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-sm font-semibold text-slate-600 shadow-sm">
                        <span>Question {result.questionIndex + 1}</span>
                      </div>
                      <div
                        className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold ${isCorrect ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-rose-50 text-rose-700 border border-rose-200"}`}
                      >
                        {isCorrect ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : (
                          <XCircle className="h-4 w-4" />
                        )}
                        <span>{isCorrect ? "Correct" : "Incorrect"}</span>
                      </div>
                    </div>

                    <h3 className="mb-4 text-lg font-semibold text-slate-900">
                      {result.question}
                    </h3>

                    <div className="space-y-3">
                      {result.options.map((option, index) => {
                        const isSelectedOption =
                          option === result.selectedAnswer;
                        const isCorrectOption = option === result.correctAnswer;
                        return (
                          <div
                            key={index}
                            className={`rounded-2xl border px-4 py-3 text-sm ${
                              isCorrectOption
                                ? "border-emerald-300 bg-emerald-50 text-emerald-900"
                                : isSelectedOption
                                  ? "border-rose-300 bg-rose-50 text-rose-900"
                                  : "border-slate-200 bg-white text-slate-700"
                            }`}
                          >
                            {option}
                          </div>
                        );
                      })}
                    </div>

                    {result.explanation && (
                      <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
                        <p className="font-semibold text-slate-900 uppercase tracking-[0.1em] text-[11px]">
                          Explanation
                        </p>
                        <p className="mt-2">{result.explanation}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm uppercase tracking-[0.2em] text-slate-500">
              Quiz summary
            </p>
            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between rounded-3xl bg-slate-50 px-4 py-4">
                <span className="text-sm text-slate-600">Quiz</span>
                <span className="font-semibold text-slate-900">{title}</span>
              </div>
              <div className="flex items-center justify-between rounded-3xl bg-slate-50 px-4 py-4">
                <span className="text-sm text-slate-600">Total questions</span>
                <span className="font-semibold text-slate-900">
                  {totalQuestions}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-3xl bg-slate-50 px-4 py-4">
                <span className="text-sm text-slate-600">Correct answers</span>
                <span className="font-semibold text-emerald-700">
                  {correctCount}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-3xl bg-slate-50 px-4 py-4">
                <span className="text-sm text-slate-600">
                  Incorrect answers
                </span>
                <span className="font-semibold text-rose-700">
                  {incorrectCount}
                </span>
              </div>
              {documentId?.title && (
                <div className="flex items-center justify-between rounded-3xl bg-slate-50 px-4 py-4">
                  <span className="text-sm text-slate-600">Document</span>
                  <span className="font-semibold text-slate-900">
                    {documentId.title}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm uppercase tracking-[0.2em] text-slate-500">
              Actions
            </p>
            <div className="mt-6 space-y-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(`/quizzes/${quizId}/take`)}
              >
                Retry Quiz
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() =>
                  navigate(
                    documentId?._id
                      ? `/documents/${documentId._id}`
                      : "/documents",
                  )
                }
              >
                Back to document
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizResultPage;
