import type { InfoSection } from '../types'

// Vorwort, Stufenbeschreibungen, Grundsätze und Legende (PDF S. 1–4).

export const infoSections: InfoSection[] = [
  {
    id: 'vorwort',
    title: 'Prüfungsordnung Shotokan',
    body: [
      'Die Prüfungsordnung gliedert die Trainingsinhalte in der Entwicklung eines Karatekas vom Anfänger bis zum Meister und die Prüfungskriterien zu den verschiedenen Schüler- und Meisterprüfungen. Durch langfristiges und beständiges Training soll der Übende, gleichzeitig mit der körperlichen Ausbildung, den verantwortungsbewussten Umgang mit Partnern im Karate erlernen.',
      'Die unterschiedlichen Übungsformen von Grundschule, Partnertraining und Kata bieten eine solide Ausgangsbasis, stellen aber nur einen Teil des tatsächlich zu beherrschenden Technikumfangs dar. Alle bis zu der jeweiligen Graduierung erlernten Katas gehören mit zum Prüfungsstoff.',
      'Die Selbstverteidigung ist natürlicher Bestandteil des Karate und wird durch das zu zeigende Bunkai sowie die realistischen Anwendungen aus dem Kihon in der Prüfung gefordert.',
    ],
  },
  {
    id: 'stufen',
    title: 'Die vier Gruppen',
    body: ['Die Prüfungsordnung ist in vier Gruppen mit besonderen Ausbildungsschwerpunkten aufgeteilt:'],
    legend: [
      [
        'Unterstufe (9.–7. Kyu)',
        'Erlernen der Grundform der einzelnen Techniken. Achten auf sichere Stände, korrekte Techniken, Ausholbewegungen und aufrechte Haltung. Im Kumite: kontrollierte Ausführung und richtige Distanz.',
      ],
      [
        'Mittelstufe (6.–4. Kyu)',
        'Entwicklung von der Grundform zur Feinform, häufig in Kombinationen. Schwerpunkte: Bewegungsrhythmus, Hüfteinsatz, Standfestigkeit, Atemtechnik und Kime.',
      ],
      [
        'Oberstufe (3.–1. Kyu)',
        'Vielzahl schwieriger Kombinationen mit Qualität, Rhythmus, Standfestigkeit und Ausdauer. Im Kumite: Jiyu-Ippon-Kumite und freier Kampf (Jiyu-Kumite).',
      ],
      [
        'Dan-Grade (1.–8. Dan)',
        'Dan sein heißt, Vorbild sein. In allen Prüfungsteilen vorbildliche Haltung und Ausführung. Im Kihon ab 1. Dan bewusster Verzicht auf Technikvielfalt zugunsten der Einzeltechnik.',
      ],
    ],
  },
  {
    id: 'grundsaetze',
    title: 'Grundsätze für die Prüfungen',
    bullets: [
      'Körperliche und altersbedingte Fähigkeiten in allen Altersstufen (Kinder, Jugendliche, Erwachsene, Senioren) sind zu berücksichtigen.',
      'Die Prüflinge sind für ihren körperlichen und gesundheitlichen Zustand selbst verantwortlich.',
      'Prüflinge mit nicht ausgeheilten Verletzungen, grippalen Infekten etc. am Tage der Prüfung können nicht teilnehmen.',
      'Eine grundsätzliche Berücksichtigung in der Ausführung der Techniken für Menschen mit Behinderung wird erwartet.',
      'Alle Keri-Techniken werden grundsätzlich – wenn nichts anderes vorgeschrieben ist – Jodan ausgeführt.',
      'Armtechniken werden grundsätzlich – wenn nichts anderes vorgeschrieben ist – Chudan ausgeführt.',
      'Techniken und Kombinationen werden – wenn nichts anderes vorgeschrieben ist – 5× gezeigt.',
      'In den Kumite-Teilen ist das „Zanshin“ ein wichtiges Kriterium.',
      'Die Ausführung der Techniken richtet sich nach dem Buch „Karate-Do“ und „Karate Perfekt“ von M. Nakayama.',
      'Das Hinzuziehen eines Kampfrichters beim Jiyu-Kumite darf nur ordnenden Charakter haben; eine Punktevergabe soll nicht erfolgen.',
      'Die Prüfungen müssen Kihon, Kata, Kumite und Bunkai entsprechend der jeweiligen Prüfung beinhalten.',
      'Zuwiderhandlungen können zur Ungültigkeitserklärung der Prüfung und zum Entzug der Prüferlizenz führen.',
    ],
  },
  {
    id: 'legende',
    title: 'Legende zu Grundschule und Kumite',
    body: [
      'Der Pfeil am Anfang jeder Kihon-Zeile gibt die Schrittrichtung der Technik an: → vorwärts (grün), ← rückwärts (rot), ↔ seitwärts (blau).',
    ],
    legend: [
      ['→', 'Technik mit einem Schritt vorwärts ausführen'],
      ['←', 'Technik mit einem Schritt rückwärts ausführen'],
      ['↔', 'Technik mit einem Schritt seitwärts ausführen'],
      ['v', 'Nächste Technik mit Schritt vorwärts ausführen'],
      ['r', 'Nächste Technik mit Schritt rückwärts ausführen'],
      ['/', 'Nächste Technik ohne Schritt ausführen'],
      ['ZK', 'Zenkutsu-Dachi'],
      ['KK', 'Kokutsu-Dachi'],
      ['KB', 'Kiba-Dachi'],
      ['NA', 'Neko-Ashi-Dachi'],
      ['SD', 'Sochin-Dachi'],
      ['FD', 'Fudo-Dachi'],
      ['YA / SA', 'Yori-Ashi und Suri-Ashi (Gleitbewegungen)'],
      ['re/li', 'rechts/links'],
      ['LV / RV', 'linke / rechte Vorderseite (Seitenwahl)'],
    ],
  },
  {
    id: 'quelle',
    title: 'Quelle & Hinweis',
    body: [
      'Inhalt: Prüfungsordnung Shotokan im Deutschen Karate Verband e.V. (Stilrichtung „Shotokan“), Stand 01.01.2023, redaktionelle Änderungen 20.03.2024 und 09.12.2025.',
      'Diese App ist eine inoffizielle, mobil-optimierte Aufbereitung. Maßgeblich ist stets das offizielle PDF des DKV. Vervielfältigungen, auch nur auszugsweise, sind nur mit vorheriger Genehmigung des Deutschen Karate Verbandes e.V. gestattet.',
    ],
  },
]
