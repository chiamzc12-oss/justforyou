import { Camera, CalendarHeart, Gamepad2, Stars, MailOpen } from "lucide-react";

interface NavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onUploadClick: () => void;
}

export function Navigation({ activeTab, setActiveTab, onUploadClick }: NavProps) {
  const navItems = [
    { id: "gallery", label: "Gallery", icon: Camera },
    { id: "letter", label: "Wish", icon: MailOpen },
    { id: "minigame", label: "Minigame", icon: Gamepad2 },
  ];

  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white/80 backdrop-blur-md px-6 py-4 rounded-full shadow-xl border border-pink-100 flex items-center gap-6 z-50">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center gap-1 transition-all duration-300 ${
              isActive ? "text-primary-pink scale-110" : "text-gray-400 hover:text-primary-pink/70"
            }`}
          >
            <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
            <span className="text-[10px] uppercase tracking-wider font-bold">
              {item.label}
            </span>
          </button>
        );
      })}
      
      <div className="w-px h-8 bg-pink-200 mx-2" />
      
      <button
        onClick={onUploadClick}
        className="flex items-center gap-2 bg-gradient-to-r from-primary-pink to-pink-400 text-white px-5 py-2.5 rounded-full font-bold shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300 transform active:scale-95"
      >
        <Stars size={18} />
        <span className="text-sm">Add Memory</span>
      </button>
    </nav>
  );
}
