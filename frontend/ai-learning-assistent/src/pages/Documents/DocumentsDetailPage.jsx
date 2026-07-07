import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import toast from "react-hot-toast";
import documentService from "../../services/documentService";
import Spinner from "../../components/common/Spinner";
import { ArrowLeft, ExternalLink } from "lucide-react";
import Tab from "../../components/common/Tab";
import PageHeader from "../../components/common/PageHeader";
import ChatInterface from "../../components/chat/ChatInterface";
import AIAction from "../../components/ai/AIAction";
import FlashCardTab from "../../components/flashcards/FlashCardTab";
import QuizTab from "../../components/quizzes/QuizTab";
const DocumentsDetailPage = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [document, setDocument] = useState(null);
  const [activeTab, setActiveTab] = useState("Content");

  useEffect(() => {
    const fetchDocument = async () => {
      setLoading(true);
      try {
        const data = await documentService.getDocumentById(id);
        setDocument(data);
        console.log(data);
        console.log(document);
      } catch (error) {
        toast.error("Failed to load Document");
      } finally {
        setLoading(false);
      }
    };
    fetchDocument();
  }, [id]);

  const getPdfUrl = () => {
    if (!document?.filePath) return null;
    const filePath = document.filePath;
    if (filePath.startsWith("http://") || filePath.startsWith("https://")) {
      return filePath;
    }
    const baseUrl = process.env.REACT_APP_API_URL || "http://localhost:8000";
    return `${baseUrl}${filePath.startsWith("/") ? "" : "/"}${filePath}`;
  };

  const renderContent = () => {
    if (loading) return <Spinner />;
    if (!document || !document.filePath)
      return <div className="p-4 text-slate-500">Document not found</div>;

    const pdfUrl = getPdfUrl();
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        {/* Header section with Link */}
        <div className="flex justify-between items-center mb-4">
          <span className="font-medium text-slate-700">Document Viewer</span>
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 text-sm font-medium"
          >
            <ExternalLink size={16} /> Open in new tab
          </a>
        </div>

        {/* PDF Iframe container with border */}
        <div className="w-full h-[700px] border border-slate-200 rounded-lg overflow-hidden bg-gray-50">
          <iframe
            src={pdfUrl}
            title="Document Viewer"
            className="w-full h-full"
            frameBorder="0"
            style={{ colorScheme: "light" }}
          />
        </div>
      </div>
    );
  };

  const renderChat = () => {
    return <ChatInterface />;
  };

  const renderAIActions = () => {
    return <AIAction documentId={document._id} />;
  };
  const renderFlashCardTab = () => {
    return <FlashCardTab documentId={document._id} />;
  };
  const renderQuizzesTab = () => {
    return <QuizTab documentId={document._id} />;
  };
  const tabs = [
    { name: "Content", label: "Content", content: renderContent },
    { name: "Chat", label: "Chat", content: renderChat },
    { name: "AI Actions", label: "AI Actions", content: renderAIActions },
    {
      name: "Flash Cards",
      label: "Flash Cards",
      content: renderFlashCardTab,
    },
    { name: "Quizzes", label: "Quizzes", content: renderQuizzesTab },
  ];

  if (loading) {
    return <Spinner />;
  }
  if (!document) {
    return <div className="p-4 text-slate-500">Document not found</div>;
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Link to="/documents" className="text-slate-500 hover:text-slate-700">
          <ArrowLeft size={16} />
          Back to Documents
        </Link>
      </div>
      <PageHeader title={document.title} />
      <Tab tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
};
export default DocumentsDetailPage;
