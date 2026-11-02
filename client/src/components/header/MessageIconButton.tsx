import { MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function MessagesIconButton() {
  const navigate = useNavigate();

  function handleClick() {
    navigate("/messages");
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Messages"
      className="flex items-center justify-center w-10 h-10 text-gray-600 rounded-lg transition-colors hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-200"
    >
      <MessageSquare className="w-5 h-5" />
    </button>
  );
}