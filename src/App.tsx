import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ImperiumAudioEngine } from './audio/ImperiumAudioEngine';
import { CodexDrawer } from './components/CodexDrawer';
import { ControlDock } from './components/ControlDock';
import { CombatActionType, ImperiumViewport } from './components/ImperiumViewport';
import { CodexSection, TopBar } from './components/TopBar';
import {
  CHARACTERS,
  CharacterId,
  REALMS,
  RealmId,
  WeaponForm,
} from './data/imperiumLore';

export default function App() {
  const [activeChar, setActiveChar] = useState<CharacterId>('enes');
  const [activeRealm, setActiveRealm] = useState<RealmId>('nexus');
  const [weaponForms, setWeaponForms] = useState<Record<CharacterId, WeaponForm>>({
    enes: 'primary',
    demirhan: 'primary',
    selinay: 'primary',
  });
  const [activeSection, setActiveSection] = useState<CodexSection>('arena');
  const [dockCollapsed, setDockCollapsed] = useState(false);
  const [zeroUi, setZeroUi] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [combatNotice, setCombatNotice] = useState<string | null>(
    'WASD ile hareket edin · J / K ile saldırın · F ile silah dönüştürün · 1-2-3 ile Ortak Kavuşum geçişi yapın'
  );

  const audioEngine = useMemo(() => new ImperiumAudioEngine(), []);
  const actionTriggerRef = useRef<((action: CombatActionType) => void) | null>(null);
  const noticeTimeoutRef = useRef<number | null>(null);

  const pushNotice = useCallback((msg: string) => {
    setCombatNotice(msg);
    if (noticeTimeoutRef.current !== null) {
      window.clearTimeout(noticeTimeoutRef.current);
    }
    noticeTimeoutRef.current = window.setTimeout(() => {
      setCombatNotice(null);
    }, 3600);
  }, []);

  useEffect(() => {
    const initialTimer = window.setTimeout(() => {
      setCombatNotice(null);
    }, 6500);
    return () => {
      window.clearTimeout(initialTimer);
      if (noticeTimeoutRef.current !== null) {
        window.clearTimeout(noticeTimeoutRef.current);
      }
      audioEngine.dispose();
    };
  }, [audioEngine]);

  // Global 'H' key toggles Zero-UI Diegetic Mode
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.code === 'KeyH') {
        setZeroUi((prev) => !prev);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const handleSwitchCharacter = useCallback(
    (id: CharacterId) => {
      audioEngine.unlockAndStart(id);
      setActiveChar(id);
    },
    [audioEngine]
  );

  const handleSelectRealm = useCallback(
    (id: RealmId) => {
      audioEngine.unlockAndStart(activeChar);
      setActiveRealm(id);
    },
    [audioEngine, activeChar]
  );

  const handleToggleWeaponForm = useCallback(() => {
    setWeaponForms((prev) => {
      const nextForm: WeaponForm = prev[activeChar] === 'primary' ? 'secondary' : 'primary';
      const spec = CHARACTERS[activeChar];
      pushNotice(
        `${spec.name} · ${
          nextForm === 'primary' ? spec.primaryFormName : spec.secondaryFormName
        }`
      );
      return { ...prev, [activeChar]: nextForm };
    });
  }, [activeChar, pushNotice]);

  const handleSetWeaponForm = useCallback(
    (id: CharacterId, form: WeaponForm) => {
      audioEngine.unlockAndStart(id);
      audioEngine.playTransform(id, form);
      setWeaponForms((prev) => ({ ...prev, [id]: form }));
    },
    [audioEngine]
  );

  const handleCombatAction = useCallback((action: CombatActionType) => {
    actionTriggerRef.current?.(action);
  }, []);

  const handleCombatEvent = useCallback(
    (evt: { type: 'conjunction' | 'hit' | 'transform' | 'realm'; label: string }) => {
      if (evt.type === 'conjunction' || evt.type === 'realm') {
        pushNotice(evt.label);
      }
    },
    [pushNotice]
  );

  const handleToggleMute = useCallback(() => {
    audioEngine.unlockAndStart(activeChar);
    const next = !isMuted;
    audioEngine.setMuted(next);
    setIsMuted(next);
  }, [audioEngine, activeChar, isMuted]);

  const charSpec = CHARACTERS[activeChar];
  const realmSpec = REALMS[activeRealm];

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-[#090A0F]">
      {/* 100% Unobstructed 3D Cyber-Baroque Action Arena */}
      <ImperiumViewport
        activeChar={activeChar}
        activeRealm={activeRealm}
        weaponForms={weaponForms}
        audioEngine={audioEngine}
        onSwitchCharacter={handleSwitchCharacter}
        onToggleWeaponForm={handleToggleWeaponForm}
        onCombatEvent={handleCombatEvent}
        actionTriggerRef={actionTriggerRef}
      />

      {/* Top Bar (3-Zone Contract) */}
      <TopBar
        activeSection={activeSection}
        zeroUi={zeroUi}
        onSelectSection={setActiveSection}
        onToggleZeroUi={() => setZeroUi((prev) => !prev)}
      />

      {/* Quiet Editorial Corner Anchor (Clean Unboxed Typography, zero pills) */}
      {!zeroUi && (
        <div className="fixed top-[72px] left-6 z-10 pointer-events-none max-w-md">
          <p className="text-xs text-[#D4AF37] tracking-wide">
            {realmSpec.index}. {realmSpec.name} · {realmSpec.subtitle}
          </p>
          <h1 className="font-display text-xl md:text-2xl font-semibold text-[#F4EFE6] tracking-tight mt-0.5">
            {charSpec.name}
          </h1>
          <p className="text-xs text-[#A8B0C2] mt-0.5">
            {charSpec.title} · {charSpec.domain}
          </p>
        </div>
      )}

      {/* Codex Lore / Character / Weapon / Realm Drawer */}
      {!zeroUi && (
        <CodexDrawer
          section={activeSection}
          activeChar={activeChar}
          activeRealm={activeRealm}
          weaponForms={weaponForms}
          onClose={() => setActiveSection('arena')}
          onSelectChar={handleSwitchCharacter}
          onSelectRealm={handleSelectRealm}
          onSetWeaponForm={handleSetWeaponForm}
        />
      )}

      {/* Unified Collapsible Bottom Control Dock */}
      <ControlDock
        activeChar={activeChar}
        activeRealm={activeRealm}
        weaponForms={weaponForms}
        dockCollapsed={dockCollapsed}
        zeroUi={zeroUi}
        isMuted={isMuted}
        combatNotice={combatNotice}
        onToggleCollapse={() => setDockCollapsed((prev) => !prev)}
        onSwitchChar={handleSwitchCharacter}
        onSelectRealm={handleSelectRealm}
        onToggleWeapon={() => {
          audioEngine.unlockAndStart(activeChar);
          const nextForm: WeaponForm =
            weaponForms[activeChar] === 'primary' ? 'secondary' : 'primary';
          audioEngine.playTransform(activeChar, nextForm);
          handleToggleWeaponForm();
        }}
        onCombatAction={handleCombatAction}
        onToggleMute={handleToggleMute}
        onExitZeroUi={() => setZeroUi(false)}
      />
    </main>
  );
}
