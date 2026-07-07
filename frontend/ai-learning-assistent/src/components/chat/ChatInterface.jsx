import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Send, MessageSquare, Sparkles } from "lucide-react";
import aiService from "../../services/aiService";
import Spinner from "../common/Spinner";
import MarkdownRenderer from "../common/MarkdownRenderer";

const ChatInterface = () => {
  const { user } = useAuth();
  const { id: documentId } = useParams();
  const [message, setMessage] = useState("");
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    const fetchInitialHistory = async () => {
      setInitialLoading(true);
      try {
        const initialHistory = await aiService.getChatHistory(documentId);
        setHistory(initialHistory.data?.messages || []);
      } catch (error) {
        console.error("Failed to load chat history", error);
        setHistory([]);
      } finally {
        setInitialLoading(false);
      }
    };

    fetchInitialHistory();
  }, [documentId]);

  useEffect(() => {
    scrollToBottom();
  }, [history]);

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!message.trim()) return;

    const userMessage = {
      role: "user",
      content: message,
      timestamp: new Date(),
    };

    setHistory((prev) => [...prev, userMessage]);
    setMessage("");
    setLoading(true);

    try {
      const response = await aiService.chat(documentId, userMessage.content);

      const aiMessage = {
        role: "assistant",
        content: response.data.answer,
        timestamp: new Date(),
        relevantChunk: response.data.relevantChunks,
      };

      setHistory((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Failed to send message", error);

      const errorMessage = {
        role: "assistant",
        content: "Sorry, something went wrong. Please try again.",
        timestamp: new Date(),
      };

      setHistory((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const renderMessage = (msg, index) => {
    const isUser = msg.role === "user";
    return (
      <div
        key={index}
        className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}
      >
        <div
          className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
            isUser
              ? "bg-teal-500 text-white rounded-br-none"
              : "bg-gray-200 text-gray-900 rounded-bl-none"
          }`}
        >
          <div className="text-sm leading-relaxed">
            {isUser ? (
              <p>{msg.content}</p>
            ) : (
              <MarkdownRenderer content={msg.content} />
            )}
          </div>
          <p
            className={`text-xs mt-2 ${
              isUser ? "text-teal-100" : "text-gray-500"
            }`}
          >
            {new Date(msg.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
      </div>
    );
  };

  if (initialLoading) {
    return (
      <div className="flex flex-col h-full items-center justify-center">
        <Spinner loading={true} />
        <p className="mt-4 text-gray-600">Loading Chat History...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen md:h-full bg-white">
      {/* Messages Area - Fixed height with internal scroll */}
      <div className="flex-1 overflow-y-auto p-3 md:p-6 space-y-4 min-h-0">
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="bg-gray-100 p-4 rounded-full mb-4">
              <MessageSquare
                className="w-6 md:w-8 h-6 md:h-8 text-gray-400"
                strokeWidth={2}
              />
            </div>
            <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2">
              Start a conversation
            </h3>
            <p className="text-sm md:text-base text-gray-600 max-w-sm">
              Ask me anything about the document!
            </p>
          </div>
        ) : (
          <>
            {history.map((msg, index) => renderMessage(msg, index))}
            {loading && (
              <div className="flex justify-start mb-4">
                <div className="bg-gray-200 rounded-lg rounded-bl-none px-4 py-3">
                  <div className="flex space-x-2">
                    <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" />
                    <span
                      className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    />
                    <span
                      className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    />
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area - Sticky at bottom */}
      <div className="border-t border-gray-200 p-3 md:p-6 bg-white flex-shrink-0">
        <form
          onSubmit={handleSendMessage}
          className="flex items-center gap-2 md:gap-3"
        >
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask a follow-up question..."
            className="flex-1 px-3 md:px-4 py-2 md:py-3 text-sm md:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
            disabled={loading}
          />
          <button
            type="submit"
            className="bg-teal-500 hover:bg-teal-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white p-2 md:p-3 rounded-lg transition flex items-center justify-center flex-shrink-0"
            disabled={loading || !message.trim()}
          >
            <Send className="w-4 md:w-5 h-4 md:h-5" strokeWidth={2} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;
