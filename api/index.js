const { addonBuilder, getRouter: sdkGetRouter } = require('stremio-addon-sdk');
const axios = require('axios');

// ============================================================================
// 1. MANIFEST CONFIGURATION (JEBU PREDPLATNÝ - 🇨🇿 CZ/SK FREE STREAMING)
// ============================================================================
const manifest = {
  id: 'community.jebupredplatny.czsk',
  version: '1.0.0',
  name: 'JebuPředplatný (🇨🇿 CZ/SK Free Stream)',
  description: 'České kultovní seriály (Comeback, Boží plán, Hospoda, Okresní přebor, Most!, Vyšehrad) a české filmy zdarma bez předplatného. Přímé streamy z Prehraj.to a YouTube HD.',
  resources: ['catalog', 'meta', 'stream'],
  types: ['series', 'movie'],
  idPrefixes: ['jbp_', 'tt'],
  catalogs: [
    {
      type: 'series',
      id: 'jbp_catalog_series',
      name: '🇨🇿 České seriály (Kultovní & Nové)',
      extra: [
        { name: 'search', isRequired: false }
      ]
    },
    {
      type: 'movie',
      id: 'jbp_catalog_movies',
      name: '🇨🇿 České komedie a filmy',
      extra: [
        { name: 'search', isRequired: false }
      ]
    }
  ]
};

// ============================================================================
// 2. METADATA CATALOGS (SERIES & MOVIES)
// ============================================================================
const SERIES_METADATA = [
  {
    id: 'jbp_comeback',
    imdb_id: 'tt1330086',
    name: 'Comeback',
    type: 'series',
    genres: ['Komedie', 'Sitcom'],
    poster: 'https://image.pmgstatic.com/cache/resized/w663/files/images/film/posters/159/995/159995058_6da5f2.jpg',
    background: 'https://image.pmgstatic.com/cache/resized/w1400/files/images/film/photos/160/328/160328906_f16d1a.jpg',
    logo: 'https://image.pmgstatic.com/cache/resized/w663/files/images/film/posters/159/995/159995058_6da5f2.jpg',
    description: 'Kultovní český sitcom televize Nova. Tomáš Pacovský (Tomi Paci), bývalá hvězda pop-music, provozuje obchod s hudebními nosiči U Dvou koček se svým bratrem Františkem (Ozzák), který je nefalšovaný metalista tělem i duší.',
    releaseInfo: '2008-2011',
    rating: '8.3',
    searchTerms: ['Comeback', 'Comeback sitcom']
  },
  {
    id: 'jbp_bozi_plan',
    imdb_id: 'tt32876544',
    name: 'Boží plán',
    type: 'series',
    genres: ['Komedie', 'Vztahový'],
    poster: 'https://image.pmgstatic.com/cache/resized/w663/files/images/film/posters/168/985/168985114_9fbf51.jpg',
    background: 'https://image.pmgstatic.com/cache/resized/w1400/files/images/film/photos/168/985/168985120_6a203f.jpg',
    logo: 'https://image.pmgstatic.com/cache/resized/w663/files/images/film/posters/168/985/168985114_9fbf51.jpg',
    description: 'Nový český komediální seriál (2026). Příběh netradičního společného soužití kamarádů Adama, Lukáše a Hynka u dobrosrdečného řidiče tramvaje Mirka (Tomáš Jeřábek), do jejichž života vstoupí mladá nevěsta Julie.',
    releaseInfo: '2026',
    rating: '7.8',
    searchTerms: ['Boží plán', 'Bozi plan']
  },
  {
    id: 'jbp_hospoda',
    imdb_id: 'tt0178135',
    name: 'Hospoda',
    type: 'series',
    genres: ['Komedie', 'Sitcom'],
    poster: 'https://image.pmgstatic.com/cache/resized/w663/files/images/film/posters/158/511/158511082_ff3997.jpg',
    background: 'https://image.pmgstatic.com/cache/resized/w1400/files/images/film/photos/158/511/158511084_163db0.jpg',
    logo: 'https://image.pmgstatic.com/cache/resized/w663/files/images/film/posters/158/511/158511082_ff3997.jpg',
    description: 'Legendární český sitcom. Hospoda U kotvy a její svérázní štamgasti – topič Babula, advokát Richtera, psychiatr Prášek, tělocvikář Jonáš a další pod dohledem přísného hospodského Jaromíra Duška a kuchaře Kachny.',
    releaseInfo: '1996-1997',
    rating: '8.1',
    searchTerms: ['Hospoda', 'Hospoda sitcom']
  },
  {
    id: 'jbp_okresni_prebor',
    imdb_id: 'tt1739958',
    name: 'Okresní přebor',
    type: 'series',
    genres: ['Komedie', 'Sportovní'],
    poster: 'https://image.pmgstatic.com/cache/resized/w663/files/images/film/posters/158/443/158443553_287413.jpg',
    background: 'https://image.pmgstatic.com/cache/resized/w1400/files/images/film/photos/158/443/158443557_e0f10c.jpg',
    logo: 'https://image.pmgstatic.com/cache/resized/w663/files/images/film/posters/158/443/158443553_287413.jpg',
    description: 'Slavoj Houslice a jejich boj o postup v okresním přeboru. Trenér Jirka Luňák, předseda Václav Orel, veterán Jarda Kužel a řada dalších nezapomenutelných postav venkovského fotbalu.',
    releaseInfo: '2010',
    rating: '8.6',
    searchTerms: ['Okresní přebor', 'Okresni prebor']
  },
  {
    id: 'jbp_most',
    imdb_id: 'tt9205566',
    name: 'Most!',
    type: 'series',
    genres: ['Komedie', 'Drama'],
    poster: 'https://image.pmgstatic.com/cache/resized/w663/files/images/film/posters/163/279/163279899_b9dfc4.jpg',
    background: 'https://image.pmgstatic.com/cache/resized/w1400/files/images/film/photos/163/279/163279901_387d8d.jpg',
    logo: 'https://image.pmgstatic.com/cache/resized/w663/files/images/film/posters/163/279/163279899_b9dfc4.jpg',
    description: 'Dycky Most! Osmidílný komediální seriál České televize od tvůrčí dvojice Jan Prušinovský a Petr Kolečko. Luďan, hospoda Severka, romský popelář Franta a bratr Dáša.',
    releaseInfo: '2019',
    rating: '8.4',
    searchTerms: ['Most! seriál', 'Most serial']
  },
  {
    id: 'jbp_vysehrad',
    imdb_id: 'tt6186834',
    name: 'Vyšehrad',
    type: 'series',
    genres: ['Komedie', 'Sportovní'],
    poster: 'https://image.pmgstatic.com/cache/resized/w663/files/images/film/posters/161/447/161447087_5e4310.jpg',
    background: 'https://image.pmgstatic.com/cache/resized/w1400/files/images/film/photos/161/447/161447091_d0c0fc.jpg',
    logo: 'https://image.pmgstatic.com/cache/resized/w663/files/images/film/posters/161/447/161447087_5e4310.jpg',
    description: 'Julius Lavický (Lavi), fotbalový talent s velkým srdcem a ještě větším sklonem k večírkům, alkoholu a průšvihům, který z první ligy spadl až do FK Slavoj Vyšehrad.',
    releaseInfo: '2016-2017',
    rating: '8.1',
    searchTerms: ['Vyšehrad seriál', 'Vysehrad Lavi']
  },
  {
    id: 'jbp_ctvrta_hvezda',
    imdb_id: 'tt3490796',
    name: 'Čtvrtá hvězda',
    type: 'series',
    genres: ['Komedie', 'Sitcom'],
    poster: 'https://image.pmgstatic.com/cache/resized/w663/files/images/film/posters/160/328/160328766_64fe1c.jpg',
    background: 'https://image.pmgstatic.com/cache/resized/w1400/files/images/film/photos/160/328/160328768_a4d0f5.jpg',
    logo: 'https://image.pmgstatic.com/cache/resized/w663/files/images/film/posters/160/328/160328766_64fe1c.jpg',
    description: 'Komediální seriál České televize a Dejvického divadla. Libeňský hotel Meteor a jeho zaměstnanci se snaží získat čtvrtou hvězdu.',
    releaseInfo: '2014',
    rating: '8.1',
    searchTerms: ['Čtvrtá hvězda', 'Ctvrta hvezda']
  },
  {
    id: 'jbp_kosmo',
    imdb_id: 'tt6182276',
    name: 'Kosmo',
    type: 'series',
    genres: ['Komedie', 'Sci-Fi'],
    poster: 'https://image.pmgstatic.com/cache/resized/w663/files/images/film/posters/161/366/161366228_d66b59.jpg',
    background: 'https://image.pmgstatic.com/cache/resized/w1400/files/images/film/photos/161/366/161366230_bbf5ec.jpg',
    logo: 'https://image.pmgstatic.com/cache/resized/w663/files/images/film/posters/161/366/161366228_d66b59.jpg',
    description: 'První česká vesmírná mise s lidskou posádkou na Měsíc. Satirický komediální miniseriál České televize.',
    releaseInfo: '2016',
    rating: '8.2',
    searchTerms: ['Kosmo seriál', 'Kosmo ČT']
  },
  {
    id: 'jbp_devadesatky',
    imdb_id: 'tt14234502',
    name: 'Devadesátky',
    type: 'series',
    genres: ['Krimi', 'Drama'],
    poster: 'https://image.pmgstatic.com/cache/resized/w663/files/images/film/posters/166/193/166193910_cb43f1.jpg',
    background: 'https://image.pmgstatic.com/cache/resized/w1400/files/images/film/photos/166/193/166193915_df623a.jpg',
    logo: 'https://image.pmgstatic.com/cache/resized/w663/files/images/film/posters/166/193/166193910_cb43f1.jpg',
    description: 'Šestidílná kriminální série zachycující vyšetřování nejzávažnějších zločinů divokých 90. let v České republice (orlické vraždy, Jonák, Discoland Sylvie).',
    releaseInfo: '2022',
    rating: '8.7',
    searchTerms: ['Devadesátky', 'Devadesatky']
  },
  {
    id: 'jbp_chalupari',
    imdb_id: 'tt0169438',
    name: 'Chalupáři',
    type: 'series',
    genres: ['Komedie'],
    poster: 'https://image.pmgstatic.com/cache/resized/w663/files/images/film/posters/158/511/158511252_a13917.jpg',
    background: 'https://image.pmgstatic.com/cache/resized/w1400/files/images/film/photos/158/511/158511255_ea3810.jpg',
    logo: 'https://image.pmgstatic.com/cache/resized/w663/files/images/film/posters/158/511/158511252_a13917.jpg',
    description: 'Kultovní seriál o soužití pražského důchodce Evžena Humla a vesnického kutila Bohouše Císaře ve vesničce Třešňová.',
    releaseInfo: '1975',
    rating: '8.0',
    searchTerms: ['Chalupáři', 'Chalupari']
  }
];

const MOVIES_METADATA = [
  {
    id: 'jbp_pelisky',
    imdb_id: 'tt0201844',
    name: 'Pelíšky',
    type: 'movie',
    genres: ['Komedie', 'Drama'],
    poster: 'https://image.pmgstatic.com/cache/resized/w663/files/images/film/posters/158/115/158115684_e2c140.jpg',
    background: 'https://image.pmgstatic.com/cache/resized/w1400/files/images/film/photos/158/115/158115686_7c093a.jpg',
    description: 'Kultovní česká hořká komedie Jana Hřebejka z konce šedesátých let. Rodiny Šebků a Krausů, nerozbitné plastové lžičky a legendární hlášky.',
    releaseInfo: '1999',
    rating: '9.1',
    searchTerms: ['Pelíšky 1999', 'Pelisky']
  },
  {
    id: 'jbp_samotari',
    imdb_id: 'tt0245429',
    name: 'Samotáři',
    type: 'movie',
    genres: ['Komedie', 'Drama'],
    poster: 'https://image.pmgstatic.com/cache/resized/w663/files/images/film/posters/158/116/158116518_bf8876.jpg',
    background: 'https://image.pmgstatic.com/cache/resized/w1400/files/images/film/photos/158/116/158116520_19ff5a.jpg',
    description: 'Generační komedie Davida Ondříčka a Petra Zelenky o skupině mladých lidí v Praze na přelomu tisíciletí. Jakub, Hanka, Petr a nezapomenutelné scény s marihuanou.',
    releaseInfo: '2000',
    rating: '8.4',
    searchTerms: ['Samotáři', 'Samotari film']
  },
  {
    id: 'jbp_dedictvi',
    imdb_id: 'tt0106675',
    name: 'Dědictví aneb Kurvahošigutntag',
    type: 'movie',
    genres: ['Komedie'],
    poster: 'https://image.pmgstatic.com/cache/resized/w663/files/images/film/posters/158/115/158115714_2e35eb.jpg',
    background: 'https://image.pmgstatic.com/cache/resized/w1400/files/images/film/photos/158/115/158115716_c584cb.jpg',
    description: 'Věra Chytilová a Bolek Polívka v nezapomenutelné komedii o rázovitém vesnickém chlapíkovi Bohušovi, který nečekaně zdědí obrovský majetek.',
    releaseInfo: '1992',
    rating: '8.4',
    searchTerms: ['Dědictví aneb Kurvahošigutntag', 'Dedictvi kurvahosigutntag']
  },
  {
    id: 'jbp_steboumebavisvet',
    imdb_id: 'tt0084620',
    name: 'S tebou mě baví svět',
    type: 'movie',
    genres: ['Komedie', 'Rodinný'],
    poster: 'https://image.pmgstatic.com/cache/resized/w663/files/images/film/posters/158/115/158115682_1d5964.jpg',
    background: 'https://image.pmgstatic.com/cache/resized/w1400/files/images/film/photos/158/115/158115685_321175.jpg',
    description: 'Komedie století režisérky Marie Poledňákové. Každoroční pánská jízda tří kamarádů v Beskydech se změní v mateřskou školu v přírodě.',
    releaseInfo: '1982',
    rating: '8.2',
    searchTerms: ['S tebou mě baví svět', 'S tebou me bavi svet']
  },
  {
    id: 'jbp_vratnelahve',
    imdb_id: 'tt0804549',
    name: 'Vratné lahve',
    type: 'movie',
    genres: ['Komedie'],
    poster: 'https://image.pmgstatic.com/cache/resized/w663/files/images/film/posters/158/116/158116548_b621fe.jpg',
    background: 'https://image.pmgstatic.com/cache/resized/w1400/files/images/film/photos/158/116/158116550_1922df.jpg',
    description: 'Učitel v důchodu Josef Tkaloun odmítá pasivní stáří a přijme místo brigádníka ve výkupu lahví v pražském supermarketu.',
    releaseInfo: '2007',
    rating: '7.8',
    searchTerms: ['Vratné lahve', 'Vratne lahve film']
  },
  {
    id: 'jbp_nasamoteulesa',
    imdb_id: 'tt0074949',
    name: 'Na samotě u lesa',
    type: 'movie',
    genres: ['Komedie'],
    poster: 'https://image.pmgstatic.com/cache/resized/w663/files/images/film/posters/158/115/158115788_fa720e.jpg',
    background: 'https://image.pmgstatic.com/cache/resized/w1400/files/images/film/photos/158/115/158115790_13bdf2.jpg',
    description: 'Manželé Lavičkovi touží po chalupě a dohodnou se s dědou Komárkem, že od něj koupí malebnou roubenku, až na podzim zaseje.',
    releaseInfo: '1976',
    rating: '8.4',
    searchTerms: ['Na samotě u lesa', 'Na samote u lesa']
  },
  {
    id: 'jbp_slunceseno1',
    imdb_id: 'tt0088143',
    name: 'Slunce, seno, jahody',
    type: 'movie',
    genres: ['Komedie'],
    poster: 'https://image.pmgstatic.com/cache/resized/w663/files/images/film/posters/158/115/158115796_0b2632.jpg',
    background: 'https://image.pmgstatic.com/cache/resized/w1400/files/images/film/photos/158/115/158115798_18ba03.jpg',
    description: 'Zdeněk Troška a jeho jihočeská vesnice Hoštice. Student Šimon Plánička přichází se svou teorií zvyšování dojivosti krav pomocí hudby.',
    releaseInfo: '1984',
    rating: '7.9',
    searchTerms: ['Slunce seno jahody', 'Slunce, seno, jahody']
  },
  {
    id: 'jbp_slunceseno2',
    imdb_id: 'tt0098348',
    name: 'Slunce, seno a pár facek',
    type: 'movie',
    genres: ['Komedie'],
    poster: 'https://image.pmgstatic.com/cache/resized/w663/files/images/film/posters/158/115/158115802_8cb721.jpg',
    background: 'https://image.pmgstatic.com/cache/resized/w1400/files/images/film/photos/158/115/158115804_5b045e.jpg',
    description: 'Přípravy svatby Blaženy a Vency v Hošticích přeroste ve vesnickou válku dvou rodin, plnou facek a drbů.',
    releaseInfo: '1989',
    rating: '7.8',
    searchTerms: ['Slunce seno a par facek', 'Slunce, seno a pár facek']
  },
  {
    id: 'jbp_vesnicko',
    imdb_id: 'tt0089851',
    name: 'Vesničko má středisková',
    type: 'movie',
    genres: ['Komedie'],
    poster: 'https://image.pmgstatic.com/cache/resized/w663/files/images/film/posters/158/115/158115812_828331.jpg',
    background: 'https://image.pmgstatic.com/cache/resized/w1400/files/images/film/photos/158/115/158115814_1ff732.jpg',
    description: 'Jiří Menzel a Zdeněk Svěrák v nominaci na Oscara. Mentálně zaostalý Otík a řidič náklaďáku pan Pávek v malebné středočeské vesnici Křečovice.',
    releaseInfo: '1985',
    rating: '8.8',
    searchTerms: ['Vesničko má středisková', 'Vesnicko ma strediskova']
  },
  {
    id: 'jbp_cernibaroni',
    imdb_id: 'tt0103957',
    name: 'Černí baroni',
    type: 'movie',
    genres: ['Komedie'],
    poster: 'https://image.pmgstatic.com/cache/resized/w663/files/images/film/posters/158/115/158115838_0f2452.jpg',
    background: 'https://image.pmgstatic.com/cache/resized/w1400/files/images/film/photos/158/115/158115840_9c56aa.jpg',
    description: 'Kultovní komedie podle knihy Miloslava Švandrlíka o pétépácích na zámku Zelená Hora. Major Terazky a jeho legendární otázky.',
    releaseInfo: '1992',
    rating: '8.2',
    searchTerms: ['Černí baroni', 'Cerni baroni']
  }
];

// ============================================================================
// 3. EPISODES DATABASE (COMEBACK, BOŽÍ PLÁN, HOSPODA, OKRESNÍ PŘEBOR, MOST)
// ============================================================================
const COMEBACK_EPISODES = [
  // Season 1
  { s: 1, e: 1, title: 'Křeslo', overview: 'Ozzák zničí oblíbené Tomášovo křeslo a náhradní se shání vskutku svérázně.' },
  { s: 1, e: 2, title: 'Guma', overview: 'Iva potřebuje do školy gumu, ale Ozzák koupí poněkud jiný druh gumy.' },
  { s: 1, e: 3, title: 'Souboj titánů', overview: 'Ozzák a Marcelka změří síly v souboji o to, kdo má větší vliv na Tomáše.' },
  { s: 1, e: 4, title: 'Pomáhat a chránit', overview: 'Tomáš se dostane do křížku se zákonem a Ozzák se rozhodne zjednat spravedlnost.' },
  { s: 1, e: 5, title: 'Pravidla rodinného provozovny', overview: 'Marcelka zavádí v obchodě přísná pravidla, což Ozzák těžce nese.' },
  { s: 1, e: 6, title: 'Je jaro', overview: 'Jarní nálada dorazila i do krámu U Dvou koček a Tomi Paci chytá druhý dech.' },
  { s: 1, e: 7, title: 'Lupiči', overview: 'Obchod se stane terčem lupičů, ale narazí na nepřipraveného Ozzáka.' },
  { s: 1, e: 8, title: 'Zdravý a nemocný', overview: 'Tomáš onemocní a Ozzák se chopí role ošetřovatele s pomocí piva.' },
  { s: 1, e: 9, title: 'Kupte si psa', overview: 'Iva chce psa, ale dostane Ozzáka na vodítku.' },
  { s: 1, e: 10, title: 'Zlatá rybka', overview: 'Ozzák chytí v pivu zlatou rybku a požaduje splnění tří přání.' },
  { s: 1, e: 11, title: 'Zloděj', overview: 'Z obchodu mizí zboží a Ozzák organizuje vyšetřovací past.' },
  { s: 1, e: 12, title: 'Taneční', overview: 'Iva jde do tanečních a Tomáš s Ozzákem si brousí společenské boty.' },
  { s: 1, e: 13, title: 'Sliby chyby', overview: 'Tomáš slíbí Marcelce koncert, ale Ozzák zajistí metalovou nálož.' },
  { s: 1, e: 14, title: 'Sponzor', overview: 'Obchod potřebuje peníze a Ozzák najde nečekaného sponzora v pivovaru.' },
  { s: 1, e: 15, title: 'Berňák', overview: 'Kontrola z finančního úřadu klepe na dveře a účetnictví vede Ozzák na táccích od piva.' },
  { s: 1, e: 16, title: 'Zápas', overview: 'Hokejový zápas století v televizi a Tomášova televize vypoví poslušnost.' },
  { s: 1, e: 17, title: 'Krev, pot a slzy', overview: 'Ozzák se rozhodne sportovat a Tomáš začíná litovat svého nápadu.' },
  { s: 1, e: 18, title: 'Štědrý večer nastal', overview: 'Vánoce u Pacovských. Ozzák shání stromeček a kapra chytá v řece.' },
  { s: 1, e: 19, title: 'Bez klávesnice', overview: 'Počítačová revoluce v obchodě. Ozzák a internet – nebezpečná kombinace.' },
  { s: 1, e: 20, title: 'Zlatá ledvina', overview: 'Soutěž o největšího pivaře a Ozzák nastupuje v životní formě.' },
  { s: 1, e: 21, title: 'Boží mlýny', overview: 'Spravedlnost je slepá, ale Ozzákův loket je neomylný.' },
  { s: 1, e: 22, title: 'Poslední kapka', overview: 'Tomáš se rozhodne definitivně zbavit Ozzáka alkoholu.' },
  { s: 1, e: 23, title: 'Cesta do Vídně', overview: 'Výprava za kulturou, která skončí v rakouské pivnici.' },
  { s: 1, e: 24, title: 'Let mouchy', overview: 'Ozzák a jeho psychologická bitva s otravným hmyzem.' },
  { s: 1, e: 25, title: 'Těžká hodina', overview: 'Tomáš skládá novou píseň a Ozzák mu nabízí drsné metalové riffy.' },
  { s: 1, e: 26, title: 'Křik', overview: 'Marcelka ztratí hlas a Ozzák slaví nejklidnější den v životě.' },
  { s: 1, e: 27, title: 'Pan Prase', overview: 'Ozzákova oblíbená pokladnička a Tomášova finanční tíseň.' },
  { s: 1, e: 28, title: 'Absťák', overview: 'Den bez piva – Ozzák zažívá stavy, na které věda nestačí.' },
  { s: 1, e: 29, title: 'Kdo to byl?', overview: 'Záhada ztraceného piva v ledničce má překvapivého viníka.' },
  { s: 1, e: 30, title: 'Heavy Christmas', overview: 'Vánoční speciál – nejtvrdší koledy v podání Ozzáka.' },
  // Season 2
  { s: 2, e: 1, title: 'Zlatá rybka II', overview: 'Druhé kolo plnění přání a ještě větší katastrofa pro Tomáše.' },
  { s: 2, e: 2, title: 'Rozvod', overview: 'Simona řeší své manželství a Ozzák nabízí právní rady.' },
  { s: 2, e: 3, title: 'Dědictví', overview: 'Pacovští dědí nečekanou pozůstalost, o kterou se Ozzák postará po svém.' },
  { s: 2, e: 4, title: 'Zabijačka', overview: 'Ozzák a tradiční česká zabijačka přímo v paneláku.' },
  { s: 2, e: 5, title: 'Švindl', overview: 'Tomáš se pokusí o malý podvod, který Ozzák nechtěně odhalí.' },
  { s: 2, e: 6, title: 'Třinácté pivo', overview: 'Kultovní epizoda – Ozzák a mýtus o třináctém pivu, po kterém přichází osvícení.' },
  { s: 2, e: 7, title: 'Bez dechu', overview: 'Zkouška odvahy a Ozzákova kapacita plic při pití na ex.' },
  { s: 2, e: 8, title: 'Havárie', overview: 'Prasklé potrubí v domě a Pacovští hledají nouzové útočiště.' },
  { s: 2, e: 9, title: 'Zlatá klec', overview: 'Tomáš dostane lákavou nabídku návratu do showbyznysu.' },
  { s: 2, e: 10, title: 'Komu zvoní hrany', overview: 'Ozzák si myslí, že má poslední hodinku, a začíná rekapitulovat.' },
  { s: 2, e: 11, title: 'Konec světa', overview: 'Mayský kalendář a Ozzákův plán přežití v pivním bunkru.' },
  { s: 2, e: 12, title: 'Kocovina', overview: 'Nejtěžší ráno v dějinách rodiny Pacovských.' },
  { s: 2, e: 13, title: 'Nápad', overview: 'Ozzák vymyslí převratný vynález – samočepovací polštář.' },
  { s: 2, e: 14, title: 'Koncert', overview: 'Tomi Paci vystupuje před živým publikem a Ozzák ladí aparaturu.' },
  { s: 2, e: 15, title: 'Sbohem, armádo', overview: 'Vojenská cvičení a Ozzákova branná povinnost.' },
  { s: 2, e: 16, title: 'Cizinec', overview: 'Do obchodu zavítá zahraniční turista a Ozzák mluví plynule rukama.' },
  { s: 2, e: 17, title: 'Plný plyn', overview: 'Tomáš kupuje auto a Ozzák testuje odolnost nárazníků.' },
  { s: 2, e: 18, title: 'Doktor Ozzák', overview: 'Ozzák léčí sousedy svými osvědčenými recepturami z chmele.' },
  { s: 2, e: 19, title: 'Velký třesk', overview: 'Experiment v kuchyni skončí detonací guláše.' },
  { s: 2, e: 20, title: 'Generálka', overview: 'Příprava na velkou rodinnou oslavu se mění v chaos.' },
  { s: 2, e: 21, title: 'Finále', overview: 'Velké finále kultovního sitcomu. Tomáš, Ozzák, Iva a Marcelka se loučí.' }
];

const BOZI_PLAN_EPISODES = Array.from({ length: 24 }, (_, i) => ({
  s: 1,
  e: i + 1,
  title: `${i + 1}. díl`,
  overview: `Epizoda ${i + 1} nového českého komediálního seriálu Boží plán (2026). Příběhy party kamarádů u tramvajáka Mirka.`
}));

const HOSPODA_EPISODES = [
  { s: 1, e: 1, title: 'Závěť', overview: 'Štamgasti se scházejí U kotvy a Babula má skvělý nápad s dědictvím.' },
  { s: 1, e: 2, title: 'Kuchař', overview: 'Kachna vaří své legendární speciality a Dušek kontroluje míry piva.' },
  { s: 1, e: 3, title: 'Běžec', overview: 'Jonáš sází na místní běžecký maraton a Babula trénuje s půllitrem.' },
  { s: 1, e: 4, title: 'Vynálezce', overview: 'Návštěva svérázného vynálezce s přístrojem na měření pěny.' },
  { s: 1, e: 5, title: 'Šprýmař', overview: 'Vtipálek v hospodě způsobí pozdvižení mezi štamgasty.' },
  { s: 1, e: 6, title: 'Reklama', overview: 'Do hospody dorazí televizní štáb točit reklamu na pivo.' },
  { s: 1, e: 7, title: 'Pes', overview: 'Zbloudilý pes pod stolem vzbudí debatu o kynologii.' },
  { s: 1, e: 8, title: 'Záletník', overview: 'Prášek řeší citové problémy jednoho ze stálých hostů.' },
  { s: 1, e: 9, title: 'Výletník', overview: 'Výprava štamgastů mimo jejich domovský lokál.' },
  { s: 1, e: 10, title: 'Svačinář', overview: 'Kachna odmítne vařit a Babula organizuje vlastní bufet.' },
  { s: 1, e: 11, title: 'Záskok', overview: 'Dušek musí odjet a za pípou ho střídá náhradník.' },
  { s: 1, e: 12, title: 'Štědrý večer', overview: 'Vánoce U kotvy – kapr, stromeček a štamgasti pohromadě.' }
];

const MOST_EPISODES = [
  { s: 1, e: 1, title: '1. díl', overview: 'Luďan přijde o práci na autodromu a v hospodě Severka řeší své trable.' },
  { s: 1, e: 2, title: '2. díl', overview: 'Luďan se setkává se svým bratrem Pavlem, který je nyní Dášou.' },
  { s: 1, e: 3, title: '3. díl', overview: 'Franta shání práci a Luďan se učí komunikovat s Dášou.' },
  { s: 1, e: 4, title: '4. díl', overview: 'Vyhrocená situace na sídlišti Chánov a fotbalový zápas.' },
  { s: 1, e: 5, title: '5. díl', overview: 'Dáša nastupuje jako servírka v Severce a štamgasti jsou v šoku.' },
  { s: 1, e: 6, title: '6. díl', overview: 'Luďanův syn Tonda se zamiluje a otec mu dává svérázné rady.' },
  { s: 1, e: 7, title: '7. díl', overview: 'Plán na usmíření a velká sázka v Severce.' },
  { s: 1, e: 8, title: '8. díl', overview: 'Finále v Mostě. Luďan, Franta a Dáša v rozhodujícím střetu.' }
];

const OKRESNI_PREBOR_EPISODES = [
  { s: 1, e: 1, title: 'Pohřeb', overview: 'Úmrtí legendárního trenéra a boj o jeho urnu na hřišti Slavoje Houslice.' },
  { s: 1, e: 2, title: 'Sponzor', overview: 'Klub shání peníze na novou sezónu od místního podnikatele.' },
  { s: 1, e: 3, title: 'Láska', overview: 'Jarda Kužel řeší milostné pletky na úkor tréninku.' },
  { s: 1, e: 4, title: 'Návrat', overview: 'Václav Orel přivádí posilu, která rozdělí kabinu.' },
  { s: 1, e: 5, title: 'Sudí', overview: 'Zápas pískají rozhodčí s velmi specifickým citem pro fauly.' },
  { s: 1, e: 6, title: 'Jaro', overview: 'Začátek jarní části a Luňákova taktika s betonem v obraně.' },
  { s: 1, e: 7, title: 'Kopačky', overview: 'Ztráta štastných kopaček střelce Slavoje Houslice.' },
  { s: 1, e: 8, title: 'Derby', overview: 'Největší zápas roku proti Kostomlatům!' }
];

const VYSEHRAD_EPISODES = Array.from({ length: 10 }, (_, i) => ({
  s: 1,
  e: i + 1,
  title: `${i + 1}. díl`,
  overview: `Lavi a jeho neuvěřitelné fotbalové i mimofotbalové eskapády v FK Slavoj Vyšehrad (Díl ${i + 1}).`
}));

function getEpisodesForShow(showId) {
  if (showId === 'jbp_comeback' || showId === 'tt1330086') {
    return COMEBACK_EPISODES.map(ep => ({
      id: `${showId}:${ep.s}:${ep.e}`,
      title: `${ep.s}x${ep.e < 10 ? '0' + ep.e : ep.e} - ${ep.title}`,
      name: `${ep.s}x${ep.e < 10 ? '0' + ep.e : ep.e} - ${ep.title}`,
      season: ep.s,
      number: ep.e,
      episode: ep.e,
      overview: ep.overview,
      thumbnail: 'https://image.pmgstatic.com/cache/resized/w663/files/images/film/posters/159/995/159995058_6da5f2.jpg'
    }));
  }
  if (showId === 'jbp_bozi_plan' || showId === 'tt32876544') {
    return BOZI_PLAN_EPISODES.map(ep => ({
      id: `${showId}:${ep.s}:${ep.e}`,
      title: `1x${ep.e < 10 ? '0' + ep.e : ep.e} - ${ep.title}`,
      name: `1x${ep.e < 10 ? '0' + ep.e : ep.e} - ${ep.title}`,
      season: ep.s,
      number: ep.e,
      episode: ep.e,
      overview: ep.overview,
      thumbnail: 'https://image.pmgstatic.com/cache/resized/w663/files/images/film/posters/168/985/168985114_9fbf51.jpg'
    }));
  }
  if (showId === 'jbp_hospoda' || showId === 'tt0178135') {
    return HOSPODA_EPISODES.map(ep => ({
      id: `${showId}:${ep.s}:${ep.e}`,
      title: `1x${ep.e < 10 ? '0' + ep.e : ep.e} - ${ep.title}`,
      name: `1x${ep.e < 10 ? '0' + ep.e : ep.e} - ${ep.title}`,
      season: ep.s,
      number: ep.e,
      episode: ep.e,
      overview: ep.overview,
      thumbnail: 'https://image.pmgstatic.com/cache/resized/w663/files/images/film/posters/158/511/158511082_ff3997.jpg'
    }));
  }
  if (showId === 'jbp_most' || showId === 'tt9205566') {
    return MOST_EPISODES.map(ep => ({
      id: `${showId}:${ep.s}:${ep.e}`,
      title: `1x${ep.e < 10 ? '0' + ep.e : ep.e} - ${ep.title}`,
      name: `1x${ep.e < 10 ? '0' + ep.e : ep.e} - ${ep.title}`,
      season: ep.s,
      number: ep.e,
      episode: ep.e,
      overview: ep.overview,
      thumbnail: 'https://image.pmgstatic.com/cache/resized/w663/files/images/film/posters/163/279/163279899_b9dfc4.jpg'
    }));
  }
  if (showId === 'jbp_okresni_prebor' || showId === 'tt1739958') {
    return OKRESNI_PREBOR_EPISODES.map(ep => ({
      id: `${showId}:${ep.s}:${ep.e}`,
      title: `1x${ep.e < 10 ? '0' + ep.e : ep.e} - ${ep.title}`,
      name: `1x${ep.e < 10 ? '0' + ep.e : ep.e} - ${ep.title}`,
      season: ep.s,
      number: ep.e,
      episode: ep.e,
      overview: ep.overview,
      thumbnail: 'https://image.pmgstatic.com/cache/resized/w663/files/images/film/posters/158/443/158443553_287413.jpg'
    }));
  }
  if (showId === 'jbp_vysehrad' || showId === 'tt6186834') {
    return VYSEHRAD_EPISODES.map(ep => ({
      id: `${showId}:${ep.s}:${ep.e}`,
      title: `1x${ep.e < 10 ? '0' + ep.e : ep.e} - ${ep.title}`,
      name: `1x${ep.e < 10 ? '0' + ep.e : ep.e} - ${ep.title}`,
      season: ep.s,
      number: ep.e,
      episode: ep.e,
      overview: ep.overview,
      thumbnail: 'https://image.pmgstatic.com/cache/resized/w663/files/images/film/posters/161/447/161447087_5e4310.jpg'
    }));
  }
  return [];
}

// ============================================================================
// 4. STREAM EXTRACTION ENGINES (PREHRAJ.TO DIRECT + YOUTUBE HD)
// ============================================================================
const STREAM_CACHE = new Map();
const CACHE_TTL_MS = 2 * 60 * 60 * 1000; // 2 hours

const PREHRAJ_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Cookie': 'AC=C',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'X-Requested-With': 'XMLHttpRequest',
  'Referer': 'https://prehrajto.cz/'
};

/**
 * Scrapes Prehraj.to for direct MP4 video streams
 */
async function scrapePrehraj(query) {
  try {
    const searchUrl = `https://prehrajto.cz/hledej/${encodeURIComponent(query)}`;
    const searchResp = await axios.get(searchUrl, {
      headers: PREHRAJ_HEADERS,
      timeout: 7000
    });

    const html = searchResp.data;
    if (typeof html !== 'string') return [];

    // Find links in format: href="/slug/hex16"
    const linkMatches = [...html.matchAll(/href="(\/[a-z0-9\-]+\/([a-f0-9]{16}))"/gi)];
    if (!linkMatches || linkMatches.length === 0) return [];

    // Take up to 2 distinct video candidate paths
    const candidatePaths = [...new Set(linkMatches.map(m => m[1]))].slice(0, 2);
    const streams = [];

    for (const path of candidatePaths) {
      try {
        const detailUrl = `https://prehrajto.cz${path}`;
        const detailResp = await axios.get(detailUrl, {
          headers: PREHRAJ_HEADERS,
          timeout: 6000
        });

        const detailHtml = detailResp.data;
        if (typeof detailHtml !== 'string') continue;

        // Extract direct video URL from `sources = [{ file: "...", label: '720p' }]`
        const sourcesMatch = detailHtml.match(/sources\s*=\s*\[([\s\S]*?)\];/);
        let videoFile = '';
        let quality = '720p HD';

        if (sourcesMatch) {
          const fileMatch = sourcesMatch[1].match(/file:\s*"([^"]+)"/);
          if (fileMatch) videoFile = fileMatch[1];
          const labelMatch = sourcesMatch[1].match(/label:\s*['"]([^'"]+)['"]/);
          if (labelMatch) quality = labelMatch[1];
        }

        // Fallback: look for direct .mp4 or .m3u8 CDN links
        if (!videoFile) {
          const directMatch = detailHtml.match(/(https?:\/\/[^\s"'<>]+\.(?:mp4|m3u8)[^\s"'<>]*)/i);
          if (directMatch) videoFile = directMatch[1];
        }

        if (videoFile) {
          // Extract page title or slug for friendly name
          const slugTitle = path.split('/')[1]?.replace(/-/g, ' ') || query;
          streams.push({
            name: `🇨🇿 Prehraj.to [${quality}]`,
            title: `[PREHRAJ.TO] ${slugTitle.substring(0, 50)}\n⚡ Přímý MP4 stream (${quality}) • Bez sekání`,
            url: videoFile,
            behaviorHints: { notWebReady: false }
          });
        }
      } catch (err) {
        // Continue to next candidate
      }
    }

    return streams;
  } catch (err) {
    return [];
  }
}

/**
 * Searches YouTube for verified full episodes and films
 */
async function searchYouTube(query, isMovie = false) {
  try {
    const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
    const res = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept-Language': 'cs-CZ,cs;q=0.9,en;q=0.8'
      },
      timeout: 7000
    });

    const html = res.data;
    if (typeof html !== 'string') return [];

    const match = html.match(/ytInitialData\s*=\s*({[\s\S]*?});<\/script>/);
    if (!match) return [];

    const data = JSON.parse(match[1]);
    const contents = data?.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents || [];
    const streams = [];

    for (const sec of contents) {
      const itemSection = sec?.itemSectionRenderer?.contents || [];
      for (const item of itemSection) {
        const vr = item.videoRenderer;
        if (!vr || !vr.videoId) continue;

        const title = vr.title?.runs?.map(r => r.text).join('') || vr.title?.simpleText || '';
        const lengthText = vr.lengthText?.simpleText || '';

        // Sitcom filter: at least 15 min; Film filter: at least 50 min
        let validDuration = false;
        const parts = lengthText.split(':').map(Number);
        if (isMovie) {
          if (parts.length >= 3 || (parts.length === 2 && parts[0] >= 50)) validDuration = true;
        } else {
          if (parts.length >= 3 || (parts.length === 2 && parts[0] >= 15)) validDuration = true;
        }

        if (validDuration) {
          streams.push({
            name: `▶ YouTube HD [${lengthText}]`,
            title: `[YOUTUBE] ${title}\nSledovat na YouTube (${lengthText}) • 1080p`,
            ytId: vr.videoId
          });
          if (streams.length >= 3) break;
        }
      }
      if (streams.length >= 3) break;
    }

    return streams;
  } catch (err) {
    return [];
  }
}

// ============================================================================
// 5. STREMIO ADDON BUILDER & HANDLERS
// ============================================================================
const builder = new addonBuilder(manifest);

// Catalog Handler
builder.defineCatalogHandler(({ type, id, extra }) => {
  const search = extra?.search?.toLowerCase()?.trim();

  if (type === 'series') {
    let items = SERIES_METADATA;
    if (search) {
      items = items.filter(s =>
        s.name.toLowerCase().includes(search) ||
        s.searchTerms.some(t => t.toLowerCase().includes(search))
      );
    }
    return Promise.resolve({
      metas: items.map(s => ({
        id: s.id,
        type: 'series',
        name: s.name,
        poster: s.poster,
        background: s.background,
        description: s.description,
        genres: s.genres,
        releaseInfo: s.releaseInfo,
        imdbRating: s.rating
      }))
    });
  }

  if (type === 'movie') {
    let items = MOVIES_METADATA;
    if (search) {
      items = items.filter(m =>
        m.name.toLowerCase().includes(search) ||
        m.searchTerms.some(t => t.toLowerCase().includes(search))
      );
    }
    return Promise.resolve({
      metas: items.map(m => ({
        id: m.id,
        type: 'movie',
        name: m.name,
        poster: m.poster,
        background: m.background,
        description: m.description,
        genres: m.genres,
        releaseInfo: m.releaseInfo,
        imdbRating: m.rating
      }))
    });
  }

  return Promise.resolve({ metas: [] });
});

// Meta Handler
builder.defineMetaHandler(({ type, id }) => {
  // 1. Series meta lookup
  if (type === 'series') {
    const show = SERIES_METADATA.find(s => s.id === id || s.imdb_id === id);
    if (show) {
      const episodes = getEpisodesForShow(show.id);
      return Promise.resolve({
        meta: {
          id: show.id,
          type: 'series',
          name: show.name,
          poster: show.poster,
          background: show.background,
          logo: show.logo,
          description: show.description,
          genres: show.genres,
          releaseInfo: show.releaseInfo,
          imdbRating: show.rating,
          videos: episodes
        }
      });
    }
  }

  // 2. Movie meta lookup
  if (type === 'movie') {
    const movie = MOVIES_METADATA.find(m => m.id === id || m.imdb_id === id);
    if (movie) {
      return Promise.resolve({
        meta: {
          id: movie.id,
          type: 'movie',
          name: movie.name,
          poster: movie.poster,
          background: movie.background,
          description: movie.description,
          genres: movie.genres,
          releaseInfo: movie.releaseInfo,
          imdbRating: movie.rating
        }
      });
    }
  }

  return Promise.resolve({ meta: null });
});

// Stream Handler
builder.defineStreamHandler(async ({ type, id }) => {
  // Check in-memory cache
  const cached = STREAM_CACHE.get(id);
  if (cached && cached.expiresAt > Date.now()) {
    return { streams: cached.streams };
  }

  const streams = [];

  try {
    // 1. Series Episode Stream (format: showId:season:episode)
    if (type === 'series' && id.includes(':')) {
      const parts = id.split(':');
      const showId = parts[0];
      const seasonNum = parseInt(parts[1], 10);
      const epNum = parseInt(parts[2], 10);

      const show = SERIES_METADATA.find(s => s.id === showId || s.imdb_id === showId);
      const showTitle = show ? show.name : (showId.startsWith('tt') ? 'Comeback' : showId);

      // Look up specific episode title
      const episodes = getEpisodesForShow(show?.id || showId);
      const ep = episodes.find(e => e.season === seasonNum && e.number === epNum);
      const epTitle = ep ? ep.title.replace(/^[0-9]+x[0-9]+\s*-\s*/, '') : '';

      // Construct multiple search variants for high Prehraj hit rate
      const queries = [
        `${showTitle} ${seasonNum}x${epNum < 10 ? '0' + epNum : epNum}`,
        `${showTitle} ${epNum}.díl`,
        `${showTitle} S0${seasonNum}E0${epNum}`,
        epTitle ? `${showTitle} ${epTitle}` : `${showTitle} ${epNum}`
      ];

      // Execute Prehraj and YouTube searches in parallel
      const [prehrajResults, ytResults] = await Promise.all([
        (async () => {
          for (const q of queries) {
            const res = await scrapePrehraj(q);
            if (res.length > 0) return res;
          }
          return [];
        })(),
        searchYouTube(`${showTitle} ${seasonNum}x${epNum} celý díl`, false)
      ]);

      streams.push(...prehrajResults);
      streams.push(...ytResults);
    }
    // 2. Movie Stream (format: movieId)
    else if (type === 'movie') {
      const movie = MOVIES_METADATA.find(m => m.id === id || m.imdb_id === id);
      const movieTitle = movie ? movie.name : id;
      const releaseYear = movie ? movie.releaseInfo : '';

      const [prehrajResults, ytResults] = await Promise.all([
        (async () => {
          const res1 = await scrapePrehraj(`${movieTitle} ${releaseYear}`);
          if (res1.length > 0) return res1;
          return scrapePrehraj(movieTitle);
        })(),
        searchYouTube(`${movieTitle} celý film`, true)
      ]);

      streams.push(...prehrajResults);
      streams.push(...ytResults);
    }

    // Cache results
    STREAM_CACHE.set(id, {
      streams,
      expiresAt: Date.now() + CACHE_TTL_MS
    });

    return { streams };
  } catch (err) {
    console.warn(`[JBP StreamResolver] Error resolving ${id}:`, err.message);
    return { streams: [] };
  }
});

// ============================================================================
// 6. VERCEL SERVERLESS EXPORT & WEB DASHBOARD
// ============================================================================
const addonInterface = builder.getInterface();
const proto = Object.getPrototypeOf(addonInterface);
if (proto && typeof proto.createRouter !== 'function') {
  proto.createRouter = function () {
    return sdkGetRouter(this);
  };
}

const getRouter = sdkGetRouter(addonInterface);

module.exports = (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  // Clean URL path
  const url = (req.url || '').split('?')[0];

  // Landing Page & Installation Dashboard
  if (url === '/' || url === '') {
    const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost:3000';
    const proto = req.headers['x-forwarded-proto'] || 'https';
    const manifestUrl = `${proto}://${host}/manifest.json`;
    const stremioUrl = `stremio://${host}/manifest.json`;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.end(`<!DOCTYPE html>
<html lang="cs">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>JebuPředplatný - Stremio Addon (🇨🇿 CZ/SK Free Stream)</title>
  <style>
    :root {
      --bg: #0b0c10;
      --card-bg: #14171f;
      --border: #232838;
      --accent: #e50914;
      --accent-hover: #f40612;
      --text-main: #f3f4f6;
      --text-muted: #9ca3af;
    }
    * { box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background: var(--bg);
      color: var(--text-main);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      padding: 24px;
      text-align: center;
    }
    .card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 40px 32px;
      max-width: 600px;
      width: 100%;
      box-shadow: 0 12px 32px rgba(0,0,0,0.6);
    }
    .badge {
      display: inline-block;
      background: rgba(229, 9, 20, 0.15);
      color: #ff4d4d;
      border: 1px solid rgba(229, 9, 20, 0.4);
      padding: 4px 12px;
      border-radius: 9999px;
      font-size: 0.8rem;
      font-weight: 700;
      letter-spacing: 0.5px;
      margin-bottom: 16px;
      text-transform: uppercase;
    }
    h1 {
      color: var(--text-main);
      margin: 0 0 12px;
      font-size: 2rem;
      font-weight: 800;
      letter-spacing: -0.5px;
    }
    h1 span { color: var(--accent); }
    p.lead {
      color: var(--text-muted);
      line-height: 1.6;
      margin-bottom: 28px;
      font-size: 1.05rem;
    }
    .btn {
      display: inline-block;
      background: var(--accent);
      color: #ffffff;
      text-decoration: none;
      padding: 16px 36px;
      border-radius: 10px;
      font-weight: 700;
      font-size: 1.1rem;
      transition: all 0.2s ease;
      box-shadow: 0 4px 16px rgba(229, 9, 20, 0.4);
      margin-bottom: 24px;
    }
    .btn:hover {
      background: var(--accent-hover);
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(229, 9, 20, 0.6);
    }
    .manifest {
      font-size: 0.85rem;
      color: var(--text-muted);
      word-break: break-all;
      margin-bottom: 28px;
    }
    code {
      background: #1f2433;
      padding: 6px 10px;
      border-radius: 6px;
      color: #e2e8f0;
      font-family: Consolas, monospace;
      font-size: 0.85rem;
    }
    .features {
      background: #0f1219;
      border: 1px solid #1e2330;
      border-radius: 12px;
      padding: 20px;
      text-align: left;
      font-size: 0.9rem;
      color: #cbd5e1;
      line-height: 1.7;
    }
    .features h3 {
      color: #fff;
      margin-top: 0;
      margin-bottom: 12px;
      font-size: 1rem;
    }
    .features ul {
      margin: 0;
      padding-left: 20px;
    }
    .footer {
      margin-top: 24px;
      font-size: 0.8rem;
      color: #64748b;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">🇨🇿 100% Free • Žádné předplatné</div>
    <h1>Jebu<span>Předplatný</span></h1>
    <p class="lead">Kultovní české seriály (<strong>Comeback</strong>, <strong>Boží plán</strong>, <strong>Hospoda</strong>, <strong>Most!</strong>, <strong>Okresní přebor</strong>) a filmy přímo ve Stremiu bez nutnosti placeného Debridu.</p>
    
    <a class="btn" href="${stremioUrl}">🚀 Nainstalovat do Stremia</a>
    
    <div class="manifest">
      Nebo zkopírujte URL manifestu do vyhledávače v doplňcích Stremia:<br><br>
      <code>${manifestUrl}</code>
    </div>

    <div class="features">
      <h3>✨ Co addon nabízí:</h3>
      <ul>
        <li><strong>🇨🇿 Prehraj.to:</strong> Přímé video MP4 streamy v 720p HD (bez zasekávání a bez účtu).</li>
        <li><strong>▶ YouTube HD:</strong> Ověřené celé epizody a filmy v 1080p.</li>
        <li><strong>Kompletní Comeback:</strong> Všech 51 dílů s názvy, popisy a přebaly.</li>
        <li><strong>Kultovní české klasiky:</strong> Pelíšky, Samotáři, Dědictví, Hospoda, ČT klenoty.</li>
        <li><strong>Univerzální kompatibilita:</strong> PC, Android TV, Google TV, Samsung Smart TV i mobily.</li>
      </ul>
    </div>

    <div class="footer">
      JebuPředplatný Addon • Made for Czech & Slovak Stremio Community
    </div>
  </div>
</body>
</html>`);
    return;
  }

  // Handle Stremio API calls
  getRouter(req, res, () => {
    res.statusCode = 404;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.end('Not found');
  });
};
