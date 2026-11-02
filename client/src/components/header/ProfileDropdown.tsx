import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, User, Settings, LogOut } from "lucide-react";

export default function ProfileDropdown() {
    const [open, setOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const dropdown = document.getElementById("profile-dropdown"); // get the dropdown element by its ID
            if (dropdown && !dropdown.contains(event.target as Node)) {
                dropdown.classList.add("hidden"); // hide the dropdown if the click is outside of it
            }
        };
        
        document.addEventListener("mousedown", handleClickOutside); // add an event listener to the document to detect clicks outside the dropdown
        return () => document.removeEventListener("mousedown", handleClickOutside); // cleanup the event listener when the component unmounts
    }, []);

    function handleMenuClick(path: string) {
        setOpen(false); // close the dropdown when a menu item is clicked
        navigate(path); // navigate to the specified path
    }

    function handleLogout() {
        setOpen(false); // close the dropdown when logging out
        // TODO: clear auth token, redirect to login
        navigate("/login"); // navigate to the login page after logging out
    }

    return (
        <div className="relative" ref={containerRef}>  {/* create a relative container for the profile dropdown */}
            <button
                type="button"
                onClick={() => setOpen((prev) => !prev)}
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200"
                aria-expanded={open}
                aria-haspopup="menu"
            >
                <img
                src="https://i.pravatar.cc/150?img=12"
                alt="Peter Gabrielle"
                className="w-8 h-8 rounded-full object-cover"
                />
                <span className="text-sm font-medium text-gray-900">
                Peter Gabrielle
                </span>
                <ChevronDown
                className={`w-4 h-4 text-gray-500 transition-transform ${
                    open ? "rotate-180" : ""
                }`}
                />  
            </button>

                  {/* DROPDOWN MENU */}
            {open && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50">
                {/* User info header */}
                <div className="px-3 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">Peter Gabrielle</p>
                    <p className="text-xs text-gray-500 truncate">
                    peter@example.com
                    </p>
                </div>

                {/* Menu items */}
                <button
                    onClick={() => handleMenuClick("/profile")}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                    <User className="w-4 h-4 text-gray-400" />
                    Profile
                </button>
                <button
                    onClick={() => handleMenuClick("/settings")}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                    <Settings className="w-4 h-4 text-gray-400" />
                    Settings
                </button>

                {/* Divider before logout */}
                <div className="my-1 border-t border-gray-100" />

                <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                    <LogOut className="w-4 h-4" />
                    Logout
                </button>
                </div>
                )}
        </div>
    );
}