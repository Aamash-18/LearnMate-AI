import React, { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

import quizServices from "../../services/quizService";
import aiService from "../../services/aiService";
import Spinner from "../common/Spinner";
import Button from "../common/Button";
import ConfirmationModal from "../common/ConfirmationModal";
import QuizCard from "./QuizCard";

function QuizTab({ documentId }) {
  const [loading, setLoading] = useState(true);
  const [quizzes, setQuizzes] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [isGeneratingModeOpen, setIsGeneratingModelOpen] = useState(false);
  const [numQuestions, setNumQuestions] = useState();

  // for deleting Modal
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [isDeletingModelOpen, setIsDeletingModelOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchQuizzes = async () => {
    setLoading(true);
    try {
      const data = await quizServices.getQuizzesForDocument(documentId);
      setQuizzes(data.data);
    } catch (error) {
      toast.error("Failed to fetch Quizzes");
      console.error("Error fetching quizzes:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (documentId) {
      fetchQuizzes();
    }
  }, [documentId]);

  const handleGenerateQuiz = async (e) => {
    e.preventDefault();
    if (numQuestions < 1 || numQuestions > 50) {
      toast.error("Please enter a number between 1 and 50");
      return;
    }
    setGenerating(true);
    try {
      await aiService.generateQuiz(documentId, { numQuestions });
      toast.success("Quiz Generated Successfully");
      setIsGeneratingModelOpen(false);
      setNumQuestions(5);
      // Add a small delay to ensure the quiz is saved on the backend
      await new Promise((resolve) => setTimeout(resolve, 1000));
      // Fetch quizzes and wait for it to complete
      await fetchQuizzes();
    } catch (error) {
      toast.error(error.message || "Failed to generate Quiz");
      console.error("Error generating quiz:", error);
    } finally {
      setGenerating(false);
    }
  };

  const handleDeleteRequest = (quiz) => {
    setSelectedQuiz(quiz);
    setIsDeletingModelOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedQuiz) return;
    setDeleting(true);
    try {
      await quizServices.deleteQuiz(selectedQuiz._id);
      toast.success("Quiz deleted successfully");
      setIsDeletingModelOpen(false);
      setSelectedQuiz(null);
      fetchQuizzes();
    } catch (error) {
      toast.error(error.message || "Failed to delete Quiz");
      console.error(error);
    } finally {
      setDeleting(false);
    }
  };

  const renderQuizContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-12">
          <Spinner />
        </div>
      );
    }

    if (quizzes.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <div className="text-center">
            <div className="mb-4 flex justify-center">
              <div className="p-3 bg-gray-100 rounded-full">
                <svg
                  className="w-12 h-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Quizzes Yet
            </h3>
            <p className="text-gray-600 text-sm mb-6 max-w-md">
              Generate a quiz from your document to test your knowledge.
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {quizzes.map((quiz) => (
          <QuizCard key={quiz._id} quiz={quiz} onDelete={handleDeleteRequest} />
        ))}
      </div>
    );
  };

  return (
    <div className="w-full">
      {/* Header with Generate Button */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Quizzes</h2>
        <Button
          onClick={() => setIsGeneratingModelOpen(true)}
          className="flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Generate Quiz
        </Button>
      </div>

      {/* Quizzes Grid */}
      {renderQuizContent()}

      {/* Generate Quiz Modal */}
      <div
        className={`fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4 ${
          isGeneratingModeOpen ? "" : "hidden"
        }`}
      >
        <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Generate New Quiz
          </h2>

          <form onSubmit={handleGenerateQuiz}>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Questions
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={numQuestions}
                onChange={(e) =>
                  setNumQuestions(Math.max(1, parseInt(e.target.value) || 5))
                }
                className="w-full px-4 py-2 border-2 border-emerald-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Between 1 and 50 questions
              </p>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                type="button"
                onClick={() => {
                  setIsGeneratingModelOpen(false);
                  setNumQuestions(5);
                }}
                disabled={generating}
                className="h-10 min-w-[80px] px-4 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition font-medium disabled:opacity-50 flex items-center justify-center"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={generating}
                className="h-10 min-w-[100px] px-4 text-sm bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition font-medium disabled:opacity-50 flex items-center justify-center gap-2 whitespace-nowrap"
              >
                {generating ? (
                  <>
                    <Spinner size="sm" />
                    Generating...
                  </>
                ) : (
                  "Generate"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeletingModelOpen}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setIsDeletingModelOpen(false);
          setSelectedQuiz(null);
        }}
        title="Confirm Delete Quiz"
        message={`Are you sure you want to delete the quiz "${selectedQuiz?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        isLoading={deleting}
        isDangerous={true}
      />
    </div>
  );
}

export default QuizTab;
