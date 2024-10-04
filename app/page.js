"use client";

import OpenAI from "openai";
import { useState, useRef, useEffect } from "react";
import ChatHistorySidebar from "./components/ChatHistorySidebar.jsx";

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

export default function Home() {
  const [userInput, setUserInput] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const chatEndRef = useRef(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatHistory]);

  const handleUserInput = async () => {
    if (!userInput.trim()) return;
    setIsLoading(true);
    setError(null);

    try {
      const userMessage = {
        role: "user",
        content: userInput,
        timestamp: Date.now(),
      };
      setChatHistory((prevChat) => [...prevChat, userMessage]);

      let retryCount = 0;
      let success = false;
      let chatCompletion;

      while (!success && retryCount < 3) {
        try {
          chatCompletion = await openai.chat.completions.create({
            messages: [...chatHistory, userMessage],
            model: "gpt-4",
          });
          success = true;
        } catch (error) {
          if (error.response && error.response.status === 429) {
            retryCount++;
            await new Promise((resolve) => setTimeout(resolve, 2000));
          } else {
            throw error;
          }
        }
      }

      if (!success) {
        throw new Error("Request exceeded the quota. Please try again later.");
      }

      const assistantMessage = {
        role: "assistant",
        content: chatCompletion.choices[0].message.content,
        timestamp: Date.now(),
      };
      setChatHistory((prevChat) => [...prevChat, assistantMessage]);

      setUserInput("");
    } catch (error) {
      setError(
        error.message || "Error connecting to the server. Please try again."
      );
      console.error("Error: ", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleUserInput();
    }
  };

  return (
    <div className="flex flex-col sm:flex-row min-h-screen">
      <ChatHistorySidebar chatHistory={chatHistory} />
      <div className="flex-1 flex flex-col justify-center items-center bg-gradient-to-bl from-pink-500 to-sky-500">
        <div className="w-full max-w-screen-md bg-white p-4 rounded-xl shadow-md border-4 animate-border-animate">
          <div className="mb-4">
            <div className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-sky-500 mb-2">
              Nexus Bot
            </div>
            <p className="text-slate-400 text-lg">
              Welcome to the Future of AI-powered assistant.
            </p>
          </div>
          {error && <div className="mb-4 text-red-500">{error}</div>}
          <div className="mb-4" style={{ height: "400px", overflow: "auto" }}>
            {chatHistory.map((message, index) => (
              <div
                key={index}
                className={`${
                  message.role === "user" ? "text-right" : "text-left"
                } mb-2`}
              >
                <div
                  className={`rounded-lg p-2 max-w-md mx-4 inline-block ${
                    message.role === "user"
                      ? "bg-violet-300 text-violet-800 font-semibold float-right"
                      : "bg-sky-300 text-sky-800 font-semibold"
                  }`}
                >
                  {message.role === "user" ? "You" : "Nexus"}
                </div>
                <div
                  className={`max-w-md mx-4 my-2 inline-block ${
                    message.role === "user"
                      ? "bg-violet-100 text-violet-800"
                      : "bg-sky-100 text-sky-800"
                  } p-2 rounded-md whitespace-pre-wrap`}
                >
                  {message.content}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          <div className="flex">
            <input
              type="text"
              placeholder="Ask me something..."
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 p-2 rounded-l-lg border"
            />
            {isLoading ? (
              <div className="bg-violet-500 text-white p-2 rounded-r-lg animate-pulse">
                Loading...
              </div>
            ) : (
              <button
                onClick={handleUserInput}
                className="bg-violet-500 text-violet-100 p-2 rounded-r-lg hover:bg-violet-600"
              >
                Ask
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
