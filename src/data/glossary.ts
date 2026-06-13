import type { GlossaryEntry } from '../types'

// Glossar der gebräuchlichen japanischen Begriffe (PDF S. 23–25).

export const glossary: GlossaryEntry[] = [
  // Kommandos
  { category: 'Kommandos', term: 'Yoi!', meaning: 'Achtung!' },
  { category: 'Kommandos', term: 'Hajime!', meaning: 'Anfangen, los!' },
  { category: 'Kommandos', term: 'Yame!', meaning: 'Kurz gesprochen: Stop!' },
  { category: 'Kommandos', term: 'Mawate!', meaning: 'Kehrt, Wendung!' },
  { category: 'Kommandos', term: 'Sensei-ni!', meaning: 'Front zum Lehrer (Sensei).' },
  { category: 'Kommandos', term: 'Rei!', meaning: 'Gruß!' },
  {
    category: 'Kommandos',
    term: 'Gedan-Kamae',
    meaning:
      'Links vorrücken mit Gedan-Barai zur Ausgangsstellung in Zenkutsu (Grundschule). Ellbogen seitlich ca. 30 cm neben dem Körper, nach außen gedreht und leicht gebeugt.',
  },
  {
    category: 'Kommandos',
    term: 'Chudan-Kamae',
    meaning:
      'Entspricht der Kampfstellung. Der vordere Arm deckt den Außenbereich des Körpers, bereit Kizami-Zuki zu stoßen; der hintere Arm deckt den Bauch, bereit Gyaku-Zuki zu stoßen.',
  },
  {
    category: 'Kommandos',
    term: 'Kumite-Kamae',
    meaning:
      'Rechtes Bein zurücksetzen, in Zenkutsu-Dachi ausholen mit Gedan-Barai (Ausgangsstellung für Partner-Training).',
  },

  // Angriffsstufen
  { category: 'Angriffsstufen', term: 'Gedan', meaning: 'Untere Stufe (bis zum Gürtel).' },
  { category: 'Angriffsstufen', term: 'Chudan', meaning: 'Mittlere Stufe (Gürtel bis Hals).' },
  { category: 'Angriffsstufen', term: 'Jodan', meaning: 'Obere Stufe (Kopf).' },

  // Stellungen
  { category: 'Stellungen', term: 'Shizentai', meaning: 'Normalstellung.' },
  { category: 'Stellungen', term: 'Zenkutsu-Dachi (ZK)', meaning: 'Schrittstellung, Vorwärtsstellung.' },
  { category: 'Stellungen', term: 'Kokutsu-Dachi (KK)', meaning: 'Verteidigungsstellung, Rückwärtsstellung.' },
  { category: 'Stellungen', term: 'Kiba-Dachi (KB)', meaning: 'Spreizstellung, Grätschstellung.' },
  {
    category: 'Stellungen',
    term: 'Hanmi',
    meaning: 'Schrägstellung in Zenkutsu-Dachi: der Oberkörper ist um 45 Grad abgedreht.',
  },
  { category: 'Stellungen', term: 'Kamae', meaning: 'Kampfstellung.' },
  { category: 'Stellungen', term: 'Neko-Ashi-Dachi (NA)', meaning: 'Katzenfußstellung.' },
  { category: 'Stellungen', term: 'Sochin-Dachi (SD)', meaning: 'Vorderer Fuß zeigt gerade nach vorne.' },
  {
    category: 'Stellungen',
    term: 'Fudo-Dachi (FD)',
    meaning: 'Vorderer Fuß ist leicht nach innen gedreht, ca. 30 bis 40 Grad.',
  },

  // Techniken
  { category: 'Techniken', term: 'Age-Uke', meaning: 'Abwehr obere Stufe.' },
  { category: 'Techniken', term: 'Choku-Zuki', meaning: 'Gerader Stoß aus Hachiji-Dachi.' },
  { category: 'Techniken', term: 'Enpi-Uchi', meaning: 'Ellbogenstoß.' },
  { category: 'Techniken', term: 'Gedan-Barai', meaning: 'Abwehr untere Stufe.' },
  {
    category: 'Techniken',
    term: 'Gyaku-Zuki',
    meaning: 'Umgekehrter Fauststoß, z. B. bei vorgesetztem linken Fuß Fauststoß rechts.',
  },
  { category: 'Techniken', term: 'Keage', meaning: 'Bei Fußtechnik: Schnappstoß, zurück federnder Stoß.' },
  {
    category: 'Techniken',
    term: 'Kekomi',
    meaning: 'Bei Fußtechniken: gerader, gestreckter Stoß mit starkem Hüfteinsatz.',
  },
  { category: 'Techniken', term: 'Keri', meaning: 'Fußstoß.' },
  { category: 'Techniken', term: 'Kizami-Zuki', meaning: 'Prellstoß mit abgedrehter Hüfte.' },
  { category: 'Techniken', term: 'Mae-Ashi-Geri', meaning: 'Fußstoß mit dem vorderen Bein.' },
  { category: 'Techniken', term: 'Mae-Geri', meaning: 'Fußstoß nach vorn.' },
  { category: 'Techniken', term: 'Mawashi-Geri', meaning: 'Kreisfußstoß.' },
  { category: 'Techniken', term: 'Mae-Mawashi-Geri', meaning: 'Kreisfußstoß mit dem vorderen Fuß.' },
  { category: 'Techniken', term: 'Nukite', meaning: 'Stoß mit den Fingerspitzen.' },
  { category: 'Techniken', term: 'Oi-Zuki', meaning: 'Angriffsstoß, z. B. rechtes Bein, rechte Faust.' },
  { category: 'Techniken', term: 'Rengeri', meaning: 'Doppelfußstoß mit Zwischenschritt.' },
  { category: 'Techniken', term: 'Renzuki', meaning: 'Mehrfachfauststoß (mindestens zweifacher Fauststoß).' },
  {
    category: 'Techniken',
    term: 'Sanbon-Zuki',
    meaning: 'Dreimaliger Fauststoß: einmal obere Stufe, zweimal mittlere Stufe.',
  },
  { category: 'Techniken', term: 'Shuto-Uchi', meaning: 'Handkantenschlag.' },
  { category: 'Techniken', term: 'Shuto-Uke', meaning: 'Handkantenabwehr in Kokutsu-Dachi.' },
  { category: 'Techniken', term: 'Soto-Uke', meaning: 'Abwehr mittlere Stufe von außen (Soto) nach innen.' },
  { category: 'Techniken', term: 'Tsuki', meaning: 'Fauststoß.' },
  { category: 'Techniken', term: 'Uchi-Uke', meaning: 'Abwehr mittlere Stufe von innen (Uchi) nach außen.' },
  { category: 'Techniken', term: 'Morote-Uke', meaning: 'Verstärkte Unterarmabwehr.' },
  { category: 'Techniken', term: 'Tate-Uraken-Uchi', meaning: 'Faustrückenschlag von oben.' },
  { category: 'Techniken', term: 'Yoko-Uraken-Uchi', meaning: 'Faustrückenschlag zur Seite.' },
  { category: 'Techniken', term: 'Ushiro-Geri', meaning: 'Fußstoß nach hinten.' },
  { category: 'Techniken', term: 'Yoko-Geri', meaning: 'Fußstoß zur Seite.' },

  // Trainings- und Kampfformen
  { category: 'Trainings- & Kampfformen', term: 'Kihon', meaning: 'Grundschule.' },
  { category: 'Trainings- & Kampfformen', term: 'Kumite', meaning: 'Kampfschule.' },
  {
    category: 'Trainings- & Kampfformen',
    term: 'Ippon-Kumite',
    meaning:
      'Einmaliger Angriff, Abwehr und Gegenangriff. Ziel: Entwicklung des Gefühls für die richtige Distanz (Maai).',
  },
  {
    category: 'Trainings- & Kampfformen',
    term: 'Gohon-Kumite',
    meaning:
      'Fünfmaliger Angriff, fünfmalige Abwehr. Nach der fünften Abwehr Gegenangriff. Ziel: Entwicklung maximaler Standfestigkeit und Balance.',
  },
  {
    category: 'Trainings- & Kampfformen',
    term: 'Jiyu-Ippon-Kumite',
    meaning: '(Einmaliger) realer Angriff und kampfgemäße Abwehr. Ziel: Entwicklung des Gefühls für Abstand und Zeitwahl.',
  },
  { category: 'Trainings- & Kampfformen', term: 'Jiyu-Kumite', meaning: 'Freier Kampf.' },
  { category: 'Trainings- & Kampfformen', term: 'Okuri-Ippon-Kumite', meaning: 'Wiederholtes Angreifen eines Gegners.' },
  { category: 'Trainings- & Kampfformen', term: 'Kaeshi-Ippon-Kumite', meaning: 'Erwidernder Einschritt-Kampf.' },
  { category: 'Trainings- & Kampfformen', term: 'Hapo-Kumite', meaning: 'Kampfübungen gegen mehrere Gegner (i. d. R. im Kreis).' },
  { category: 'Trainings- & Kampfformen', term: 'Shiai', meaning: 'Turnier.' },
  {
    category: 'Trainings- & Kampfformen',
    term: 'Kata',
    meaning:
      'Vorführungsform in der Art eines Schattenkampfes, die alle Grundtechniken in festgelegten Kombinationen enthält (Kampf gegen imaginäre Gegner).',
  },

  // Weitere Begriffe
  { category: 'Weitere Begriffe', term: 'Dojo', meaning: 'Übungsraum, Club.' },
  { category: 'Weitere Begriffe', term: 'Hara, Tanden', meaning: 'Bauch, Schwerpunkt/Zentrum.' },
  { category: 'Weitere Begriffe', term: 'Karateka', meaning: 'Karatemann/-frau.' },
  { category: 'Weitere Begriffe', term: 'Karategi', meaning: 'Karate-Bekleidung.' },
  {
    category: 'Weitere Begriffe',
    term: 'Kiai',
    meaning:
      'Höchster Krafteinsatz in Verbindung mit hörbarem Ausatmen, ähnlich einem Kampfruf. Kurz, explosiv und laut. Bei jeder letzten Technik sowie u. a. im Gohon-, Kihon-Ippon- und Jiyu-Ippon-Kumite zu machen.',
  },
  { category: 'Weitere Begriffe', term: 'Hikite', meaning: 'Das Zurückziehen der Faust an die Hüfte.' },
  { category: 'Weitere Begriffe', term: 'Kime', meaning: 'Äußerster Einsatz mit voller Spannung und höchstem Kampfgeist.' },
  { category: 'Weitere Begriffe', term: 'Ki', meaning: 'Vitale/innere Energie.' },
  { category: 'Weitere Begriffe', term: 'Suri-Ashi', meaning: 'Gleitschritt, der hintere Fuß bewegt sich zuerst.' },
  { category: 'Weitere Begriffe', term: 'Yori-Ashi', meaning: 'Gleitschritt, die beiden Füße bewegen sich gleichzeitig.' },
  { category: 'Weitere Begriffe', term: 'Kai-Ashi', meaning: 'Ganzer Schritt.' },
  { category: 'Weitere Begriffe', term: 'Kohai', meaning: 'Fortgeschrittener jüngerer Schüler.' },
  { category: 'Weitere Begriffe', term: 'Sempai', meaning: 'Fortgeschrittener älterer Schüler.' },
  { category: 'Weitere Begriffe', term: 'Sensei', meaning: 'Lehrer, Meister.' },
  { category: 'Weitere Begriffe', term: 'Shihan, Hanshi', meaning: 'Großmeister.' },
]

export const glossaryCategories = [
  'Kommandos',
  'Angriffsstufen',
  'Stellungen',
  'Techniken',
  'Trainings- & Kampfformen',
  'Weitere Begriffe',
]
