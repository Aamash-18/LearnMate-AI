import React, { useState, useEffect } from "react";
import { Plus, Trash2, FileText, X, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast"; 

import documentService from "../../services/documentService";
import Button from "../../components/common/Button";
import Spinner from "../../components/common/Spinner";
import DocumentCard from "../../components/documents/DocumentCard";
import { Link } from "react-router-dom"; // Add this import

const DocumentListPage = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploading, setUploading] = useState(false);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);

  const fetchDocuments = async () => {
    try {
      const data = await documentService.getDocuments();
      setDocuments(data);
      console.log("Documents :- ", data);
    } catch (error) {
      toast.error("Failed to load documents.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadFile(file);
      setUploadTitle(file.name.replace(/\.[^/.]+$/, ""));
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadFile || !uploadTitle) {
      toast.error("Please provide a title and select a file.");
      return;
    }
    setUploading(true);
    const formData = new FormData();
    formData.append("file", uploadFile);
    formData.append("title", uploadTitle);

    try {
      await documentService.uploadDocument(formData);
      toast.success("Document uploaded successfully.");
      setUploadFile(null);
      setUploadTitle("");
      setIsUploadModalOpen(false);
      setLoading(true);
      await fetchDocuments();
    } catch (error) {
      toast.error("Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteRequest = (doc) => {
    setSelectedDoc(doc);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedDoc) return;
    setDeleting(true);
    try {
      await documentService.deleteDocument(selectedDoc._id);
      toast.success("Document deleted successfully.");
      setDocuments(documents.filter((d) => d._id !== selectedDoc._id));
      setIsDeleteModalOpen(false);
      setSelectedDoc(null);
    } catch (error) {
      toast.error("Deleting failed.");
    } finally {
      setDeleting(false);
    }
  };

  const renderContent = () => {
    if (loading) {
      return <Spinner />;
    }

    if (documents.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm mb-6">
            <FileText className="w-12 h-12 text-slate-300" strokeWidth={1.5} />
          </div>
          <h2 className="text-xl font-semibold text-slate-800 mb-2">
            No Documents Yet
          </h2>
          <p className="text-slate-500 mb-8 max-w-sm">
            Get started by uploading your first PDF document to begin learning.
          </p>
          <Button onClick={() => setIsUploadModalOpen(true)} className="gap-2">
            <Plus size={18} /> Upload Document
          </Button>
        </div>
      );
    }

    // Logic for when documents.length > 0 will go here
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {documents.map((doc) => (
          <DocumentCard
            key={doc._id}
            document={doc}
            onDelete={handleDeleteRequest}
          />
        ))}
      </div>
    );
  };
  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-medium text-slate-900">
              My Documents
            </h1>
            <p className="text-slate-500 text-sm">
              Manage and organize your learning materials
            </p>
          </div>
          <Button onClick={() => setIsUploadModalOpen(true)} className="gap-2">
            <Plus size={18} /> Upload Document
          </Button>
        </header>
        {renderContent()}
      </div>


      {isUploadModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-8 relative shadow-2xl">
            <button
              onClick={() => setIsUploadModalOpen(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-600"
            >
              <X size={20} />
            </button>

            <h2 className="text-2xl font-semibold text-slate-800 mb-2">
              Upload New Document
            </h2>
            <p className="text-slate-500 mb-6 text-sm">
              Add a PDF document to your library
            </p>

            <form onSubmit={handleUpload}>
              <div className="mb-6">
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-2">
                  Document Title
                </label>
                <input
                  type="text"
                  placeholder="e.g., React Interview Prep"
                  className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  required
                />
              </div>

              <div className="mb-6">
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-2">
                  PDF File
                </label>
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:border-emerald-500 transition-colors cursor-pointer relative">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center">
                    <div className="bg-emerald-50 p-3 rounded-xl mb-3">
                      <Plus className="text-emerald-500" size={24} />
                    </div>
                    <p className="text-emerald-600 font-medium text-sm">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-slate-400 text-xs mt-1">
                      PDF up to 10MB
                    </p>
                  </div>
                </div>
                {uploadFile && (
                  <p className="text-xs text-emerald-600 mt-2 font-medium">
                    Selected: {uploadFile.name}
                  </p>
                )}
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  className="flex-1"
                  onClick={() => setIsUploadModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1" disabled={uploading}>
                  {uploading ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    "Upload"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isDeleteModalOpen && selectedDoc && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm p-8 relative shadow-2xl text-center">
            {/* Trash Icon Container */}
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Trash2 className="text-red-500" size={32} />
            </div>

            <h2 className="text-2xl font-semibold text-slate-800 mb-4">
              Confirm Deletion
            </h2>
            <p className="text-slate-600 mb-8 text-sm leading-relaxed">
              Are you sure you want to delete the document:
              <span className="font-bold text-slate-800 block mt-1">
                {selectedDoc.title}
              </span>
              This action cannot be undone.
            </p>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="secondary"
                className="flex-1"
                onClick={() => setIsDeleteModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                className="flex-1 bg-red-500 hover:bg-red-600 border-red-500"
                onClick={handleConfirmDelete}
                disabled={deleting}
              >
                {deleting ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  "Delete"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentListPage;
