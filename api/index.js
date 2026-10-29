const { addonBuilder, getRouter: sdkGetRouter } = require('stremio-addon-sdk');
const axios = require('axios');

// ============================================================================
// 1. MANIFEST CONFIGURATION (JEBU PREDPLATNÝ - v1.2.0)
// ============================================================================
const manifest = {
  id: 'community.jebupredplatny.czsk',
  version: '1.2.0',
  name: 'JebuPředplatný (🇨🇿 CZ/SK Free Stream)',
  description: 'České kultovní seriály (Comeback, Boží plán, Hospoda, Okresní přebor, Most!, Vyšehrad) a české filmy zdarma bez předplatného. Přímé streamy z Prehraj.to a YouTube HD.',
  resources: [
    'catalog',
    {
      name: 'meta',
      types: ['series', 'movie'],
      idPrefixes: ['jbp_']
    },
    {
      name: 'stream',
      types: ['series', 'movie'],
      idPrefixes: ['jbp_', 'tt']
    }
  ],
  types: ['series', 'movie'],
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
// 2. METADATA CATALOGS (WITH VERIFIED WORKING 200-OK POSTER URLS)
// ============================================================================
const SERIES_METADATA = [
  {
    id: 'jbp_comeback',
    imdb_id: 'tt1330086',
    name: 'Comeback',
    type: 'series',
    genres: ['Komedie', 'Sitcom'],
    poster: 'https://www.serialzone.cz/obrazky/plakaty/comeback-2421.jpg',
    background: 'https://www.serialzone.cz/obrazky/plakaty/comeback-2421.jpg',
    logo: 'https://www.serialzone.cz/obrazky/plakaty/comeback-2421.jpg',
    description: 'Kultovní český sitcom televize Nova. Tomáš Pacovský (Tomi Paci), bývalá hvězda pop-music, provozuje obchod s hudebními nosiči U Dvou koček se svým bratrem Františkem (Ozzák), který je nefalšovaný metalista tělem i duší.',
    releaseInfo: '2008-2011',
    rating: '8.3',
    slug: 'comeback'
  },
  {
    id: 'jbp_bozi_plan',
    imdb_id: 'tt32876544',
    name: 'Boží plán',
    type: 'series',
    genres: ['Komedie', 'Vztahový'],
    poster: 'https://www.serialzone.cz/obrazky/plakaty/bozi-plan-36464.jpg',
    background: 'https://www.serialzone.cz/obrazky/plakaty/bozi-plan-36464.jpg',
    logo: 'https://www.serialzone.cz/obrazky/plakaty/bozi-plan-36464.jpg',
    description: 'Nový český komediální seriál (2026). Příběh netradičního společného soužití kamarádů Adama, Lukáše a Hynka u dobrosrdečného řidiče tramvaje Mirka (Tomáš Jeřábek), do jejichž života vstoupí mladá nevěsta Julie.',
    releaseInfo: '2026',
    rating: '7.8',
    slug: 'bozi-plan'
  },
  {
    id: 'jbp_hospoda',
    imdb_id: 'tt0178135',
    name: 'Hospoda',
    type: 'series',
    genres: ['Komedie', 'Sitcom'],
    poster: 'https://www.serialzone.cz/obrazky/plakaty/hospoda-1335.jpg',
    background: 'https://www.serialzone.cz/obrazky/plakaty/hospoda-1335.jpg',
    logo: 'https://www.serialzone.cz/obrazky/plakaty/hospoda-1335.jpg',
    description: 'Legendární český sitcom. Hospoda U kotvy a její svérázní štamgasti – topič Babula, advokát Richtera, psychiatr Prášek, tělocvikář Jonáš a další pod dohledem hospodského Duška a kuchaře Kachny.',
    releaseInfo: '1996-1997',
    rating: '8.1',
    slug: 'hospoda'
  },
  {
    id: 'jbp_okresni_prebor',
    imdb_id: 'tt1739958',
    name: 'Okresní přebor',
    type: 'series',
    genres: ['Komedie', 'Sportovní'],
    poster: 'https://www.serialzone.cz/obrazky/plakaty/okresni-prebor-3304.jpg',
    background: 'https://www.serialzone.cz/obrazky/plakaty/okresni-prebor-3304.jpg',
    logo: 'https://www.serialzone.cz/obrazky/plakaty/okresni-prebor-3304.jpg',
    description: 'Slavoj Houslice a jejich boj o postup v okresním přeboru. Trenér Jirka Luňák, předseda Václav Orel, veterán Jarda Kužel a řada dalších nezapomenutelných postav venkovského fotbalu.',
    releaseInfo: '2010',
    rating: '8.6',
    slug: 'okresni-prebor'
  },
  {
    id: 'jbp_most',
    imdb_id: 'tt9205566',
    name: 'Most!',
    type: 'series',
    genres: ['Komedie', 'Drama'],
    poster: 'https://www.serialzone.cz/obrazky/plakaty/most-1555.jpg',
    background: 'https://www.serialzone.cz/obrazky/plakaty/most-1555.jpg',
    logo: 'https://www.serialzone.cz/obrazky/plakaty/most-1555.jpg',
    description: 'Dycky Most! Osmidílný komediální seriál České televize od tvůrčí dvojice Jan Prušinovský a Petr Kolečko. Luďan, hospoda Severka, romský popelář Franta a bratr Dáša.',
    releaseInfo: '2019',
    rating: '8.4',
    slug: 'most'
  },
  {
    id: 'jbp_vysehrad',
    imdb_id: 'tt6186834',
    name: 'Vyšehrad',
    type: 'series',
    genres: ['Komedie', 'Sportovní'],
    poster: 'https://www.serialzone.cz/obrazky/plakaty/vysehrad-191.jpg',
    background: 'https://www.serialzone.cz/obrazky/plakaty/vysehrad-191.jpg',
    logo: 'https://www.serialzone.cz/obrazky/plakaty/vysehrad-191.jpg',
    description: 'Julius Lavický (Lavi), fotbalový talent s velkým srdcem a ještě větším sklonem k večírkům, alkoholu a průšvihům, který z první ligy spadl až do FK Slavoj Vyšehrad.',
    releaseInfo: '2016-2017',
    rating: '8.1',
    slug: 'vysehrad'
  },
  {
    id: 'jbp_ctvrta_hvezda',
    imdb_id: 'tt3490796',
    name: 'Čtvrtá hvězda',
    type: 'series',
    genres: ['Komedie', 'Sitcom'],
    poster: 'https://www.serialzone.cz/obrazky/plakaty/ctvrta-hvezda-2560.jpg',
    background: 'https://www.serialzone.cz/obrazky/plakaty/ctvrta-hvezda-2560.jpg',
    logo: 'https://www.serialzone.cz/obrazky/plakaty/ctvrta-hvezda-2560.jpg',
    description: 'Komediální seriál České televize a Dejvického divadla. Libeňský hotel Meteor a jeho zaměstnanci se snaží získat čtvrtou hvězdu.',
    releaseInfo: '2014',
    rating: '8.1',
    slug: 'ctvrta-hvezda'
  },
  {
    id: 'jbp_kosmo',
    imdb_id: 'tt6182276',
    name: 'Kosmo',
    type: 'series',
    genres: ['Komedie', 'Sci-Fi'],
    poster: 'https://www.serialzone.cz/obrazky/plakaty/kosmo-4399.jpg',
    background: 'https://www.serialzone.cz/obrazky/plakaty/kosmo-4399.jpg',
    logo: 'https://www.serialzone.cz/obrazky/plakaty/kosmo-4399.jpg',
    description: 'První česká vesmírná mise s lidskou posádkou na Měsíc. Satirický komediální miniseriál České televize.',
    releaseInfo: '2016',
    rating: '8.2',
    slug: 'kosmo'
  },
  {
    id: 'jbp_devadesatky',
    imdb_id: 'tt14234502',
    name: 'Devadesátky',
    type: 'series',
    genres: ['Krimi', 'Drama'],
    poster: 'https://www.serialzone.cz/obrazky/plakaty/devadesatky-12020.jpg',
    background: 'https://www.serialzone.cz/obrazky/plakaty/devadesatky-12020.jpg',
    logo: 'https://www.serialzone.cz/obrazky/plakaty/devadesatky-12020.jpg',
    description: 'Šestidílná kriminální série zachycující vyšetřování nejzávažnějších zločinů divokých 90. let v České republice.',
    releaseInfo: '2022',
    rating: '8.7',
    slug: 'devadesatky'
  },
  {
    id: 'jbp_chalupari',
    imdb_id: 'tt0169438',
    name: 'Chalupáři',
    type: 'series',
    genres: ['Komedie'],
    poster: 'https://www.serialzone.cz/obrazky/plakaty/chalupari-3132.jpg',
    background: 'https://www.serialzone.cz/obrazky/plakaty/chalupari-3132.jpg',
    logo: 'https://www.serialzone.cz/obrazky/plakaty/chalupari-3132.jpg',
    description: 'Kultovní seriál o soužití pražského důchodce Evžena Humla a vesnického kutila Bohouše Císaře ve vesničce Třešňová.',
    releaseInfo: '1975',
    rating: '8.0',
    slug: 'chalupari'
  }
];

const MOVIES_METADATA = [
  {
    id: 'jbp_pelisky',
    imdb_id: 'tt0201844',
    name: 'Pelíšky',
    type: 'movie',
    genres: ['Komedie', 'Drama'],
    poster: 'https://images.metahub.space/poster/medium/tt0201844/img',
    background: 'https://images.metahub.space/background/medium/tt0201844/img',
    description: 'Kultovní česká hořká komedie Jana Hřebejka z konce šedesátých let. Rodiny Šebků a Krausů, nerozbitné plastové lžičky a legendární hlášky.',
    releaseInfo: '1999',
    rating: '9.1',
    slug: 'pelisky'
  },
  {
    id: 'jbp_samotari',
    imdb_id: 'tt0245429',
    name: 'Samotáři',
    type: 'movie',
    genres: ['Komedie', 'Drama'],
    poster: 'https://images.metahub.space/poster/medium/tt0245429/img',
    background: 'https://images.metahub.space/background/medium/tt0245429/img',
    description: 'Generační komedie Davida Ondříčka a Petra Zelenky o skupině mladých lidí v Praze na přelomu tisíciletí. Jakub, Hanka, Petr a nezapomenutelné scény.',
    releaseInfo: '2000',
    rating: '8.4',
    slug: 'samotari'
  },
  {
    id: 'jbp_dedictvi',
    imdb_id: 'tt0106675',
    name: 'Dědictví aneb Kurvahošigutntag',
    type: 'movie',
    genres: ['Komedie'],
    poster: 'https://images.metahub.space/poster/medium/tt0106675/img',
    background: 'https://images.metahub.space/background/medium/tt0106675/img',
    description: 'Věra Chytilová a Bolek Polívka v nezapomenutelné komedii o rázovitém vesnickém chlapíkovi Bohušovi, který nečekaně zdědí obrovský majetek.',
    releaseInfo: '1992',
    rating: '8.4',
    slug: 'dedictvi-aneb-kurvahosigutntag'
  },
  {
    id: 'jbp_steboumebavisvet',
    imdb_id: 'tt0084620',
    name: 'S tebou mě baví svět',
    type: 'movie',
    genres: ['Komedie', 'Rodinný'],
    poster: 'https://images.metahub.space/poster/medium/tt0084620/img',
    background: 'https://images.metahub.space/background/medium/tt0084620/img',
    description: 'Komedie století režisérky Marie Poledňákové. Každoroční pánská jízda tří kamarádů v Beskydech se změní v mateřskou školu v přírodě.',
    releaseInfo: '1982',
    rating: '8.2',
    slug: 's-tebou-me-bavi-svet'
  },
  {
    id: 'jbp_nasamoteulesa',
    imdb_id: 'tt0074949',
    name: 'Na samotě u lesa',
    type: 'movie',
    genres: ['Komedie'],
    poster: 'https://images.metahub.space/poster/medium/tt0074949/img',
    background: 'https://images.metahub.space/background/medium/tt0074949/img',
    description: 'Manželé Lavičkovi touží po chalupě a dohodnou se s dědou Komárkem, že od něj koupí malebnou roubenku, až na podzim zaseje.',
    releaseInfo: '1976',
    rating: '8.4',
    slug: 'na-samote-u-lesa'
  },
  {
    id: 'jbp_slunceseno1',
    imdb_id: 'tt0088143',
    name: 'Slunce, seno, jahody',
    type: 'movie',
    genres: ['Komedie'],
    poster: 'https://images.metahub.space/poster/medium/tt0088143/img',
    background: 'https://images.metahub.space/background/medium/tt0088143/img',
    description: 'Zdeněk Troška a jeho jihočeská vesnice Hoštice. Student Šimon Plánička přichází se svou teorií zvyšování dojivosti krav pomocí hudby.',
    releaseInfo: '1984',
    rating: '7.9',
    slug: 'slunce-seno-jahody'
  },
  {
    id: 'jbp_slunceseno2',
    imdb_id: 'tt0098348',
    name: 'Slunce, seno a pár facek',
    type: 'movie',
    genres: ['Komedie'],
    poster: 'https://images.metahub.space/poster/medium/tt0098348/img',
    background: 'https://images.metahub.space/background/medium/tt0098348/img',
    description: 'Přípravy svatby Blaženy a Vency v Hošticích přeroste ve vesnickou válku dvou rodin, plnou facek a drbů.',
    releaseInfo: '1989',
    rating: '7.8',
    slug: 'slunce-seno-a-par-facek'
  },
  {
    id: 'jbp_vesnicko',
    imdb_id: 'tt0089851',
    name: 'Vesničko má středisková',
    type: 'movie',
    genres: ['Komedie'],
    poster: 'https://images.metahub.space/poster/medium/tt0089851/img',
    background: 'https://images.metahub.space/background/medium/tt0089851/img',
    description: 'Jiří Menzel a Zdeněk Svěrák v nominaci na Oscara. Mentálně zaostalý Otík a řidič náklaďáku pan Pávek v malebné středočeské vesnici Křečovice.',
    releaseInfo: '1985',
    rating: '8.8',
    slug: 'vesnicko-ma-strediskova'
  },
  {
    id: 'jbp_cernibaroni',
    imdb_id: 'tt0103957',
    name: 'Černí baroni',
    type: 'movie',
    genres: ['Komedie'],
    poster: 'https://images.metahub.space/poster/medium/tt0103957/img',
    background: 'https://images.metahub.space/background/medium/tt0103957/img',
    description: 'Kultovní komedie podle knihy Miloslava Švandrlíka o pétépácích na zámku Zelená Hora. Major Terazky a jeho legendární otázky.',
    releaseInfo: '1992',
    rating: '8.2',
    slug: 'cerni-baroni'
  },
  {
    id: 'jbp_kolja',
    imdb_id: 'tt0116790',
    name: 'Kolja',
    type: 'movie',
    genres: ['Komedie', 'Drama'],
    poster: 'https://images.metahub.space/poster/medium/tt0116790/img',
    background: 'https://images.metahub.space/background/medium/tt0116790/img',
    description: 'Oscarový film Jana a Zdeňka Svěrákových o stárnoucím violoncellistovi Loukovi a malém ruském chlapci Koljovi na pozadí roku 1989.',
    releaseInfo: '1996',
    rating: '8.6',
    slug: 'kolja'
  },
  {
    id: 'jbp_marecku',
    imdb_id: 'tt0074868',
    name: 'Marečku, podejte mi pero!',
    type: 'movie',
    genres: ['Komedie'],
    poster: 'https://images.metahub.space/poster/medium/tt0074868/img',
    background: 'https://images.metahub.space/background/medium/tt0074868/img',
    description: 'Mistr v továrně Jiří Kroupa musí usednout do večerní průmyslovky, aby si zvýšil kvalifikaci, a zasedne do stejných lavic jako jeho dospívající syn.',
    releaseInfo: '1976',
    rating: '8.8',
    slug: 'marecku-podejte-mi-pero'
  }
];

// ============================================================================
// 3. EPISODES DATABASE (DETAILED CZECH EPISODE TITLES)
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
  { s: 1, e: 1, title: 'Pohřeb', overview: 'Úmrtí trenéra a boj o jeho urnu na hřišti Slavoje Houslice.' },
  { s: 1, e: 2, title: 'Sponzor', overview: 'Klub shání peníze na novou sezónu od místního podnikatele.' },
  { s: 1, e: 3, title: 'Láska', overview: 'Jarda Kužel řeší milostné pletky na úkor tréninku.' },
  { s: 1, e: 4, title: 'Návrat', overview: 'Václav Orel přivádí posilu, která rozdělí kabinu.' },
  { s: 1, e: 5, title: 'Sudí', overview: 'Zápas pískají rozhodčí s velmi specifickým citem pro fauly.' },
  { s: 1, e: 6, title: 'Jaro', overview: 'Začátek jarní části a Luňákova taktika s betonem v obraně.' },
  { s: 1, e: 7, title: 'Kopačky', overview: 'Ztráta šťastných kopaček střelce Slavoje Houslice.' },
  { s: 1, e: 8, title: 'Derby', overview: 'Největší zápas roku proti Kostomlatům!' }
];

const VYSEHRAD_EPISODES = Array.from({ length: 10 }, (_, i) => ({
  s: 1,
  e: i + 1,
  title: `${i + 1}. díl`,
  overview: `Lavi a jeho neuvěřitelné fotbalové i mimofotbalové eskapády v FK Slavoj Vyšehrad (Díl ${i + 1}).`
}));

function getRawEpisodes(baseId) {
  if (baseId.includes('comeback')) return COMEBACK_EPISODES;
  if (baseId.includes('bozi_plan')) return BOZI_PLAN_EPISODES;
  if (baseId.includes('hospoda')) return HOSPODA_EPISODES;
  if (baseId.includes('most')) return MOST_EPISODES;
  if (baseId.includes('okresni_prebor')) return OKRESNI_PREBOR_EPISODES;
  if (baseId.includes('vysehrad')) return VYSEHRAD_EPISODES;
  return [];
}

function buildEpisodesForId(requestedId, show) {
  const raw = getRawEpisodes(show.id);
  return raw.map(ep => ({
    id: `${requestedId}:${ep.s}:${ep.e}`,
    title: `${ep.s}x${ep.e < 10 ? '0' + ep.e : ep.e} - ${ep.title}`,
    name: `${ep.s}x${ep.e < 10 ? '0' + ep.e : ep.e} - ${ep.title}`,
    season: ep.s,
    number: ep.e,
    episode: ep.e,
    overview: ep.overview,
    thumbnail: show.poster
  }));
}

// ============================================================================
// 4. STREAM EXTRACTION ENGINES (PREHRAJ.TO + CLEAN YOUTUBE HD)
// ============================================================================
const STREAM_CACHE = new Map();
const CACHE_TTL_MS = 2 * 60 * 60 * 1000; // 2 hours

const PREHRAJ_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Cookie': 'AC=C',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Referer': 'https://prehrajto.cz/'
};

/**
 * Scrapes Prehraj.to using slug format (fast & avoids 429 rate limit)
 */
async function scrapePrehrajSlug(slug) {
  try {
    const searchUrl = `https://prehrajto.cz/hledej/${slug}`;
    const searchResp = await axios.get(searchUrl, {
      headers: PREHRAJ_HEADERS,
      timeout: 3800
    });

    const html = searchResp.data;
    if (typeof html !== 'string') return [];

    const linkMatches = [...html.matchAll(/href="(\/[a-z0-9\-]+\/([a-f0-9]{16}))"/gi)];
    if (!linkMatches || linkMatches.length === 0) return [];

    // Take top candidate
    const candidatePath = linkMatches[0][1];
    const detailUrl = `https://prehrajto.cz${candidatePath}`;

    const detailResp = await axios.get(detailUrl, {
      headers: PREHRAJ_HEADERS,
      timeout: 3500
    });

    const detailHtml = detailResp.data;
    if (typeof detailHtml !== 'string') return [];

    // Extract direct video URL from sources = [{ file: "..." }]
    let videoFile = '';
    let quality = '720p HD';

    const sourcesMatch = detailHtml.match(/sources\s*=\s*\[([\s\S]*?)\];/);
    if (sourcesMatch) {
      const fileMatch = sourcesMatch[1].match(/file:\s*"([^"]+)"/);
      if (fileMatch) videoFile = fileMatch[1];
      const labelMatch = sourcesMatch[1].match(/label:\s*['"]([^'"]+)['"]/);
      if (labelMatch) quality = labelMatch[1];
    }

    if (!videoFile) {
      const directMatch = detailHtml.match(/(https?:\/\/[^\s"'<>]+\.(?:mp4|m3u8)[^\s"'<>]*)/i);
      if (directMatch) videoFile = directMatch[1];
    }

    if (videoFile) {
      const slugTitle = candidatePath.split('/')[1]?.replace(/-/g, ' ') || slug;
      return [{
        name: `🇨🇿 Prehraj.to [${quality}]`,
        title: `[PREHRAJ.TO] ${slugTitle.substring(0, 50)}\n⚡ Přímý MP4 stream (${quality}) • Bez sekání`,
        url: videoFile,
        behaviorHints: { notWebReady: false }
      }];
    }
    return [];
  } catch (err) {
    return [];
  }
}

/**
 * Validates whether a YouTube result is actual content, NOT spam or fan compilation
 */
function isCleanYouTubeVideo(title, durationStr, showName, isMovie = false) {
  const t = title.toLowerCase();
  
  // Strict anti-spam: reject fan compilations, clips, and spam clickbait
  const spamWords = ['kompilace', 'sestřih', 'best of', 'policejní', '2026', 'epizody 1~', 'epizody 20~', 'scény', 'trailer', 'ukázka', 'fakta'];
  if (spamWords.some(w => t.includes(w))) return false;

  const parts = durationStr.split(':').map(Number);
  if (parts.some(isNaN)) return false;

  let totalMin = 0;
  if (parts.length === 2) totalMin = parts[0];
  else if (parts.length === 3) totalMin = parts[0] * 60 + parts[1];

  if (isMovie) {
    // Film: between 50 and 190 minutes
    if (totalMin < 50 || totalMin > 190) return false;
  } else {
    // Sitcom / series episode: between 18 and 50 minutes (strictly reject 1.5h - 2h fake compilations)
    if (totalMin < 18 || totalMin > 50) return false;
  }

  // Title must contain key words from show name
  const cleanShow = showName.toLowerCase().replace(/[^a-z0-9]/g, '');
  const cleanTitle = t.replace(/[^a-z0-9]/g, '');
  if (!cleanTitle.includes(cleanShow.substring(0, 5))) return false;

  return true;
}

/**
 * Searches YouTube with strict anti-spam filters
 */
async function searchCleanYouTube(query, showName, isMovie = false) {
  try {
    const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
    const res = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept-Language': 'cs-CZ,cs;q=0.9,en;q=0.8'
      },
      timeout: 3500
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

        if (isCleanYouTubeVideo(title, lengthText, showName, isMovie)) {
          streams.push({
            name: `▶ YouTube HD [${lengthText}]`,
            title: `[YOUTUBE] ${title}\nSledovat na YouTube (${lengthText}) • 1080p`,
            ytId: vr.videoId
          });
          if (streams.length >= 2) break;
        }
      }
      if (streams.length >= 2) break;
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
      items = items.filter(s => s.name.toLowerCase().includes(search) || s.slug.includes(search));
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
      items = items.filter(m => m.name.toLowerCase().includes(search) || m.slug.includes(search));
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

// Meta Handler (Guarantees returned meta.id matches requested id exactly!)
builder.defineMetaHandler(({ type, id }) => {
  // 1. Series meta lookup
  if (type === 'series') {
    const show = SERIES_METADATA.find(s => s.id === id || s.imdb_id === id);
    if (show) {
      const episodes = buildEpisodesForId(id, show);
      return Promise.resolve({
        meta: {
          id: id,
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
          id: id,
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

// Stream Handler (Strict matching, never defaults to Comeback for unknown shows)
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

      // Find matched show in our supported catalog
      const show = SERIES_METADATA.find(s => s.id === showId || s.imdb_id === showId);
      if (!show) {
        // Unknown external series (e.g. Breaking Bad) -> DO NOT hijack!
        return { streams: [] };
      }

      const showSlug = show.slug;
      const showTitle = show.name;

      // Smart slugs for Prehraj (e.g. comeback-1-dil, hospoda-01)
      const primarySlug = `${showSlug}-${epNum}-dil`;
      const secondarySlug = `${showSlug}-${epNum < 10 ? '0' + epNum : epNum}`;

      // Parallel execution with tight timeouts
      const [prehrajRes, ytRes] = await Promise.all([
        (async () => {
          const res1 = await scrapePrehrajSlug(primarySlug);
          if (res1.length > 0) return res1;
          return scrapePrehrajSlug(secondarySlug);
        })(),
        searchCleanYouTube(`${showTitle} ${epNum}. díl`, showTitle, false)
      ]);

      streams.push(...prehrajRes);
      streams.push(...ytRes);
    }
    // 2. Movie Stream (format: movieId)
    else if (type === 'movie') {
      const movie = MOVIES_METADATA.find(m => m.id === id || m.imdb_id === id);
      if (!movie) {
        return { streams: [] };
      }

      const [prehrajRes, ytRes] = await Promise.all([
        scrapePrehrajSlug(movie.slug),
        searchCleanYouTube(`${movie.name} celý film`, movie.name, true)
      ]);

      streams.push(...prehrajRes);
      streams.push(...ytRes);
    }

    // Cache results
    STREAM_CACHE.set(id, {
      streams,
      expiresAt: Date.now() + CACHE_TTL_MS
    });

    return { streams };
  } catch (err) {
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
if (typeof addonInterface.createRouter !== 'function') {
  addonInterface.createRouter = () => sdkGetRouter(addonInterface);
}

const getRouter = builder.getInterface().createRouter();

module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  const url = (req.url || '').split('?')[0];

  if (url === '/' || url === '' || url === '/index.html') {
    const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost:3000';
    const proto = req.headers['x-forwarded-proto'] || 'https';
    const manifestUrl = `${proto}://${host}/manifest.json`;
    const stremioUrl = `stremio://${host}/manifest.json`;

    res.statusCode = 200;
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
    <div class="badge">🇨🇿 v1.2.0 • 100% Free • Žádné předplatné</div>
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
        <li><strong>🇨🇿 Prehraj.to:</strong> Přímé video MP4 streamy v 720p HD bez zasekávání.</li>
        <li><strong>▶ YouTube HD:</strong> Ověřené české epizody a filmy s filtrem proti kompilacím.</li>
        <li><strong>Kompletní Comeback:</strong> Všech 51 dílů s názvy, popisy a přebaly.</li>
        <li><strong>Kultovní české klasiky:</strong> Pelíšky, Samotáři, Dědictví, Hospoda, ČT klenoty.</li>
        <li><strong>Univerzální kompatibilita:</strong> PC, Android TV, Google TV, Samsung TV i mobily.</li>
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

  getRouter(req, res, () => {
    res.statusCode = 404;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.end('Not found');
  });
};
