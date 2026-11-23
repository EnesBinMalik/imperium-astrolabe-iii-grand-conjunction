import React from 'react';
import {
  ChevronDown,
  ChevronUp,
  Volume2,
  VolumeX,
  Swords,
  Zap,
  Wind,
  ArrowUp,
  RefreshCw,
} from 'lucide-react';
import {
  CHARACTERS,
  CHARACTER_ORDER,
  CharacterId,
  REALMS,
  REALM_ORDER,
  RealmId,
  WeaponForm,
} from '../data/imperiumLore';
import { CombatActionType } from './ImperiumViewport';

interface ControlDockProps {
  activeChar: CharacterId;
  activeRealm: RealmId;
  weaponForms: Record<CharacterId, WeaponForm>;
  dockCollapsed: boolean;
  zeroUi: boolean;
  isMuted: boolean;
  combatNotice: string | null;
  onToggleCollapse: () => void;
  onSwitchChar: (id: CharacterId) => void;
  onSelectRealm: (id: RealmId) => void;
  onToggleWeapon: () => void;
  onCombatAction: (action: CombatActionType) => void;
  onToggleMute: () => void;
  onExitZeroUi: () => void;
}

export const ControlDock: React.FC<ControlDockProps> = ({
  activeChar,
  activeRealm,
  weaponForms,
  dockCollapsed,
  zeroUi,
  isMuted,
  combatNotice,
  onToggleCollapse,
  onSwitchChar,
  onSelectRealm,
  onToggleWeapon,
  onCombatAction,
  onToggleMute,
  onExitZeroUi,
}) => {
  const charSpec = CHARACTERS[activeChar];
  const currentForm = weaponForms[activeChar];
  const activeWeaponName =
    currentForm === 'primary' ? charSpec.primaryFormName : charSpec.secondaryFormName;

  if (zeroUi) {
    return (
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-4">
        <button
          type="button"
          onClick={onExitZeroUi}
          className="px-4 py-2 text-xs font-medium text-[#F4EFE6]/80 hover:text-[#F4EFE6] bg-[#090A0F]/75 border border-[#D4AF37]/25 rounded-lg transition-opacity opacity-55 hover:opacity-100 whitespace-nowrap shrink-0 cursor-pointer"
        >
          Arayüzü Göster (H)
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center w-[min(960px,95vw)] pointer-events-none">
      {/* Subtle transient combat / conjunction notice (disappears automatically, zero clutter) */}
      {combatNotice && !dockCollapsed && (
        <div className="mb-2 px-3.5 py-1.5 bg-[#0B0D14]/92 border border-[#D4AF37]/30 rounded-lg text-xs text-[#F4EFE6] tracking-wide pointer-events-auto">
          {combatNotice}
        </div>
      )}

      {/* Collapse / Expand Handle */}
      <button
        type="button"
        onClick={onToggleCollapse}
        className="pointer-events-auto flex items-center gap-1.5 px-3.5 py-1 text-xs font-medium text-[#D4AF37] bg-[#0B0D14]/95 border border-b-0 border-[#D4AF37]/25 rounded-t-lg hover:bg-[#141724] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
      >
        {dockCollapsed ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        <span>{dockCollapsed ? 'Kontrolleri Göster' : 'Kontrolleri Gizle'}</span>
      </button>

      {/* Main Unified Bottom Control Dock */}
      <div
        className={`pointer-events-auto w-full bg-[#0B0D14]/95 border border-[#D4AF37]/25 rounded-xl p-3 transition-transform duration-200 ease-out ${
          dockCollapsed ? 'translate-y-[120%] opacity-0 pointer-events-none h-0 p-0 overflow-hidden border-0' : 'translate-y-0 opacity-100'
        }`}
      >
        <div className="flex flex-col gap-2.5">
          {/* Row 1: Protagonist Tag-Team Switcher + Transforming Weapon + Audio */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            {/* Character Switcher */}
            <div className="flex items-center gap-1 bg-[#121521] p-1 rounded-lg border border-white/5">
              {CHARACTER_ORDER.map((cid) => {
                const c = CHARACTERS[cid];
                const isSelected = activeChar === cid;
                return (
                  <button
                    key={cid}
                    type="button"
                    onClick={() => onSwitchChar(cid)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      isSelected
                        ? 'bg-[#D4AF37] text-[#090A0F] font-semibold'
                        : 'text-[#A8B0C2] hover:text-[#F4EFE6] hover:bg-white/5'
                    }`}
                  >
                    <span className="font-mono-tabular opacity-75">{c.keyNumber}</span>
                    <span>{c.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Active Weapon Transform Button */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onToggleWeapon}
                className="flex items-center gap-2 px-3.5 py-1.5 bg-[#161A29] hover:bg-[#1E2438] border border-[#D4AF37]/30 rounded-lg text-xs font-medium text-[#F4EFE6] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span className="truncate max-w-[210px]">{activeWeaponName}</span>
                <span className="font-mono-tabular text-[#D4AF37] opacity-80">F</span>
              </button>

              <button
                type="button"
                onClick={onToggleMute}
                aria-label={isMuted ? 'Sesi Aç' : 'Sesi Kapat'}
                className="p-2 bg-[#161A29] hover:bg-[#1E2438] border border-white/10 rounded-lg text-[#D4AF37] transition-colors cursor-pointer shrink-0"
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Row 2: Combat Controls + 5 Seamless Realms */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/8">
            {/* Direct Combat Action Triggers */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => onCombatAction('attack')}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#181C2B] hover:bg-[#23283D] border border-white/10 rounded-md text-xs font-medium text-[#F4EFE6] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Swords className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Saldırı</span>
                <span className="font-mono-tabular text-[11px] text-[#A8B0C2]">J</span>
              </button>
              <button
                type="button"
                onClick={() => onCombatAction('heavy')}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#181C2B] hover:bg-[#23283D] border border-white/10 rounded-md text-xs font-medium text-[#F4EFE6] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 text-[#EA580C]" />
                <span>Ağır / Kaldır</span>
                <span className="font-mono-tabular text-[11px] text-[#A8B0C2]">K</span>
              </button>
              <button
                type="button"
                onClick={() => onCombatAction('dash')}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#181C2B] hover:bg-[#23283D] border border-white/10 rounded-md text-xs font-medium text-[#F4EFE6] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Wind className="w-3.5 h-3.5 text-[#38BDF8]" />
                <span>Atılma</span>
                <span className="font-mono-tabular text-[11px] text-[#A8B0C2]">Shift</span>
              </button>
              <button
                type="button"
                onClick={() => onCombatAction('jump')}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#181C2B] hover:bg-[#23283D] border border-white/10 rounded-md text-xs font-medium text-[#F4EFE6] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <ArrowUp className="w-3.5 h-3.5 text-[#A8B0C2]" />
                <span>Zıpla</span>
                <span className="font-mono-tabular text-[11px] text-[#A8B0C2]">Space</span>
              </button>
            </div>

            {/* 5 Seamless Realms Segmented Selector */}
            <div className="flex items-center gap-1 bg-[#121521] p-1 rounded-lg border border-white/5 overflow-x-auto max-w-full">
              {REALM_ORDER.map((rid) => {
                const r = REALMS[rid];
                const isSelected = activeRealm === rid;
                return (
                  <button
                    key={rid}
                    type="button"
                    onClick={() => onSelectRealm(rid)}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      isSelected
                        ? 'bg-[#252B3F] text-[#D4AF37] border border-[#D4AF37]/35'
                        : 'text-[#A8B0C2] hover:text-[#F4EFE6]'
                    }`}
                  >
                    <span className="font-mono-tabular mr-1 opacity-70">{r.index}</span>
                    <span>{r.name.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
