import React from 'react';
import { X } from 'lucide-react';
import {
  CHARACTERS,
  CHARACTER_ORDER,
  CharacterId,
  REALMS,
  REALM_ORDER,
  RealmId,
  WeaponForm,
} from '../data/imperiumLore';
import { CodexSection } from './TopBar';

interface CodexDrawerProps {
  section: CodexSection;
  activeChar: CharacterId;
  activeRealm: RealmId;
  weaponForms: Record<CharacterId, WeaponForm>;
  onClose: () => void;
  onSelectChar: (id: CharacterId) => void;
  onSelectRealm: (id: RealmId) => void;
  onSetWeaponForm: (id: CharacterId, form: WeaponForm) => void;
}

export const CodexDrawer: React.FC<CodexDrawerProps> = ({
  section,
  activeChar,
  activeRealm,
  weaponForms,
  onClose,
  onSelectChar,
  onSelectRealm,
  onSetWeaponForm,
}) => {
  if (section === 'arena') return null;

  return (
    <aside className="fixed top-[57px] right-0 bottom-0 z-20 w-full max-w-[460px] bg-[#0B0D14]/96 border-l border-[#D4AF37]/25 overflow-y-auto p-6 text-[#F4EFE6]">
      <div className="flex items-start justify-between gap-4 pb-5 border-b border-white/10">
        <div>
          <p className="text-xs text-[#D4AF37] tracking-wide mb-1">
            Enes Öztürk İmzalı Üçleme Finali
          </p>
          <h2 className="font-display text-2xl font-semibold text-[#F4EFE6]">
            {section === 'karakterler' && 'Üç Efsanevi Karakter'}
            {section === 'silahlar' && 'Dönüşebilir İmparatorluk Silahları'}
            {section === 'diyarlar' && 'Beş Kesintisiz İmparatorluk Diyarı'}
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Kapat"
          className="p-2 text-[#A8B0C2] hover:text-[#F4EFE6] bg-[#141724] rounded-lg border border-white/10 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Section: Karakterler */}
      {section === 'karakterler' && (
        <div className="mt-6 space-y-6">
          <p className="text-sm leading-relaxed text-[#A8B0C2]">
            Kara Güneş Gözlemevi’ndeki mührün kırılmasıyla Zaman, Mekân ve Madde çarkları
            yörüngelerinden saptı. Tek tuşla anlık geçiş yaparak üç ustayı tek bir
            kombo akışında birleştirin.
          </p>

          {CHARACTER_ORDER.map((cid) => {
            const c = CHARACTERS[cid];
            const isSelected = activeChar === cid;
            return (
              <div
                key={cid}
                className={`p-5 rounded-xl border transition-colors ${
                  isSelected
                    ? 'bg-[#141826] border-[#D4AF37]/50'
                    : 'bg-[#0F121C] border-white/8'
                }`}
              >
                <div className="flex items-baseline justify-between gap-2 mb-1">
                  <h3 className="font-display text-lg font-semibold text-[#F4EFE6]">
                    {c.name}
                  </h3>
                  <span className="font-mono-tabular text-xs text-[#D4AF37]">
                    Tuş {c.keyNumber}
                  </span>
                </div>
                <p className="text-xs text-[#A8B0C2] mb-3">
                  {c.title} · {c.domain}
                </p>
                <p className="text-sm text-[#D6DCE8] leading-relaxed mb-3">
                  {c.appearance}
                </p>
                <div className="space-y-1.5 text-xs text-[#A8B0C2] pt-3 border-t border-white/8">
                  <p>
                    <span className="text-[#F4EFE6] font-medium">Diegetik Gösterge: </span>
                    {c.diegeticGauge}
                  </p>
                  <p>
                    <span className="text-[#F4EFE6] font-medium">Ortak Kavuşum: </span>
                    {c.conjunctionRole}
                  </p>
                  <p>
                    <span className="text-[#F4EFE6] font-medium">Müzik Teması: </span>
                    {c.instrumentTheme}
                  </p>
                </div>
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={() => onSelectChar(cid)}
                    className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-[#D4AF37] text-[#090A0F]'
                        : 'bg-[#1A1F30] text-[#F4EFE6] hover:bg-[#252C44] border border-white/10'
                    }`}
                  >
                    {isSelected ? 'Sahnede Aktif' : 'Sahnede Kontrol Et'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Section: Silahlar */}
      {section === 'silahlar' && (
        <div className="mt-6 space-y-6">
          <p className="text-sm leading-relaxed text-[#A8B0C2]">
            Her silah Enes Öztürk atölyesinden çıkmış mekanik bir mühendislik şaheseridir.
            Savaş sırasında <span className="text-[#F4EFE6] font-medium">F</span> tuşuyla
            biçim değiştirerek düşman zırhlarını kırın veya gökyüzü komboları kurun.
          </p>

          {CHARACTER_ORDER.map((cid) => {
            const c = CHARACTERS[cid];
            const form = weaponForms[cid];
            return (
              <div
                key={cid}
                className="p-5 rounded-xl bg-[#0F121C] border border-white/10 space-y-3"
              >
                <div>
                  <p className="text-xs text-[#D4AF37] mb-0.5">{c.name}</p>
                  <h3 className="font-display text-lg font-semibold text-[#F4EFE6]">
                    {c.weaponTitle}
                  </h3>
                </div>

                <div className="space-y-3 pt-2 border-t border-white/8">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-[#F4EFE6]">
                        {c.primaryFormName}
                      </p>
                      <p className="text-xs text-[#A8B0C2] leading-relaxed mt-1">
                        {c.primaryFormDesc}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        onSelectChar(cid);
                        onSetWeaponForm(cid, 'primary');
                      }}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium shrink-0 cursor-pointer ${
                        activeChar === cid && form === 'primary'
                          ? 'bg-[#D4AF37] text-[#090A0F]'
                          : 'bg-[#181D2C] text-[#F4EFE6] hover:bg-[#232A3E]'
                      }`}
                    >
                      Kuşan
                    </button>
                  </div>

                  <div className="flex items-start justify-between gap-3 pt-3 border-t border-white/6">
                    <div>
                      <p className="text-sm font-semibold text-[#F4EFE6]">
                        {c.secondaryFormName}
                      </p>
                      <p className="text-xs text-[#A8B0C2] leading-relaxed mt-1">
                        {c.secondaryFormDesc}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        onSelectChar(cid);
                        onSetWeaponForm(cid, 'secondary');
                      }}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium shrink-0 cursor-pointer ${
                        activeChar === cid && form === 'secondary'
                          ? 'bg-[#D4AF37] text-[#090A0F]'
                          : 'bg-[#181D2C] text-[#F4EFE6] hover:bg-[#232A3E]'
                      }`}
                    >
                      Dönüştür
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Section: Diyarlar */}
      {section === 'diyarlar' && (
        <div className="mt-6 space-y-5">
          <p className="text-sm leading-relaxed text-[#A8B0C2]">
            Üçlemenin finaline yakışan, tamamı zanaat eseri beş kesintisiz imparatorluk
            katmanı arasında anında geçiş yapın.
          </p>

          {REALM_ORDER.map((rid) => {
            const r = REALMS[rid];
            const isSelected = activeRealm === rid;
            return (
              <div
                key={rid}
                className={`p-5 rounded-xl border transition-colors ${
                  isSelected
                    ? 'bg-[#141826] border-[#D4AF37]/50'
                    : 'bg-[#0F121C] border-white/8'
                }`}
              >
                <div className="flex items-baseline justify-between gap-2">
                  <h3 className="font-display text-lg font-semibold text-[#F4EFE6]">
                    {r.index}. {r.name}
                  </h3>
                </div>
                <p className="text-xs text-[#D4AF37] mb-2">{r.subtitle}</p>
                <p className="text-sm text-[#A8B0C2] leading-relaxed mb-4">
                  {r.description}
                </p>
                <button
                  type="button"
                  onClick={() => onSelectRealm(rid)}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-[#D4AF37] text-[#090A0F]'
                      : 'bg-[#1A1F30] text-[#F4EFE6] hover:bg-[#252C44] border border-white/10'
                  }`}
                >
                  {isSelected ? 'Aktif Bölge' : 'Bölgeye Geç'}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </aside>
  );
};
