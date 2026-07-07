import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Spinner from "../../components/common/Spinner";
import progressService from "../../services/progressService";
import toast from "react-hot-toast";
import {
  FileText,
  BookOpen,
  BrainCircuit,
  TrendingUp,
  Clock,
} from "lucide-react";

const DashboardPage = () => {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await progressService.getDashboardData();
        setDashboardData(response);
        console.log(response);
      } catch (error) {
        toast.error(error.message || "Failed to fetch dashboard data");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner />
      </div>
    );
  }

  if (!dashboardData || !dashboardData.data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] bg-white rounded-2xl border border-slate-200 p-8">
        <div className="text-center max-w-sm">
          <div className="w-12 h-12 bg-slate-100 text-slate-400 flex items-center justify-center rounded-xl mx-auto mb-3">
            <TrendingUp className="w-6 h-6" />
          </div>
          <p className="text-slate-600 font-medium">
            No dashboard data available
          </p>
          <p className="text-sm text-slate-400 mt-1">
            Try uploading a document to generate your analytics profile.
          </p>
        </div>
      </div>
    );
  }

  // Stats mapped precisely to your API's exact response properties
  const stats = [
    {
      label: "Total Documents",
      value: dashboardData.data.totalDocuments || 0,
      icon: <FileText className="w-5 h-5 text-[#00b289]" />,
      bgIcon: "bg-[#eafaf5]",
    },
    {
      label: "Total Flashcards",
      value: dashboardData.data.totalFlashcards || 0,
      icon: <BookOpen className="w-5 h-5 text-blue-600" />,
      bgIcon: "bg-blue-50/70",
    },
    {
      label: "Total Quizzes",
      value: dashboardData.data.totalQuizzes || 0,
      icon: <BrainCircuit className="w-5 h-5 text-purple-600" />,
      bgIcon: "bg-purple-50",
    },
  ];

  // Helper function to turn ISO timestamps into local string values safely
  const formatActivityDate = (dateString) => {
    if (!dateString) return "Recent";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Recent";

    // Formats into DD/MM/YYYY, HH:MM:SS
    return (
      date.toLocaleDateString("en-GB") +
      ", " +
      date.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    );
  };

  // Compile real activity arrays into a single unified timeline feed
  const combinedActivities = [];

  if (dashboardData.recentActivity?.documents) {
    dashboardData.recentActivity.documents.forEach((doc) => {
      combinedActivities.push({
        id: doc._id,
        type: "document",
        title: `Accessed Document: ${doc.title || doc.fileName}`,
        timestamp: doc.lastAccessed,
        dotColor: "bg-blue-500",
      });
    });
  }

  if (dashboardData.recentActivity?.quizzes) {
    dashboardData.recentActivity.quizzes.forEach((quiz) => {
      combinedActivities.push({
        id: `quiz-${quiz._id}`,
        type: "quiz",
        title: `Attempted Quiz: ${quiz.title}`,
        // Using current standard time as fallback if property is missing in model
        timestamp: quiz.updatedAt || quiz.createdAt || new Date().toISOString(),
        dotColor: "bg-[#00b289]",
      });
    });
  }

  if (dashboardData.recentActivity?.flashcards) {
    dashboardData.recentActivity.flashcards.forEach((flashcard) => {
      combinedActivities.push({
        id: `flashcard-${flashcard._id}`,
        type: "flashcard",
        title: `Reviewed Flashcard${flashcard.documentTitle ? `: ${flashcard.documentTitle}` : ""}`,
        subtitle: flashcard.question,
        timestamp: flashcard.lastReviewed || new Date().toISOString(),
        dotColor: "bg-emerald-500",
        documentId: flashcard.documentId,
        setId: flashcard.setId,
      });
    });
  }

  const handleActivityView = (activity) => {
    if (activity.type === "document") {
      navigate(`/documents/${activity.id}`);
      return;
    }

    if (activity.type === "quiz") {
      const quizId = activity.id.replace(/^quiz-/, "");
      navigate(`/quizzes/${quizId}/results`);
      return;
    }

    if (activity.type === "flashcard") {
      if (activity.documentId && activity.setId) {
        navigate(
          `/documents/${activity.documentId}/flashcards?set=${activity.setId}`,
        );
      } else {
        navigate(`/flashcards`);
      }
      return;
    }
  };

  // Sort by latest action first
  combinedActivities.sort(
    (a, b) => new Date(b.timestamp) - new Date(a.timestamp),
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-1 md:px-0">
      {/* Header Titles */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Track your learning progress and activity
        </p>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className="bg-white p-6 rounded-2xl border border-slate-200/80 flex items-center justify-between shadow-sm"
          >
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                {stat.label}
              </span>
              <p className="text-4xl font-semibold text-slate-900">
                {stat.value}
              </p>
            </div>
            <div
              className={`w-12 h-12 ${stat.bgIcon} flex items-center justify-center rounded-xl shrink-0`}
            >
              {stat.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Unified Recent Activity Section Card exactly mirroring image_a0eadf.jpg */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm flex flex-col overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-50 text-slate-700 flex items-center justify-center rounded-xl border border-slate-100">
            <Clock size={18} className="text-slate-600" />
          </div>
          <h2 className="font-bold text-slate-900 text-base">
            Recent Activity
          </h2>
        </div>

        {/* List Frame area */}
        <div className="p-5 space-y-4">
          {combinedActivities.length > 0 ? (
            combinedActivities.map((activity) => (
              <div
                key={activity.id}
                className="p-4 rounded-xl border border-slate-100 bg-white shadow-sm flex items-center justify-between gap-4 hover:border-slate-200/80 transition-all"
              >
                <div className="flex items-start gap-3 min-w-0">
                  {/* Status Indicator Bullet */}
                  <span
                    className={`w-2 h-2 rounded-full ${activity.dotColor} mt-2 shrink-0`}
                  ></span>
                  <div className="min-w-0">
                    <p className="text-[14px] font-medium text-slate-700 truncate">
                      {activity.title}
                    </p>
                    {activity.subtitle && (
                      <p className="text-[13px] text-slate-500 truncate mt-1">
                        {activity.subtitle}
                      </p>
                    )}
                    <span className="text-xs text-slate-400 block mt-1 font-normal">
                      {formatActivityDate(activity.timestamp)}
                    </span>
                  </div>
                </div>

                {/* View Link Action Trigger */}
                <button
                  type="button"
                  onClick={() => handleActivityView(activity)}
                  className="text-xs font-bold text-[#00b289] hover:text-[#009673] bg-emerald-50/40 hover:bg-emerald-50 px-3 py-1.5 rounded-lg transition-colors shrink-0"
                >
                  View
                </button>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-sm text-slate-400">
              No recent logs found. Start studying to update logs!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
