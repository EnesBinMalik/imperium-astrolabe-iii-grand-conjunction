export type CharacterId = 'enes' | 'demirhan' | 'selinay';
export type RealmId = 'bifrost' | 'horology' | 'caldera' | 'lunar' | 'nexus';
export type WeaponForm = 'primary' | 'secondary';

export interface CharacterSpec {
  id: CharacterId;
  keyNumber: '1' | '2' | '3';
  name: string;
  title: string;
  domain: string;
  accentHex: string;
  secondaryHex: string;
  appearance: string;
  playstyle: string;
  diegeticGauge: string;
  instrumentTheme: string;
  weaponTitle: string;
  primaryFormName: string;
  primaryFormDesc: string;
  secondaryFormName: string;
  secondaryFormDesc: string;
  conjunctionRole: string;
  moveSpeed: number;
  jumpForce: number;
  weight: number;
}

export interface RealmSpec {
  id: RealmId;
  index: string;
  name: string;
  subtitle: string;
  description: string;
  skyColor: number;
  fogColor: number;
  fogDensity: number;
  keyLightColor: number;
  keyLightIntensity: number;
  hemiSkyColor: number;
  hemiGroundColor: number;
  accentColor: number;
  accentCss: string;
}

export const CHARACTERS: Record<CharacterId, CharacterSpec> = {
  enes: {
    id: 'enes',
    keyNumber: '1',
    name: 'Enes Öztürk',
    title: 'Yüce Baş Mimar',
    domain: 'Zaman ve Yörünge Ustası',
    accentHex: '#D4AF37',
    secondaryHex: '#0F766E',
    appearance:
      'Altın-obsidyen mekanik alınlık tacı, göğsünde dönen minyatür güneş sistemi çekirdeği barındıran saf beyaz mermer ve 24 ayar altın işlemeli Egemenlik Zırhı (Sovereign Regalia). Zümrüt yeşili ağır pelerininin üzerinde zırhlı Altın Anka-Doğan süzülür.',
    playstyle:
      'Orta ve uzun mesafede zaman bükme, yörünge çekimi ve yüksek hızlı kılıç-tırpan koreografisiyle savaş alanını yöneten dengeli baş karakter.',
    diegeticGauge:
      'Göğüsteki güneş çekirdeği parlaklığı ve sırtındaki usturlab halkalarının açılıp Altın Anka-Doğan’ın kanatlarını germesi.',
    instrumentTheme: 'Görkemli senfoni orkestrası, kilise orgu ve epik koro.',
    weaponTitle: 'Göksel Halka ve Güneş Mızrağı',
    primaryFormName: 'Göksel Halka (Celestial Chakram)',
    primaryFormDesc:
      'Sırtındaki dev altın usturlab 6 adet uçan kılıç halkasına ayrılarak yörüngede döner ve biçerdöver gibi alan temizler.',
    secondaryFormName: 'Güneş Mızrağı (Solar Lance)',
    secondaryFormDesc:
      'Kabzalar birleştiğinde ucu saf plazma yayan 3 metrelik İmparatorluk Mızrağına dönüşerek gökten yıldırım gibi iner.',
    conjunctionRole: 'Havada veya yerde dönen 6 Altın Halka ile göksel patlama bitiricisi.',
    moveSpeed: 9.2,
    jumpForce: 12.2,
    weight: 1.0,
  },
  demirhan: {
    id: 'demirhan',
    keyNumber: '2',
    name: 'Demirhan',
    title: 'Demir ve Magma Başustası',
    domain: 'Madde ve Ağır Kinetik Ustası',
    accentHex: '#EA580C',
    secondaryHex: '#92400E',
    appearance:
      'Volkanik bazalt taşı ve dövme tunçtan devasa zırh plakaları; sırtında yüksek basınçlı jeotermal buhar ve erimiş altın taşıyan Çift Silindirli Kazan Reaktörü; dişlileri dışarıdan görünen el dövmesi mekanik sağ protez kol.',
    playstyle:
      'Yavaş ama durdurulamaz. Devasa otomatların zırhlarını tek darbede parçalayan, yeri sarsan şok dalgaları yaratan ağır siklet savaşçı.',
    diegeticGauge:
      'Sırtındaki çift silindirli kazan reaktörünün erimiş altın basıncı ve zırh yarıklarındaki kor ışıması.',
    instrumentTheme: 'Ağır endüstriyel örs vuruşları, dev timpani davulları ve derin bakır üflemeliler.',
    weaponTitle: 'Kıyamet Örsü ve Ejderha Topu',
    primaryFormName: 'Kıyamet Örsü (Apocalypse Anvil)',
    primaryFormDesc:
      'Devasa savaş çekici yere vurduğunda lav ve altın kıvılcımları fışkırtan sismik şok dalgası üretir.',
    secondaryFormName: 'Ejderha Topu (Dragon Cannon)',
    secondaryFormDesc:
      'Çekicin başındaki mekanik kilit açıldığında namlu ikiye ayrılır ve omuza alınan Ağır Kuşatma Havan Topuna dönüşür.',
    conjunctionRole: 'Havaya fırlatılan düşmanları dev çekiciyle yakalayıp sismik güçle yere çakar.',
    moveSpeed: 7.4,
    jumpForce: 10.6,
    weight: 1.35,
  },
  selinay: {
    id: 'selinay',
    keyNumber: '3',
    name: 'Selinay',
    title: 'Kristal ve Işık Rahibesi',
    domain: 'Mekân ve Fotonik Hız Ustası',
    accentHex: '#38BDF8',
    secondaryHex: '#E2E8F0',
    appearance:
      'Işığı kıran el kesimi kuvars kristalleri, gümüş telkari işlemeli esnek zırh, arkasında prizmatik iz bırakan yarı saydam İpek-Foton Şalı ve teleskopik merceklerden oluşan Pirinç Gözlem Vizörü.',
    playstyle:
      'Işık hızında atılmalar, ayna yansımalarıyla klon oluşturma ve havada yere inmeden ölümcül kesikler atan akrobatik suikastçı.',
    diegeticGauge:
      'Omuz kuvars kristallerinin kırılma yoğunluğu ve İpek-Foton Şalı’nın prizmatik ışıltısı.',
    instrumentTheme: 'Cam armonika, arp, solo keman ve kristal çan tınıları.',
    weaponTitle: 'Prizma Yelpazeleri ve Işık Kırbacı',
    primaryFormName: 'Prizma Yelpazeleri (Prism Fans)',
    primaryFormDesc:
      'El kesimi elmas ve gümüş çerçeveli ikili yelpaze kapalıyken hançer gibi işler, açıldığında düşmanları havaya fırlatır.',
    secondaryFormName: 'Işık Kırbacı (Light-Whip)',
    secondaryFormDesc:
      'İçindeki kristaller güneş ışığını odaklayarak geniş yaylarda kesim yapan esnek ve parlak bir Foton Kırbacına uzanır.',
    conjunctionRole: 'Işık hızıyla düşmanı havaya fırlatarak Demirhan ve Enes için ortak kombo penceresi açar.',
    moveSpeed: 11.4,
    jumpForce: 13.8,
    weight: 0.8,
  },
};

export const CHARACTER_ORDER: CharacterId[] = ['enes', 'demirhan', 'selinay'];

export const REALMS: Record<RealmId, RealmSpec> = {
  bifrost: {
    id: 'bifrost',
    index: '01',
    name: 'Yıldızlararası Köprü',
    subtitle: 'The Bifrost of Brass',
    description:
      'İki devasa gök adasını birbirine bağlayan, gökyüzünde süzülen dev altın zincirler ve dönen mermer platformlardan oluşan rüzgarlı açık hava geçiş yolu.',
    skyColor: 0x0b1222,
    fogColor: 0x0f182e,
    fogDensity: 0.014,
    keyLightColor: 0xffe4b5,
    keyLightIntensity: 2.3,
    hemiSkyColor: 0x4b6a9b,
    hemiGroundColor: 0x1b1526,
    accentColor: 0xd4af37,
    accentCss: '#D4AF37',
  },
  horology: {
    id: 'horology',
    index: '02',
    name: 'Ebedi Zaman Çarkı Sarayı',
    subtitle: 'The Grand Horology Palace',
    description:
      'İçinde binalar büyüklüğünde zembereklerin ve kristal sarkaçların çalıştığı, duvarları hareket eden labirent odalardan oluşan ihtişamlı saray.',
    skyColor: 0x0d0b14,
    fogColor: 0x120f1c,
    fogDensity: 0.015,
    keyLightColor: 0xffd584,
    keyLightIntensity: 2.4,
    hemiSkyColor: 0x62508a,
    hemiGroundColor: 0x1a1410,
    accentColor: 0xeab308,
    accentCss: '#EAB308',
  },
  caldera: {
    id: 'caldera',
    index: '03',
    name: 'Volkanik Gözlemevi',
    subtitle: 'The Caldera Citadel',
    description:
      'Aktif bir yanardağın kraterine inşa edilmiş, lav kanallarının altın dişlileri döndürdüğü, Demirhan’ın dökümhanelerinin yer aldığı ateş ve duman şehri.',
    skyColor: 0x160a08,
    fogColor: 0x220e0a,
    fogDensity: 0.016,
    keyLightColor: 0xffa060,
    keyLightIntensity: 2.2,
    hemiSkyColor: 0x803520,
    hemiGroundColor: 0x2b0c05,
    accentColor: 0xea580c,
    accentCss: '#EA580C',
  },
  lunar: {
    id: 'lunar',
    index: '04',
    name: 'Ay Işığı Kristal Bahçeleri',
    subtitle: 'The Lunar Conservatory',
    description:
      'Gecenin hiç bitmediği, devasa kuvars ağaçlarının ve gümüş havuzların ay ışığını binlerce renge böldüğü, Selinay’ın ayna ilüzyonlarının zirveye çıktığı bahçe.',
    skyColor: 0x07101f,
    fogColor: 0x0b172c,
    fogDensity: 0.014,
    keyLightColor: 0xcbe8ff,
    keyLightIntensity: 2.1,
    hemiSkyColor: 0x4b7cb8,
    hemiGroundColor: 0x0c192b,
    accentColor: 0x38bdf8,
    accentCss: '#38BDF8',
  },
  nexus: {
    id: 'nexus',
    index: '05',
    name: 'Büyük Kavuşum Çekirdeği',
    subtitle: 'The Grand Conjunction Nexus',
    description:
      'Evrenin tüm zaman çizgilerinin kesiştiği, üç karakterin aynı anda dev Kozmik Kaos Ejderhası (The Ouroboros Automaton) ile savaştığı final arenası.',
    skyColor: 0x090a10,
    fogColor: 0x0d0f18,
    fogDensity: 0.013,
    keyLightColor: 0xffe6ba,
    keyLightIntensity: 2.5,
    hemiSkyColor: 0x5c6f9c,
    hemiGroundColor: 0x1d1610,
    accentColor: 0xf59e0b,
    accentCss: '#F59E0B',
  },
};

export const REALM_ORDER: RealmId[] = ['nexus', 'bifrost', 'horology', 'caldera', 'lunar'];
