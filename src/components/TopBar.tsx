import React from 'react';

export type CodexSection = 'arena' | 'karakterler' | 'silahlar' | 'diyarlar';

interface TopBarProps {
  activeSection: CodexSection;
  zeroUi: boolean;
  onSelectSection: (section: CodexSection) => void;
  onToggleZeroUi: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeSection,
  zeroUi,
  onSelectSection,
  onToggleZeroUi,
}) => {
  const navItems: { id: CodexSection; label: string }[] = [
    { id: 'arena', label: 'Arena' },
    { id: 'karakterler', label: 'Karakterler' },
    { id: 'silahlar', label: 'Silahlar' },
    { id: 'diyarlar', label: 'Diyarlar' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-20 flex items-center justify-between gap-8 px-6 py-3.5 bg-[#090A0F]/92 border-b border-[#D4AF37]/20 transition-transform duration-200 ease-out ${
        zeroUi ? '-translate-y-full opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'
      }`}
    >
      {/* Zone 1: Single text element wordmark */}
      <button
        type="button"
        onClick={() => onSelectSection('arena')}
        className="font-display text-base md:text-lg font-semibold tracking-wide text-[#F4EFE6] hover:text-[#D4AF37] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
      >
        Imperium Astrolabe III
      </button>

      {/* Zone 2: 4 clean single-line navigation links */}
      <nav className="hidden md:flex items-center gap-7 text-sm font-medium">
        {navItems.map((item) => {
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectSection(item.id)}
              className={`py-1 border-b transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                isActive
                  ? 'text-[#D4AF37] border-[#D4AF37]'
                  : 'text-[#A8B0C2] border-transparent hover:text-[#F4EFE6] hover:border-[#F4EFE6]/30'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Zone 3: 1 primary action */}
      <div className="flex items-center shrink-0">
        <button
          type="button"
          onClick={onToggleZeroUi}
          className="px-4 py-2 text-xs font-semibold text-[#090A0F] bg-[#D4AF37] rounded-lg hover:bg-[#E5C158] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          Sıfır Arayüz
        </button>
      </div>
    </header>
  );
};
