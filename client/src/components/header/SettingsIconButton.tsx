import { Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function SettingsIconButton() {
  const navigate = useNavigate(); // get the navigate function from react-router-dom to programmatically navigate to a different route

  function handleClick() {
    navigate("/settings"); // navigate to the settings page when the button is clicked
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Settings"
      className="flex items-center justify-center w-10 h-10 text-gray-600 rounded-lg transition-colors hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-200"
    >
      <Settings className="w-5 h-5" />
    </button>
  );
}