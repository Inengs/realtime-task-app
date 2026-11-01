import { useRef, useEffect } from "react";
import { Search } from "lucide-react";

export default function SearchBar() {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="relative w-[360px]">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
      <input
        ref={inputRef}
        type="text"
        placeholder="Search..."
        className="w-full h-10 pl-10 pr-16 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100 transition-colors"
      />
      <kbd className="absolute right-3 top-1/2 -translate-y-1/2 bg-white border border-gray-200 rounded px-1.5 py-0.5 text-[10px] font-medium text-gray-500 pointer-events-none">
        ⌘K
      </kbd>
    </div>
  );
}