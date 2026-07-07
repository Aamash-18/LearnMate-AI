import React, { useState } from "react";
import { useParams } from "react-router-dom";
import aiService from "../../services/aiService";
import { Sparkles, Brain, BookOpen } from "lucide-react";
import toast from "react-hot-toast";
import Modal from "../common/Modal";

const AIAction = () => {
  const { id: documentId } = useParams();
  // Tumhare original states maintain kiye hain
  const [loadingAction, setLoadingAction] = useState(null);
  const [isModelOpen, setIsModelOpen] = useState(false);
  const [modelContent, setModelContent] = useState("");
  const [modelTitle, setModelTitle] = useState("");
  const [concept, setConcept] = useState("");

  const handleGenerateSummary = async () => {
    setLoadingAction("summary");
    try {
      const response = await aiService.generateSummary(documentId);
      setModelTitle("Document Summary");
      setModelContent(response.data);
      setIsModelOpen(true);
    } catch (error) {
      toast.error("Failed to generate summary. Please try again.");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleExplainConcept = async () => {
    if (!concept.trim()) {
      toast.error("Please enter a concept to explain.");
      return;
    }
    setLoadingAction("explain");
    try {
      const response = await aiService.explainConcept(documentId, concept);
      setModelTitle(`Explanation of "${concept}"`);
      setModelContent(response.data.explanation);
      setIsModelOpen(true);
    } catch (error) {
      toast.error("Failed to explain concept. Please try again.");
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div className="space-y-4 md:space-y-6 px-3 md:px-0">
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
          <Sparkles size={18} className="md:w-5 md:h-5" />
        </div>
        <div>
          <h2 className="text-base md:text-lg font-bold text-slate-800">
            AI Assistant
          </h2>
          <p className="text-xs md:text-sm text-slate-500">
            Powered by advanced AI
          </p>
        </div>
      </div>

      {/* Summary Card */}
      <div className="p-4 md:p-6 border border-slate-200 rounded-xl bg-white shadow-sm flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div className="flex gap-3 md:gap-4">
          <div className="p-2 md:p-3 bg-blue-50 rounded-lg text-blue-600 flex-shrink-0">
            <BookOpen size={20} className="md:w-6 md:h-6" />
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-slate-800 text-sm md:text-base">
              Generate Summary
            </h3>
            <p className="text-xs md:text-sm text-slate-500 line-clamp-2">
              Get a concise summary of the entire document.
            </p>
          </div>
        </div>
        <button
          onClick={handleGenerateSummary}
          disabled={loadingAction === "summary"}
          className="w-full md:w-auto px-4 md:px-6 py-2 bg-emerald-600 text-white font-medium text-sm md:text-base rounded-lg hover:bg-emerald-700 transition disabled:bg-gray-400"
        >
          {loadingAction === "summary" ? "Summarizing..." : "Summarize"}
        </button>
      </div>

      {/* Explain Concept Card */}
      <div className="p-4 md:p-6 border border-slate-200 rounded-xl bg-white shadow-sm">
        <div className="flex gap-3 md:gap-4 mb-4">
          <div className="p-2 md:p-3 bg-amber-50 rounded-lg text-amber-600 flex-shrink-0">
            <Brain size={20} className="md:w-6 md:h-6" />
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-slate-800 text-sm md:text-base">
              Explain a Concept
            </h3>
            <p className="text-xs md:text-sm text-slate-500 line-clamp-2">
              Enter a topic or concept from the document to get a detailed
              explanation.
            </p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-2 md:gap-3">
          <input
            type="text"
            placeholder="e.g., 'React Hooks'"
            className="flex-1 px-3 md:px-4 py-2 text-sm md:text-base border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            value={concept}
            onChange={(e) => setConcept(e.target.value)}
          />
          <button
            onClick={handleExplainConcept}
            disabled={loadingAction === "explain"}
            className="w-full md:w-auto px-4 md:px-6 py-2 bg-emerald-600 text-white font-medium text-sm md:text-base rounded-lg hover:bg-emerald-700 transition disabled:bg-gray-400"
          >
            {loadingAction === "explain" ? "Explaining..." : "Explain"}
          </button>
        </div>
      </div>
      <Modal
        isOpen={isModelOpen}
        title={modelTitle}
        content={modelContent}
        onClose={() => setIsModelOpen(false)}
      />
    </div>
  );
};

export default AIAction;
