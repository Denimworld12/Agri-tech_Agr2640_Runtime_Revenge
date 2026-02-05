import { ChatProvider } from "../hooks/useChat";
import MainChatbot from "./chatbot/main";
const Dashboard = ({ language = "en" }) => {

  return (
    <>
      <ChatProvider>
        <MainChatbot />
      </ChatProvider>
    </>

  );
};

export default Dashboard;
