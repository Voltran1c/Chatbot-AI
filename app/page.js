"use client";

import OpenAI from "openai";
import { useState } from "react";

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

export default function Home() {
  const [userInput, setUserInput] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleUserInput = async () => {
    if (!userInput.trim()) return;
    setIsLoading(true);
    setError(null);

    try {
      setChatHistory((prevChat) => [
        ...prevChat,
        { role: "user", content: userInput },
      ]);

      let retryCount = 0;
      let success = false;
      let chatCompletion;

      while (!success && retryCount < 3) {
        try {
          chatCompletion = await openai.chat.completions.create({
            messages: [...chatHistory, { role: "user", content: userInput }],
            model: "gpt-4o",
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

      setChatHistory((prevChat) => [
        ...prevChat,
        {
          role: "assistant",
          content: chatCompletion.choices[0].message.content,
        },
      ]);

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
    <>
      <div className="bg-gradient-to-bl from-pink-500 to-sky-500 min-h-screen flex flex-col justify-center items-center">
        <div className="w-full max-w-screen-md bg-white p-4 rounded-xl shadow-md border-4 border-slate-300">
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
                      ? "bg-blue-300 text-blue-800 font-semibold float-right"
                      : "bg-green-300 text-green-800 font-semibold"
                  }`}
                >
                  {message.role === "user" ? "You" : "Nexus"}
                </div>
                <div
                  className={`max-w-md mx-4 my-2 inline-block ${
                    message.role === "user"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-green-100 text-green-800"
                  } p-2 rounded-md whitespace-pre-wrap`}
                >
                  {message.content}
                </div>
              </div>
            ))}
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
              <div className="bg-green-500 text-white p-2 rounded-r-lg animate-pulse">
                Loading...
              </div>
            ) : (
              <button
                onClick={handleUserInput}
                className="bg-blue-500 text-white p-2 rounded-r-lg hover:bg-blue-600"
              >
                Ask
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
