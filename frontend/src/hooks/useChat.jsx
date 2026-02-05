import { createContext, useContext, useEffect, useState } from "react";

const backendUrl = "https://hackvision-2026-agritech-kjlk.onrender.com";

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const chat = async (message) => {
    setLoading(true);
    try {
  const token = localStorage.getItem("authToken"); // 👈 get token

  const response = await fetch(`${backendUrl}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    },
    body: JSON.stringify({ message }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();

  let resp;
  if (data.messages && Array.isArray(data.messages)) {
    resp = data.messages;
  } else if (Array.isArray(data)) {
    resp = data;
  } else {
    resp = [data];
  }

  setMessages((messages) => [...messages, ...resp]);
} catch (error) {
      console.error("Chat error:", error);
      // Add error message to chat
      setMessages((messages) => [
        ...messages,
        {
          text: "Sorry, I couldn't connect to the server. Please check if the backend is running.",
          audio: null,
          lipsync: null,
          facialExpression: "sad",
          animation: "Idle",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState();
  const [loading, setLoading] = useState(false);
  const [cameraZoomed, setCameraZoomed] = useState(true);

  const onMessagePlayed = () => {
    setMessages((messages) => messages.slice(1));
  };

  useEffect(() => {
    if (messages.length > 0) {
      setMessage(messages[0]);
    } else {
      setMessage(null);
    }
  }, [messages]);

  return (
    <ChatContext.Provider
      value={{
        chat,
        message,
        onMessagePlayed,
        loading,
        cameraZoomed,
        setCameraZoomed,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};