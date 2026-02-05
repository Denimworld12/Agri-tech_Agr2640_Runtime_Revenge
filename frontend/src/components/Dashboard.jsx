import React from "react";
import { ChatProvider } from "../hooks/useChat";
import MainChatbot from "./chatbot/main";

const Dashboard = () => {
  return (
    <ChatProvider>
      <MainChatbot />
    </ChatProvider>
  );
};

export default Dashboard;

