import { Info } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function InfoIconButton() {
  const navigate = useNavigate();

  function handleClick() {
    navigate("/help");  // you already have "/help" in your routes config
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Help Center"
      className="flex items-center justify-center w-10 h-10 text-gray-600 rounded-lg transition-colors hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-200"
    >
      <Info className="w-5 h-5" />
    </button>
  );
}