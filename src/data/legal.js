/* ============================================================
   Právní stránky webu — přepsáno z podkladů (Obchodní podmínky,
   Zásady používání cookies, Zásady zpracování osobních údajů).
   Renderuje LegalPage.jsx. Každá sekce = { title, blocks }, blok je
   { p } odstavec, { ul } odrážky, { ol } číslovaný seznam, nebo
   { table } jednoduchá tabulka.
============================================================ */

const FOOTER = 'Nutriverse s.r.o. · IČO: 139 65 433 · sídlo: Světova 523/1, Praha 8, 180 00';

export const OBCHODNI_PODMINKY = {
  slug: 'obchodni-podminky',
  title: 'Obchodní podmínky',
  updated: 'Platné od zveřejnění na www.flipujkaru.cz',
  footer: FOOTER,
  sections: [
    {
      title: '1. Úvodní ustanovení',
      blocks: [
        { p: '1.1. Tyto obchodní podmínky (dále jen „Podmínky") upravují vzájemná práva a povinnosti mezi společností Nutriverse s.r.o., IČO: 139 65 433, se sídlem v Praze (dále jen „Poskytovatel"), a fyzickou nebo právnickou osobou, která si prostřednictvím webové stránky www.flipujkaru.cz zakoupí členství v placené komunitě Flipuj Káru (dále jen „Člen").' },
        { p: '1.2. Předmětem členství je přístup k obsahu, nástrojům, konzultacím a komunitě zaměřené na oblast nákupu, přípravy a prodeje (tzv. „flipování") osobních vozidel za účelem zisku (dále jen „Služba").' },
        { p: '1.3. Uzavřením smlouvy (dokončením objednávky a úhradou členského poplatku) Člen potvrzuje, že se s těmito Podmínkami seznámil, souhlasí s nimi a zavazuje se je dodržovat.' },
      ],
    },
    {
      title: '2. Členství a jeho aktivace',
      blocks: [
        { p: '2.1. Členství vzniká úhradou příslušného členského poplatku dle aktuálně platného ceníku uvedeného na webu www.flipujkaru.cz.' },
        { p: '2.2. Dnem aktivace členství se rozumí den, kdy je platba členského poplatku připsána na účet Poskytovatele, případně den zpřístupnění členské sekce, podle toho, který nastane dříve (dále jen „Aktivace").' },
        { p: '2.3. Členství je vázáno na konkrétní osobu (Člena) a není bez předchozího písemného souhlasu Poskytovatele převoditelné na třetí osobu.' },
      ],
    },
    {
      title: '3. Podpora při prvním flipu',
      blocks: [
        { p: '3.1. Poskytovatel se zavazuje poskytnout Členovi aktivní součinnost při realizaci jeho prvního flipu, zejména:' },
        { ul: [
          'doporučení a propojení s obchodními partnery Poskytovatele (např. autobazary, inzertní platformy, financující partneři, přepravci apod.),',
          'individuální konzultaci v rámci prvního flipu (dále jen „1:1 kooperace"), v rámci které Poskytovatel Členovi prakticky ukáže postup od nákupu až po prodej vozidla.',
        ] },
        { p: '3.2. 1:1 kooperace v rozsahu prvního flipu je poskytována jako součást členství bez dalšího poplatku.' },
        { p: '3.3. Poskytovatel si vyhrazuje právo nabídnout Členovi navazující individuální spolupráci nad rámec prvního flipu za samostatně sjednanou cenu, jejíž výše a podmínky budou stanoveny individuální dohodou mezi Poskytovatelem a Členem.' },
        { p: '3.4. Poskytovatel v průběhu lhůty dle čl. 4 aktivně nabízí Členovi podporu dle odst. 3.1. Nevyužití nabízené podpory ze strany Člena nemá vliv na povinnost splnit podmínky garance dle čl. 4.' },
      ],
    },
    {
      title: '4. Garance vrácení peněz',
      blocks: [
        { p: '4.1. Poskytovatel garantuje Členovi vrácení uhrazeného členského poplatku, pokud Člen do 60 kalendářních dnů od Aktivace neuskuteční svůj první nákup a následný prodej vozidla (tzv. „flip"), a to za předpokladu, že Člen v tomto období kumulativně splnil všechny následující podmínky:' },
        { ol: [
          'Absolvoval onboarding — dokončil úvodní onboardingový proces/školení poskytovaný v rámci členství, což je potvrzeno systémem Poskytovatele (např. dokončení onboardingového checklistu nebo videokurzu).',
          'Aktivně inzeroval vozidlo — měl alespoň jedno vozidlo aktivně a nepřetržitě inzerováno k prodeji po dobu minimálně 30 kalendářních dnů na nejméně 3 (třech) různých inzertních portálech současně (např. Bazoš.cz, Sbazar.cz, Autobazar.eu, TipCars.cz apod.).',
          'Doložil aktivitu — na vyžádání Poskytovatele předložil důkaz o splnění bodu 2, např. screenshoty aktivních inzerátů s viditelným datem vystavení, přímé odkazy na inzeráty, nebo export z nástroje pro správu inzerce.',
        ] },
        { p: '4.2. Postup uplatnění: Žádost o vrácení peněz musí Člen zaslat písemně e-mailem na kontaktní adresu Poskytovatele nejpozději do 7 kalendářních dnů po uplynutí lhůty dle odst. 4.1, spolu s doklady dle bodu 3 výše.' },
        { p: '4.3. Poskytovatel žádost posoudí do 14 kalendářních dnů od jejího doručení. V případě, že Člen prokazatelně splnil všechny podmínky dle odst. 4.1, vrátí Poskytovatel členský poplatek na bankovní účet, ze kterého byla platba provedena, a to do 14 kalendářních dnů od schválení žádosti.' },
        { p: '4.4. Garance dle tohoto článku se nevztahuje na případy, kdy Člen v průběhu lhůty dle odst. 4.1:' },
        { ul: [
          'nedokončil onboarding dle odst. 4.1 bodu 1,',
          'neinzeroval žádné vozidlo, nebo je inzeroval po dobu kratší než 30 kalendářních dnů,',
          'inzeroval vozidlo na méně než 3 inzertních portálech současně,',
          'porušil tyto Podmínky nebo etický kodex komunity Flipuj Káru.',
        ] },
        { p: '4.5. Garance dle tohoto článku je jednorázová a vztahuje se pouze na první členský poplatek uhrazený Členem; nevztahuje se na případná prodloužení či opakované platby členství.' },
      ],
    },
    {
      title: '5. Cena a platební podmínky',
      blocks: [
        { p: '5.1. Výše členského poplatku je uvedena na webových stránkách www.flipujkaru.cz platných ke dni objednávky, a to včetně DPH, je-li Poskytovatel plátcem.' },
        { p: '5.2. Platbu lze provést způsoby uvedenými na webových stránkách (zejména platební kartou nebo bankovním převodem prostřednictvím platební brány).' },
        { p: '5.3. Poskytovatel vystaví Členovi po přijetí platby daňový doklad, který zašle na e-mailovou adresu uvedenou v objednávce.' },
      ],
    },
    {
      title: '6. Odstoupení od smlouvy',
      blocks: [
        { p: '6.1. Je-li Člen spotřebitelem ve smyslu § 419 zákona č. 89/2012 Sb., občanský zákoník, má právo v souladu s § 1829 odst. 1 tohoto zákona odstoupit od smlouvy bez udání důvodu ve lhůtě 14 dnů ode dne uzavření smlouvy.' },
        { p: '6.2. Pokud Člen požádal o zahájení poskytování Služby (zpřístupnění členské sekce) již před uplynutím lhůty pro odstoupení, a Služba mu byla plně poskytnuta, ztrácí Člen v souladu s § 1837 písm. a) občanského zákoníku právo na odstoupení od smlouvy ohledně již poskytnutého digitálního obsahu/služby. Poskytovatel na tuto skutečnost Člena při objednávce výslovně upozorní a vyžádá si jeho výslovný souhlas.' },
        { p: '6.3. Odstoupení od smlouvy dle tohoto článku je nezávislé na garanci vrácení peněz dle čl. 4 a řídí se samostatně příslušnými ustanoveními občanského zákoníku.' },
      ],
    },
    {
      title: '7. Práva a povinnosti Člena',
      blocks: [
        { p: '7.1. Člen se zavazuje užívat Službu v souladu s těmito Podmínkami a platnými právními předpisy.' },
        { p: '7.2. Člen bere na vědomí, že veškeré informace, kalkulace, doporučení a materiály poskytované v rámci Služby mají informativní a vzdělávací charakter a nepředstavují investiční, právní ani daňové poradenství. Konečné rozhodnutí o nákupu, přípravě a prodeji vozidla je vždy na Členovi.' },
        { p: '7.3. Poskytovatel negarantuje Členovi dosažení konkrétního zisku ani úspěšnost jednotlivých obchodů; garance dle čl. 4 se týká výhradně vrácení členského poplatku za podmínek tam uvedených, nikoli náhrady případné ztráty z obchodu s vozidlem.' },
      ],
    },
    {
      title: '8. Reklamace',
      blocks: [
        { p: '8.1. Případné reklamace týkající se Služby uplatňuje Člen písemně na kontaktní e-mailové adrese Poskytovatele uvedené na webu.' },
        { p: '8.2. Poskytovatel reklamaci vyřídí bez zbytečného odkladu, nejpozději do 30 dnů ode dne jejího uplatnění, nedohodnou-li se strany jinak.' },
      ],
    },
    {
      title: '9. Ochrana osobních údajů',
      blocks: [
        { p: '9.1. Zpracování osobních údajů Člena se řídí samostatnými Zásadami zpracování osobních údajů zveřejněnými na webových stránkách Poskytovatele.' },
      ],
    },
    {
      title: '10. Závěrečná ustanovení',
      blocks: [
        { p: '10.1. Tyto Podmínky a vztah mezi Poskytovatelem a Členem se řídí právním řádem České republiky, zejména zákonem č. 89/2012 Sb., občanský zákoník, a v případě Člena-spotřebitele též zákonem č. 634/1992 Sb., o ochraně spotřebitele.' },
        { p: '10.2. Poskytovatel je oprávněn tyto Podmínky v přiměřeném rozsahu jednostranně měnit, zejména v souvislosti se změnou právních předpisů nebo obsahu Služby. Aktuální znění Podmínek je vždy dostupné na www.flipujkaru.cz. Změna Podmínek se nedotýká práv a povinností vzniklých po dobu účinnosti předchozího znění.' },
        { p: '10.3. Je-li Člen spotřebitelem, má právo na mimosoudní řešení spotřebitelského sporu vzniklého ze smlouvy uzavřené s Poskytovatelem u České obchodní inspekce (www.coi.cz).' },
        { p: '10.4. Tyto Podmínky nabývají účinnosti dnem jejich zveřejnění na webových stránkách www.flipujkaru.cz.' },
      ],
    },
  ],
};

export const ZASADY_COOKIES = {
  slug: 'cookies',
  title: 'Zásady používání cookies',
  updated: 'webové stránky www.flipujkaru.cz',
  footer: 'Nutriverse s.r.o. · IČO: 139 65 433 · sídlo: Praha, Česká republika · plátce DPH',
  sections: [
    {
      title: '1. Co jsou cookies',
      blocks: [
        { p: '1.1. Cookies jsou malé textové soubory, které jsou při návštěvě webové stránky www.flipujkaru.cz (dále jen „Web") ukládány do zařízení uživatele (počítače, tabletu, mobilního telefonu) a slouží k zajištění funkčnosti Webu, analýze návštěvnosti a přizpůsobení obsahu a reklamy.' },
        { p: '1.2. Správcem Webu a provozovatelem zpracování cookies je společnost Nutriverse s.r.o., IČO: 139 65 433, se sídlem v Praze, Česká republika (dále jen „Správce").' },
      ],
    },
    {
      title: '2. Jaké kategorie cookies používáme',
      blocks: [
        { p: '2.1. Na Webu používáme následující kategorie cookies:' },
        { table: {
          headers: ['Kategorie', 'Účel', 'Příklad / poskytovatel', 'Doba uchování'],
          rows: [
            ['Nezbytné (technické)', 'Zajištění základní funkčnosti webu, přihlášení do členské sekce, bezpečnost, nákupní košík', 'vlastní cookies webu / platební brána', 'relace / max. 1 rok'],
            ['Analytické', 'Měření návštěvnosti a chování uživatelů na webu za účelem zlepšování obsahu a Služby', 'např. Google Analytics', 'max. 26 měsíců'],
            ['Marketingové / retargetingové', 'Zobrazování relevantní reklamy na sociálních sítích a v reklamních sítích', 'např. Meta/Facebook Pixel', 'max. 12 měsíců'],
          ],
        } },
      ],
    },
    {
      title: '3. Právní základ používání cookies',
      blocks: [
        { p: '3.1. Nezbytné cookies používáme na základě oprávněného zájmu Správce (resp. z důvodu, že jsou technicky nutné pro fungování Webu), a jejich použití proto nevyžaduje souhlas uživatele.' },
        { p: '3.2. Analytické a marketingové cookies používáme pouze na základě předchozího souhlasu uživatele, který uživatel udělí prostřednictvím cookie lišty (cookie consent banneru) zobrazené při první návštěvě Webu.' },
        { p: '3.3. Souhlas s používáním nepovinných cookies je dobrovolný a lze jej kdykoli odvolat, a to prostřednictvím nastavení cookies dostupného v patičce Webu, nebo změnou nastavení v internetovém prohlížeči.' },
      ],
    },
    {
      title: '4. Správa a odmítnutí cookies',
      blocks: [
        { p: '4.1. Uživatel může nastavení cookies kdykoli změnit prostřednictvím cookie lišty na Webu, kde může jednotlivé kategorie cookies (kromě nezbytných) povolit nebo zakázat.' },
        { p: '4.2. Používání cookies lze rovněž omezit nebo zcela zakázat v nastavení internetového prohlížeče. Upozorňujeme, že zakázání nezbytných cookies může omezit funkčnost Webu, zejména přihlášení do členské sekce.' },
        { p: '4.3. Postup pro správu cookies v nejběžnějších prohlížečích:' },
        { ul: [
          'Google Chrome: Nastavení → Soukromí a zabezpečení → Soubory cookie a další data webu,',
          'Mozilla Firefox: Nastavení → Soukromí a zabezpečení → Cookies a data stránek,',
          'Safari: Předvolby → Soukromí,',
          'Microsoft Edge: Nastavení → Soukromí, vyhledávání a služby.',
        ] },
      ],
    },
    {
      title: '5. Cookies třetích stran',
      blocks: [
        { p: '5.1. V rámci analytických a marketingových cookies mohou být na Web zařazeny nástroje třetích stran (např. poskytovatelé webové analytiky a reklamních sítí), které mohou zpracovávat osobní údaje uživatele v souladu s vlastními zásadami ochrany soukromí. Aktuální přehled konkrétních nástrojů je uveden v cookie liště na Webu.' },
      ],
    },
    {
      title: '6. Vztah k ochraně osobních údajů',
      blocks: [
        { p: '6.1. Zpracování osobních údajů v souvislosti s cookies dále řídí Zásady zpracování osobních údajů dostupnými na Webu, které obsahují zejména informace o právech uživatele jakožto subjektu údajů (právo na přístup, výmaz, odvolání souhlasu apod.).' },
      ],
    },
    {
      title: '7. Závěrečná ustanovení',
      blocks: [
        { p: '7.1. Tyto Zásady používání cookies mohou být Správcem průběžně aktualizovány, zejména v souvislosti se změnou používaných technologií nebo právních předpisů. Aktuální znění je vždy dostupné na www.flipujkaru.cz.' },
        { p: '7.2. Tyto Zásady nabývají účinnosti dnem jejich zveřejnění na webových stránkách www.flipujkaru.cz.' },
      ],
    },
  ],
};

export const ZASADY_GDPR = {
  slug: 'gdpr',
  title: 'Zásady zpracování osobních údajů',
  updated: 'komunita Flipuj Káru — Odemkni zisk na čtyřech kolech',
  footer: 'Nutriverse s.r.o. · IČO: 139 65 433 · sídlo: Praha, Česká republika · plátce DPH',
  sections: [
    {
      title: '1. Správce osobních údajů',
      blocks: [
        { p: '1.1. Správcem osobních údajů je společnost Nutriverse s.r.o., IČO: 139 65 433, se sídlem v Praze, Česká republika (dále jen „Správce").' },
        { p: '1.2. Ve věcech ochrany osobních údajů je možné Správce kontaktovat na e-mailové adrese predplatne@flipujkaru.cz.' },
        { p: '1.3. Tyto Zásady se vztahují na zpracování osobních údajů návštěvníků webu www.flipujkaru.cz a členů komunity Flipuj Káru (dále jen „Subjekt údajů").' },
      ],
    },
    {
      title: '2. Jaké osobní údaje zpracováváme',
      blocks: [
        { p: '2.1. V souvislosti s provozem webu a poskytováním členství zpracováváme zejména tyto kategorie osobních údajů:' },
        { ul: [
          'identifikační a kontaktní údaje — jméno, příjmení, e-mailová adresa, telefonní číslo,',
          'fakturační údaje — adresa, případně IČO/DIČ u podnikajících osob,',
          'platební údaje — informace o provedené platbě zpracovávané platební bránou (Správce čísla platebních karet sám neukládá),',
          'údaje o užívání služby — historie objednávek, aktivita v členské sekci, komunikace se Správcem (e-maily, zprávy v rámci komunity),',
          'technické a síťové údaje — IP adresa, soubory cookies a obdobné identifikátory (viz samostatné Zásady používání cookies).',
        ] },
      ],
    },
    {
      title: '3. Účely a právní základ zpracování',
      blocks: [
        { p: '3.1. Plnění smlouvy (čl. 6 odst. 1 písm. b) GDPR) — zpracování za účelem uzavření a plnění smlouvy o členství, zejména zpřístupnění Služby, komunikace ohledně objednávky, garance vrácení peněz a fakturace.' },
        { p: '3.2. Plnění právní povinnosti (čl. 6 odst. 1 písm. c) GDPR) — zejména vedení účetnictví a plnění daňových povinností.' },
        { p: '3.3. Oprávněný zájem Správce (čl. 6 odst. 1 písm. f) GDPR) — zejména ochrana před podvodným jednáním, vymáhání případných nároků, základní analytika návštěvnosti webu a zlepšování Služby.' },
        { p: '3.4. Souhlas Subjektu údajů (čl. 6 odst. 1 písm. a) GDPR) — zejména zasílání obchodních sdělení (newsletter) a použití nepovinných cookies (marketingové a analytické), viz Zásady používání cookies. Souhlas lze kdykoli odvolat.' },
      ],
    },
    {
      title: '4. Příjemci osobních údajů',
      blocks: [
        { p: '4.1. Osobní údaje mohou být za účelem řádného poskytování Služby předány následujícím kategoriím zpracovatelů, se kterými má Správce uzavřenu smlouvu o zpracování osobních údajů:' },
        { ul: [
          'poskytovatel platební brány (zpracování plateb),',
          'poskytovatel nástroje pro správu členství a komunikace (např. Notion, Make.com a obdobné nástroje),',
          'poskytovatel e-mailového/chatbotového nástroje pro komunikaci a podporu (např. PandaBot a obdobné nástroje),',
          'poskytovatel hostingu a webové analytiky,',
          'účetní a daňový poradce Správce,',
          'obchodní partneři, se kterými je Subjekt údajů propojen v rámci podpory při prvním flipu dle obchodních podmínek, a to výhradně v rozsahu a na základě výslovného zájmu Subjektu údajů o propojení.',
        ] },
        { p: '4.2. Správce nepředává osobní údaje do třetích zemí mimo EU/EHP, s výjimkou případů, kdy tak činí zpracovatel se sídlem mimo EU/EHP za podmínek zajišťujících odpovídající úroveň ochrany (např. standardní smluvní doložky).' },
      ],
    },
    {
      title: '5. Doba uchování osobních údajů',
      blocks: [
        { p: '5.1. Osobní údaje jsou uchovávány po dobu trvání členství a dále po dobu nezbytnou k vypořádání vzájemných nároků (zejména garance dle obchodních podmínek), nejdéle však po dobu 4 let od ukončení členství, nestanoví-li právní předpis jinak.' },
        { p: '5.2. Údaje na účetních a daňových dokladech jsou uchovávány po dobu stanovenou příslušnými právními předpisy (zpravidla 10 let).' },
        { p: '5.3. Údaje zpracovávané na základě souhlasu (např. newsletter) jsou uchovávány do jeho odvolání.' },
      ],
    },
    {
      title: '6. Práva subjektu údajů',
      blocks: [
        { p: '6.1. Subjekt údajů má v souvislosti se zpracováním osobních údajů zejména právo:' },
        { ul: [
          'na přístup ke svým osobním údajům (čl. 15 GDPR),',
          'na opravu nepřesných údajů (čl. 16 GDPR),',
          'na výmaz („právo být zapomenut"), pokud to umožňují podmínky čl. 17 GDPR,',
          'na omezení zpracování (čl. 18 GDPR),',
          'na přenositelnost údajů (čl. 20 GDPR),',
          'vznést námitku proti zpracování založenému na oprávněném zájmu Správce (čl. 21 GDPR),',
          'kdykoli odvolat udělený souhlas se zpracováním, aniž je tím dotčena zákonnost zpracování před jeho odvoláním,',
          'podat stížnost u Úřadu pro ochranu osobních údajů (www.uoou.cz), má-li za to, že zpracováním jsou porušeny právní předpisy.',
        ] },
        { p: '6.2. Svá práva může Subjekt údajů uplatnit na kontaktní e-mailové adrese uvedené v čl. 1.2. Správce na žádost reaguje bez zbytečného odkladu, nejpozději do 30 dnů.' },
      ],
    },
    {
      title: '7. Zabezpečení osobních údajů',
      blocks: [
        { p: '7.1. Správce přijímá přiměřená technická a organizační opatření k zabezpečení osobních údajů proti neoprávněnému přístupu, ztrátě, zničení nebo zneužití, a to i ze strany využívaných zpracovatelů.' },
      ],
    },
    {
      title: '8. Cookies',
      blocks: [
        { p: '8.1. Podrobnosti o používání souborů cookies na webových stránkách www.flipujkaru.cz upravují samostatné Zásady používání cookies.' },
      ],
    },
    {
      title: '9. Závěrečná ustanovení',
      blocks: [
        { p: '9.1. Tyto Zásady mohou být Správcem průběžně aktualizovány, zejména v souvislosti se změnou právních předpisů nebo způsobu zpracování osobních údajů. Aktuální znění je vždy dostupné na www.flipujkaru.cz.' },
        { p: '9.2. Tyto Zásady nabývají účinnosti dnem jejich zveřejnění na webových stránkách www.flipujkaru.cz.' },
      ],
    },
  ],
};

export const LEGAL_PAGES = {
  'obchodni-podminky': OBCHODNI_PODMINKY,
  cookies: ZASADY_COOKIES,
  gdpr: ZASADY_GDPR,
};
