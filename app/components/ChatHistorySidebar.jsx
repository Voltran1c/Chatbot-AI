import React, { useEffect, useRef } from "react";

const ChatHistorySidebar = ({ chatHistory }) => {
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatHistory]);

  return (
    <div className="flex flex-col bg-gray-100 p-4 w-full sm:w-1/3 lg:w-1/4 h-screen shadow-md border-r-4 animate animate-border-animate">
      <h2 className="text-2xl font-bold uppercase text-gray-700 mb-4 text-center bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-violet-500">
        chat history
      </h2>
      <div className="overflow-y-auto flex-1 space-y-2">
        {chatHistory.length === 0 ? (
          <p className="text-slate-400 text-lg">No chat history yet.</p>
        ) : (
          [...chatHistory].reverse().map((message, index) => (
            <div
              key={index}
              className={`${
                message.role === "user"
                  ? "bg-violet-100 text-gray-500"
                  : "bg-sky-100 text-gray-500"
              } p-2 rounded-lg shadow-sm whitespace-pre-wrap`}
            >
              <strong>{message.role === "user" ? "You" : "Nexus"}: </strong>
              <p>{message.content}</p>
              <span className="text-xs text-gray-400">
                {message.timestamp
                  ? new Date(message.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "Invalid time"}
              </span>
            </div>
          ))
        )}
        <div ref={chatEndRef} />
      </div>
    </div>
  );
};

export default ChatHistorySidebar;
