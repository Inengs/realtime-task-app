import { useLocation } from "react-router-dom";
import SearchBar from "./SearchBar";
import { routes } from "../../config/routes";
import SettingsIconButton from "./SettingsIconButton";
import InfoIconButton from "./InfoIconButton";
import MessagesIconButton from "./MessageIconButton";
import NotificationsIconButton from "./NotificationsIconButton";
import ProfileDropdown from "./ProfileDropdown";

export default function Header() {
  const location = useLocation();

  // Find the matching route config; fall back to a default if none match
  const current = routes.find((r) => r.path === location.pathname) ?? {
    title: "TaskFlow",
    description: "Real-time task management for modern teams",
  };

  return (
    <header className="sticky top-0 z-30 flex items-center w-full h-16 px-6 bg-white border-b border-gray-200">
      {/* LEFT: page title + description */}
      <div className="flex flex-col">
        <h1 className="text-base font-semibold text-gray-900 leading-tight">
          {current.title}
        </h1>
        <p className="text-xs text-gray-500 leading-tight">
          {current.description}
        </p>
      </div>

      {/* CENTER: search bar (mx-auto pushes it to center) */}
      <div className="mx-auto">
        <SearchBar />
      </div>

      {/* RIGHT: icons + profile will go here later */}
      <div className="flex items-center gap-1">
        <InfoIconButton />
        <MessagesIconButton />
        <SettingsIconButton />
        <NotificationsIconButton />

        {/* Divider between icons and profile */}
        <div className="w-px h-6 bg-gray-200 mx-2" />

        <ProfileDropdown />
      </div>
    </header>
  );
}