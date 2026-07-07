import React from "react";
import { Play, BarChart3, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const QuizCard = ({ quiz, onDelete }) => {
  const navigate = useNavigate();

  const handleStartQuiz = () => {
    navigate(`/quizzes/${quiz._id}/take`);
  };

  const handleViewResults = () => {
    navigate(`/quizzes/${quiz._id}/results`);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const score = quiz.score || 0;
  const isCompleted = Boolean(
    quiz.completedAt || (quiz.userAnswers && quiz.userAnswers.length > 0),
  );

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
      {/* Header with score badge */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {quiz.title}
          </h3>
        </div>
        <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-sm font-medium">
          🎯 Score {score}
        </span>
      </div>

      {/* Meta information */}
      <div className="space-y-2 mb-4 text-sm text-gray-600">
        <p>CREATED {formatDate(quiz.createdAt)}</p>
        <p className="font-medium text-gray-700">
          {quiz.questions?.length || 0} Questions
        </p>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3">
        {isCompleted ? (
          <button
            onClick={handleViewResults}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
          >
            <BarChart3 className="w-4 h-4" />
            View Results
          </button>
        ) : (
          <button
            onClick={handleStartQuiz}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition font-medium"
          >
            <Play className="w-4 h-4" />
            Start Quiz
          </button>
        )}
        <button
          onClick={() => onDelete(quiz)}
          className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
          title="Delete quiz"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default QuizCard;
