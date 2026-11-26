import React from "react";
import { FileText, BookOpen, BrainCircuit, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const formatFileSize = (bytes) => {
  if (!bytes) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
};

const DocumentCard = ({ document, onDelete }) => {
  const navigate = useNavigate(); 

  const handleNavigate = () => {
    navigate(`/documents/${document._id}`);
  };

  return (
    <div
      onClick={handleNavigate}
      className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-1 hover:border-emerald-200 transition-all duration-300 ease-out cursor-pointer"
    >
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-emerald-50 rounded-xl">
            <FileText className="w-6 h-6 text-emerald-500" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800">{document.title}</h3>
            <p className="text-xs text-slate-400 mt-1">
              {formatFileSize(document.fileSize)}
            </p>
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(document);
          }}
          className="text-slate-400 hover:text-red-500 transition-colors"
        >
          <Trash2 size={18} />
        </button>
      </div>

      <div className="flex gap-2 mb-6">
        <div className="flex items-center gap-1 bg-purple-50 text-purple-700 px-2 py-1 rounded-md text-xs font-medium">
          <BookOpen size={14} /> {document.flashCardsCount || 0} Flashcards
        </div>
        <div className="flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2 py-1 rounded-md text-xs font-medium">
          <BrainCircuit size={14} /> {document.quizCount || 0} Quizzes
        </div>
      </div>

      <div className="pt-4 border-t border-slate-50 text-slate-400 text-xs">
        <span>
          🕒 Uploaded {new Date(document.createdAt).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
};

export default DocumentCard;
