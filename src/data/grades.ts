import type { Grade } from '../types'

// Transcribed from the official DKV Prüfungsordnung Shotokan
// (9. Kyu bis 8. Dan, Stand 01.01.2023, red. Änderungen 20.03.2024 / 09.12.2025).
// Source PDF stored under pdfs/.

const BELT = {
  white: '#f5f5f5',
  yellow: '#facc15',
  orange: '#f97316',
  green: '#16a34a',
  blue: '#2563eb',
  brown: '#92400e',
  black: '#1f2937',
}

export const grades: Grade[] = [
  {
    id: '9-kyu',
    type: 'kyu',
    rank: 9,
    title: '9. Kyu',
    belt: 'Weißer Gürtel',
    beltColor: BELT.white,
    beltOutline: true,
    group: 'Unterstufe',
    kihon: [
      { no: 1, stance: 'Shizentai', text: '6 × Choku-Zuki' },
      { no: 2, stance: 'Shizentai', text: '6 × Age-Uke' },
      {
        no: 3,
        stance: 'Shizentai',
        text: '6 × Soto-Ude-Uke (erneute Ausholbewegung nach dem Block)',
      },
      { no: 4, stance: 'Shizentai', text: '6 × Gedan-Barai' },
      {
        no: 5,
        stance: 'Shizentai',
        text: '6 × Mae-Geri im Stand (Shizentai, rechts/links, Arme seitlich)',
      },
    ],
    kumite: {
      rows: [
        { aspect: 'Ausgangsstellung', tori: 'Shizentai', uke: 'Shizentai' },
        {
          aspect: 'Bewegung',
          tori: 'ohne (Technik im Stand)',
          uke: 'ohne (Technik im Stand)',
        },
        {
          aspect: 'Ablauf',
          tori: '6 × Choku-Zuki Jodan, letzter Angriff mit Kiai',
          uke: 'Age-Uke, nach dem letzten Block Konter Choku-Zuki mit Kiai',
        },
        {
          aspect: 'Ablauf',
          tori: '6 × Choku-Zuki Chudan, letzter Angriff mit Kiai',
          uke: 'Soto-Ude-Uke, nach dem letzten Block Konter Choku-Zuki mit Kiai',
        },
      ],
    },
  },
  {
    id: '8-kyu',
    type: 'kyu',
    rank: 8,
    title: '8. Kyu',
    belt: 'Gelber Gürtel',
    beltColor: BELT.yellow,
    group: 'Unterstufe',
    kihon: [
      { no: 1, dir: 'vor', stance: 'ZK', text: '5 × Oi-Zuki (Wendung mit Gedan-Barai und Gyaku-Zuki)' },
      { no: 2, dir: 'vor', stance: 'ZK', text: '5 × Gyaku-Zuki' },
      { no: 3, dir: 'zurück', stance: 'ZK', text: '5 × Age-Uke (Wendung)' },
      { no: 4, dir: 'zurück', stance: 'ZK', text: '5 × Soto-Ude-Uke (Wendung)' },
      { no: 5, dir: 'zurück', stance: 'ZK', text: '5 × Gedan-Barai (Wendung)' },
      { no: 6, dir: 'zurück', stance: 'KK', text: '5 × Shuto-Uke' },
      { no: 7, dir: 'vor', stance: 'ZK', text: '5 × Mae-Geri-Keage Chudan (Arme Chudan-Kamae) (Wendung)' },
    ],
    kata: { list: ['Heian Shodan'] },
    kumite: {
      form: 'Gohon-Kumite',
      rows: [
        { aspect: 'Ausgangsstellung', tori: 'Gedan-Barai ZK', uke: 'Shizentai' },
        { aspect: 'Bewegung', tori: 'Schritt vor', uke: 'Schritt zurück' },
        {
          aspect: 'Ablauf',
          tori: 'Ausgangsstellung LV: 5 × Oi-Zuki Jodan',
          uke: 'Ausgangsstellung Shizentai: R. zurück, Age-Uke',
        },
        {
          aspect: 'Ablauf',
          tori: 'Ausgangsstellung RV: 5 × Oi-Zuki Chudan',
          uke: 'L. zurück, Soto-Uke',
        },
      ],
      note: 'Nach der 5. Abwehrtechnik wird Gyaku-Zuki mit Kiai als Konter ausgeführt.',
    },
  },
  {
    id: '7-kyu',
    type: 'kyu',
    rank: 7,
    title: '7. Kyu',
    belt: 'Orangener Gürtel',
    beltColor: BELT.orange,
    group: 'Unterstufe',
    kihon: [
      { no: 1, dir: 'vor', stance: 'ZK', text: '5 × Oi-Zuki Jodan / Gyaku-Zuki Chudan' },
      { no: 2, dir: 'zurück', stance: 'ZK', text: '5 × Gedan-Barai / Gyaku-Zuki (Wendung)' },
      { no: 3, dir: 'zurück', stance: 'ZK', text: '5 × Soto-Ude-Uke / Gyaku-Zuki (Wendung)' },
      { no: 4, dir: 'zurück', stance: 'KK', text: '5 × Shuto-Uke' },
      { no: 5, dir: 'vor', stance: 'ZK', text: '5 × Mae-Geri-Keage Chudan (Arme Chudan-Kamae) (Wendung)' },
      {
        no: 6, dir: 'vor',
        stance: 'KB',
        text: '3 × Mawashi-Geri (aus Kamae, 3× rechts u. links, Beistellschritt) (Wendung)',
      },
    ],
    kata: { list: ['Heian Nidan'] },
    kumite: {
      form: 'Sanbon-Kumite',
      rows: [
        {
          aspect: 'Ausgangsstellung',
          tori: 'Gedan-Barai ZK, freie Seitenwahl',
          uke: 'Shizentai',
        },
        { aspect: 'Bewegung', tori: 'Schritt vor', uke: 'Schritt zurück' },
        { aspect: 'Ablauf', tori: '3 × Oi-Zuki Jodan', uke: 'R. zurück, Age-Uke' },
        { aspect: 'Ablauf', tori: '3 × Oi-Zuki Chudan', uke: 'L. zurück, Soto-Uke' },
        {
          aspect: 'Ablauf',
          tori: '3 × Mae-Geri Chudan',
          uke: 'R. zurück, Gedan-Nagashi-Uke oder Gedan-Barai',
        },
      ],
      note: 'Nach der 3. Abwehrtechnik wird Gyaku-Zuki mit Kiai als Konter ausgeführt.',
    },
  },
  {
    id: '6-kyu',
    type: 'kyu',
    rank: 6,
    title: '6. Kyu',
    belt: 'Grüner Gürtel',
    beltColor: BELT.green,
    group: 'Mittelstufe',
    kihon: [
      { no: 1, dir: 'vor', stance: 'ZK', text: '5 × Sanbon-Zuki' },
      { no: 2, dir: 'zurück', stance: 'KK', text: '5 × Shuto-Uke / ZK Gyaku-Tate-Nukite' },
      { no: 3, dir: 'vor', stance: 'ZK', text: '5 × Yoko-Uraken Jodan (Arm bleibt stehen) / Gyaku-Zuki' },
      { no: 4, dir: 'zurück', stance: 'ZK', text: '5 × Age-Uke / Gyaku-Zuki' },
      { no: 5, dir: 'vor', stance: 'ZK', text: '5 × Mae-Geri / Gyaku-Zuki (Zuki stehen lassen)' },
      { no: 6, dir: 'zurück', stance: 'ZK', text: '5 × Uchi-Ude-Uke / Gyaku-Zuki' },
      { no: 7, dir: 'vor', stance: 'ZK', text: '5 × Mawashi-Geri Chudan (Arme Chudan-Kamae) (Wendung)' },
      {
        no: 8, dir: 'seit',
        stance: 'KB',
        text: '3 × Yoko-Geri Kekomi Chudan rechts in KB, Beistellschritt (Wendung); 3 × Yoko-Geri Kekomi Chudan links, Beistellschritt',
      },
    ],
    kata: { list: ['Heian Sandan'] },
    bunkai:
      'Zwei Verteidigungs-Anwendungen mit Partner aus dem Kihon-Programm und zwei Bunkai-Anwendungen aus der Kata Heian Sandan.',
    kumite: {
      form: 'Kihon-Ippon-Kumite',
      rows: [
        { aspect: 'Ausgangsstellung', tori: 'Zenkutsu-Dachi', uke: 'Shizentai' },
        { aspect: 'Bewegung', tori: 'Schritt vor', uke: 'Schritt zurück, freie Seitenwahl' },
        { aspect: 'Ablauf', tori: '2 × Oi-Zuki Jodan re/li', uke: 'Age-Uke / Gyaku-Zuki' },
        { aspect: 'Ablauf', tori: '2 × Oi-Zuki Chudan re/li', uke: 'Uchi-Uke / Gyaku-Zuki' },
        { aspect: 'Ablauf', tori: '2 × Mae-Geri re/li', uke: 'Nagashi-Uke / Konter frei' },
        {
          aspect: 'Ablauf',
          tori: '2 × Mawashi-Geri re/li',
          uke: 'Te-Nagashi-Uke / Konter frei',
        },
      ],
      note: 'Bei den Abwehrtechniken ist auch seitliches Ausweichen zu zeigen.',
    },
  },
  {
    id: '5-kyu',
    type: 'kyu',
    rank: 5,
    title: '5. Kyu',
    belt: 'Blauer Gürtel',
    beltColor: BELT.blue,
    group: 'Mittelstufe',
    kihon: [
      { no: 1, dir: 'vor', stance: 'ZK', text: '5 × Kizami-Zuki (YA) v Oi-Zuki (aus Kamae) (Wendung)' },
      { no: 2, dir: 'vor', stance: 'ZK', text: '5 × Gyaku-Zuki (im Stand) v Gyaku-Zuki (mit Schritt)' },
      { no: 3, dir: 'zurück', stance: 'ZK', text: '5 × Age-Uke / Gyaku-Age-Empi (Wendung)' },
      { no: 4, dir: 'zurück', stance: 'ZK', text: '5 × Gedan-Barai / Gyaku-Mawashi-Empi (Wendung)' },
      { no: 5, dir: 'zurück', stance: 'KK', text: '5 × Morote-Uchi-Ude-Uke / ZK Gyaku-Zuki' },
      { no: 6, dir: 'vor', stance: 'KK', text: '5 × Shuto-Uke / ZK Gyaku-Shuto-Uchi Jodan (Wendung)' },
      { no: 7, dir: 'vor', stance: 'ZK', text: '5 × Mae-Ashi-Geri v Mawashi-Geri (aus Kamae)' },
      { no: 8, dir: 'zurück', stance: 'ZK', text: '5 × Ushiro-Geri im Rückwärtsgehen ohne Drehung' },
    ],
    kata: { list: ['Heian Yondan'] },
    bunkai:
      'Zwei Verteidigungs-Anwendungen mit Partner aus dem Kihon-Programm und zwei Bunkai-Anwendungen aus der Kata Heian Yondan.',
    kumite: {
      form: 'Kaeshi-Kumite',
      rows: [
        { aspect: 'Ausgangsstellung', tori: 'Kamae', uke: 'Kamae' },
        { aspect: 'Bewegung', tori: 'Schrittbewegung vorwärts', uke: 'Schrittbewegung zurück' },
        {
          aspect: 'Ablauf',
          tori: 'LV: 1 × Jodan-Zuki (vor), Age-Uke (zurück) / Gyaku-Zuki',
          uke: 'LV: 1 × Age-Uke (zurück), Jodan-Zuki (vor)',
        },
        {
          aspect: 'Ablauf',
          tori: 'LV: 1 × Chudan-Zuki (vor), Soto-Ude-Uke (zurück) / Gyaku-Zuki',
          uke: 'LV: 1 × Soto-Ude-Uke (zurück), Chudan-Zuki (vor)',
        },
        {
          aspect: 'Ablauf',
          tori: 'LV: 1 × Mae-Geri (vor), Gedan-Nagashi-Uke (zurück) / Gyaku-Zuki',
          uke: 'LV: 1 × Gedan-Nagashi-Uke (zurück), Mae-Geri (vor)',
        },
      ],
      note: 'Bei den Abwehrtechniken ist auch seitliches Ausweichen zu zeigen.',
    },
  },
  {
    id: '4-kyu',
    type: 'kyu',
    rank: 4,
    title: '4. Kyu',
    belt: 'Blauer Gürtel',
    beltColor: BELT.blue,
    group: 'Mittelstufe',
    kihon: [
      { no: 1, dir: 'vor', stance: 'ZK', text: '5 × Oi-Zuki / Gyaku-Zuki' },
      { no: 2, dir: 'zurück', stance: 'KK', text: '5 × Uchi-Ude-Uke / ZK Gyaku-Zuki (Wendung)' },
      {
        no: 3, dir: 'zurück',
        stance: 'ZK',
        text: '5 × Age-Uke / gleicher Arm Soto-Ude-Uke (mit Ausholbewegung) / Gyaku-Zuki',
      },
      { no: 4, dir: 'vor', stance: 'ZK', text: '5 × Shuto-Uchi / Gyaku-Haito-Uchi (Wendung)' },
      {
        no: 5, dir: 'vor',
        stance: 'ZK',
        text: '5 × Uraken / Yoko-Geri Kekomi (vorderes Bein, mit Beistellschritt) / Gyaku-Zuki (Wendung)',
      },
      { no: 6, dir: 'vor', stance: 'ZK', text: '5 × Ushiro-Geri (Wendung)' },
      {
        no: 7, dir: 'vor',
        stance: 'KB',
        text: '6 × Ura-Mawashi-Geri (übersetzen, oder wahlweise Ashi-Barai, aus ZK), 3× rechts u. 3× links',
      },
    ],
    kata: { list: ['Heian Godan'] },
    bunkai:
      'Zwei Verteidigungs-Anwendungen mit Partner aus dem Kihon-Programm und zwei Bunkai-Anwendungen aus der Kata Heian Godan.',
    kumite: {
      form: 'Kaeshi-Kumite',
      rows: [
        { aspect: 'Ausgangsstellung', tori: 'Kamae', uke: 'Kamae' },
        { aspect: 'Bewegung', tori: 'Schrittbewegung vorwärts', uke: 'Schrittbewegung zurück' },
        {
          aspect: 'Ablauf',
          tori: 'LV: 1 × Jodan-Zuki (vor), Age-Uke (zurück) / Konter frei',
          uke: 'LV: 1 × Age-Uke (zurück), Jodan-Zuki (vor)',
        },
        {
          aspect: 'Ablauf',
          tori: 'LV: 1 × Chudan-Zuki (vor), Soto-Ude-Uke (zurück) / Konter frei',
          uke: 'LV: 1 × Soto-Ude-Uke (zurück), Chudan-Zuki (vor)',
        },
        {
          aspect: 'Ablauf',
          tori: 'LV: 1 × Mae-Geri (vor), Gedan-Barai (zurück) / Konter frei',
          uke: 'LV: 1 × Gedan-Barai (zurück), Mae-Geri (vor)',
        },
        {
          aspect: 'Ablauf',
          tori: 'LV: 1 × Mawashi-Geri (vor), Te-Nagashi-Uke (zurück) / Konter frei',
          uke: 'LV: 1 × Te-Nagashi-Uke (zurück), Mawashi-Geri (vor)',
        },
      ],
      note: 'Es sind Tai-Sabaki (seitliche Ausweichbewegungen) zu zeigen.',
    },
  },
  {
    id: '3-kyu',
    type: 'kyu',
    rank: 3,
    title: '3. Kyu',
    belt: 'Brauner Gürtel',
    beltColor: BELT.brown,
    group: 'Oberstufe',
    kihon: [
      { no: 1, dir: 'vor', stance: 'ZK', text: '5 × Oi-Zuki r Gedan-Barai v Oi-Zuki (Wendung)' },
      {
        no: 2, dir: 'vor',
        stance: 'ZK',
        text: '5 × Gyaku-Zuki / Kizami-Zuki (im Stand) v Gyaku-Zuki (aus Kamae)',
      },
      { no: 3, dir: 'zurück', stance: 'KK', text: '5 × Age-Uke / Mae-Ashi-Geri / ZK Gyaku-Zuki (Wendung)' },
      { no: 4, dir: 'zurück', stance: 'ZK', text: '5 × Uchi-Ude-Uke / Gyaku-Zuki / Kizami-Zuki' },
      { no: 5, dir: 'vor', stance: 'ZK', text: '5 × Mae-Mawashi-Geri / Ushiro-Geri (Wendung)' },
      {
        no: 6, dir: 'seit',
        stance: 'KB',
        text: '2 × Yoko-Geri-Keage (Beistellschritt) / Kekomi (nach Wendung zweimal zurück)',
      },
      {
        no: 7, dir: 'vor',
        stance: 'ZK',
        text: '5 × Ura-Mawashi-Geri / Gyaku-Zuki oder alternativ 5 × Ashi-Barai (hinteres Bein) / Gyaku-Zuki (Wendung)',
      },
    ],
    kata: { list: ['Tekki Shodan'] },
    bunkai:
      'Zwei Verteidigungs-Anwendungen mit Partner aus dem Kihon-Programm und zwei Bunkai-Anwendungen aus der Kata Tekki Shodan.',
    kumite: {
      form: 'Jiyu-Ippon-Kumite',
      rows: [
        {
          aspect: 'Ausgangsstellung',
          tori: 'freie Seitenwahl aus Kamae',
          uke: 'freie Seitenwahl aus Kamae',
        },
        { aspect: 'Bewegung', tori: 'Yori-Ashi', uke: 'frei' },
        { aspect: 'Angriff', tori: '2 × Kizami-Zuki Jodan (re/li)', uke: 'frei' },
        { aspect: 'Angriff', tori: '2 × Gyaku-Zuki Chudan (re/li)', uke: 'frei' },
        { aspect: 'Angriff', tori: '2 × Mae-Geri Chudan (re/li)', uke: 'frei' },
        { aspect: 'Angriff', tori: '2 × Mawashi-Geri (re/li)', uke: 'frei' },
        { aspect: 'Angriff', tori: '2 × Ushiro-Geri Chudan (re/li)', uke: 'frei' },
      ],
      note: 'Abwehr und Gegenangriff sind frei. Es sind Yori-Ashi/Suri-Ashi (Gleitbewegung) und Kai-Ashi (Schritt) zu zeigen. Der Gegenangriff wird zu Kamae zurückgenommen.',
      extra: ['Jiyu-Kumite'],
    },
  },
  {
    id: '2-kyu',
    type: 'kyu',
    rank: 2,
    title: '2. Kyu',
    belt: 'Brauner Gürtel',
    beltColor: BELT.brown,
    group: 'Oberstufe',
    kihon: [
      { no: 1, dir: 'vor', stance: 'ZK', text: '5 × Uraken-Uchi / Gyaku-Zuki' },
      {
        no: 2, dir: 'zurück',
        stance: 'NA',
        text: '5 × Shuto-Uke / Mae-Ashi-Geri / ZK Gyaku-Tate-Nukite (Wendung)',
      },
      {
        no: 3, dir: 'zurück',
        stance: 'ZK',
        text: '5 × Soto-Ude-Uke / KB Yoko-Empi / Yoko-Uraken-Uchi / ZK Gyaku-Zuki (Wendung)',
      },
      { no: 4, dir: 'zurück', stance: 'SD', text: '5 × Uchi-Ude-Uke / ZK Gyaku-Zuki' },
      {
        no: 5, dir: 'vor',
        stance: 'ZK',
        text: '5 × Ashi-Barai (vorderes Bein) / Uraken-Uchi v Mawashi-Geri / Gyaku-Zuki (Wendung)',
      },
      {
        no: 6, dir: 'vor',
        stance: 'ZK',
        text: '5 × Kizami-Zuki YA / Gyaku-Zuki v Ura-Mawashi oder wahlweise Kizami-Zuki YA / Gyaku-Zuki v Ashi-Barai / Gyaku-Zuki (Wendung)',
      },
      { no: 7, dir: 'vor', stance: 'ZK', text: '5 × Kizami-Zuki YA / Ushiro-Geri / Gyaku-Zuki (Wendung)' },
    ],
    kihonNote: 'Die Kombinationen 5–7 sind aus Chudan-Kamae auszuführen.',
    kata: { list: ['Bassai Dai'] },
    bunkai:
      'Zwei Verteidigungs-Anwendungen mit Partner aus dem Kihon-Programm und zwei Bunkai-Anwendungen aus der Kata Bassai Dai.',
    kumite: {
      form: 'Jiyu-Ippon-Kumite',
      rows: [
        {
          aspect: 'Ausgangsstellung',
          tori: 'freie Seitenwahl aus Kamae',
          uke: 'freie Seitenwahl aus Kamae',
        },
        { aspect: 'Bewegung', tori: 'Yori-Ashi vor', uke: 'frei' },
        {
          aspect: 'Angriff',
          tori: '2 × Kizami-Zuki Jodan / Gyaku-Zuki Chudan (re/li)',
          uke: 'frei',
        },
        { aspect: 'Angriff', tori: '2 × Gyaku-Zuki / Gyaku-Zuki Jodan (re/li)', uke: 'frei' },
        {
          aspect: 'Angriff',
          tori: '2 × Ura-Mawashi-Geri (wahlweise Ushiro-Geri) (re/li)',
          uke: 'frei',
        },
        {
          aspect: 'Angriff',
          tori: '2 × Kizami-Zuki Jodan / Mawashi-Geri mit dem vorderen Bein (re/li)',
          uke: 'frei',
        },
      ],
      note: 'Abwehr und Gegenangriff sind frei. Es sind Yori-Ashi/Suri-Ashi (Gleitbewegung) und Kai-Ashi (Schritt) zu zeigen. Der Gegenangriff wird zu Kamae zurückgenommen.',
      extra: ['Jiyu-Kumite'],
    },
  },
  {
    id: '1-kyu',
    type: 'kyu',
    rank: 1,
    title: '1. Kyu',
    belt: 'Brauner Gürtel',
    beltColor: BELT.brown,
    group: 'Oberstufe',
    kihon: [
      { no: 1, dir: 'vor', stance: 'ZK', text: '5 × Kizami-Zuki (YA) / Gyaku-Zuki v Oi-Zuki' },
      {
        no: 2, dir: 'zurück',
        stance: 'KK',
        text: '5 × Gedan-Barai / Uraken (gleicher Arm stehen lassen) / ZK Gyaku-Zuki (Wendung)',
      },
      {
        no: 3, dir: 'zurück',
        stance: 'SD',
        text: 'Age-Uke / ZK Gyaku-Zuki, r SD Soto-Uke / ZK Gyaku-Zuki, r SD Uchi-Ude-Uke / ZK Gyaku-Zuki, r SD Tate-Shuto-Uke / ZK Gyaku-Zuki, r SD Gedan-Barai / ZK Gyaku-Zuki (Wendung) — nach dem SD Hüfte eindrehen mit ZK',
      },
      {
        no: 4, dir: 'zurück',
        stance: 'KK',
        text: '5 × Shuto-Uke / ZK Shuto-Uchi (gleicher Arm) / Mae-Geri (hinten absetzen) / ZK Gyaku-Haito-Uchi',
      },
      {
        no: 5, dir: 'vor',
        stance: 'ZK',
        text: '5 × Oi-Zuki r YA, NA Jodan Te-Nagashi-Uke / Mae-Mawashi-Geri / Gyaku-Zuki (Wendung)',
      },
      {
        no: 6, dir: 'vor',
        stance: 'ZK',
        text: '5 × Kizami-Zuki (YA) / Ushiro-Geri / Uraken / Gyaku-Zuki (Wendung)',
      },
      {
        no: 7, dir: 'vor',
        stance: 'ZK',
        text: '5 × Ura-Mawashi-Geri (alternativ Yoko-Geri Kekomi) hinteres Bein (Wendung)',
      },
    ],
    kihonNote: 'Aus Kamae.',
    kata: { note: 'Wahl aus', list: ['Jion', 'Kanku Dai', 'Empi', 'Hangetsu'] },
    bunkai:
      'Zwei Verteidigungs-Anwendungen mit Partner aus dem Kihon-Programm und drei Bunkai-Anwendungen aus der gewählten Kata.',
    kumite: {
      form: 'Jiyu-Ippon-Kumite',
      rows: [
        {
          aspect: 'Ausgangsstellung',
          tori: 'freie Seitenwahl aus Kamae',
          uke: 'freie Seitenwahl aus Kamae',
        },
        { aspect: 'Bewegung', tori: 'Schritt oder Yori-Ashi vor', uke: 'frei' },
        { aspect: 'Angriff', tori: '2 × Oi-Zuki Jodan / Schritt (re/li)', uke: 'frei' },
        { aspect: 'Angriff', tori: '2 × Kizami-Zuki, Yori-Ashi (re/li)', uke: 'frei' },
        {
          aspect: 'Angriff',
          tori: '2 × Uraken / Gyaku-Zuki Chudan, Suri- oder Yori-Ashi (re/li)',
          uke: 'frei',
        },
        {
          aspect: 'Angriff',
          tori: '2 × Mawashi-Geri mit dem vorderen oder hinteren Bein (wahlweise nach Ansage) (re/li)',
          uke: 'frei',
        },
        {
          aspect: 'Angriff',
          tori: '2 × Ushiro-Geri oder Ushiro-Ura-Mawashi-Geri (wahlweise nach Ansage) (re/li), vorderes oder hinteres Bein',
          uke: 'frei',
        },
      ],
      note: 'Abwehr und Gegenangriff sind frei. Es sind Yori-Ashi/Suri-Ashi (Gleitbewegung) und Kai-Ashi (Schritt) zu zeigen. Der Gegenangriff wird zu Kamae zurückgenommen.',
      extra: ['Jiyu-Kumite'],
    },
  },
  {
    id: '1-dan',
    type: 'dan',
    rank: 1,
    title: '1. Dan',
    belt: 'Schwarzer Gürtel',
    beltColor: BELT.black,
    group: 'Dan-Grade',
    kihon: [
      { no: 1, dir: 'vor', stance: 'ZK', text: '5 × Sanbon-Zuki' },
      { no: 2, dir: 'vor', stance: 'ZK', text: '2 × Age-Uke / Gyaku-Zuki, 2 × Soto-Uke / Gyaku-Zuki' },
      {
        no: 3, dir: 'vor',
        stance: 'ZK',
        text: '2 × Mae-Geri / Uraken-Uchi, 2 × Mawashi-Geri (Jodan oder Chudan) / Gyaku-Zuki',
      },
      {
        no: 4, dir: 'vor',
        stance: 'ZK',
        text: '2 × Uchi-Uke / Gyaku-Zuki, 2 × Gedan-Barai / Gyaku-Zuki',
      },
      { no: 5, dir: 'vor', stance: 'ZK', text: '2 × Yoko-Geri Kekomi, 2 × Ushiro-Geri' },
      {
        no: 6, dir: 'vor',
        stance: 'KK',
        text: '2 × Shuto-Uke / ZK Gyaku-Nukite, 2 × KK Shuto-Uke / ZK Gyaku-Haito-Uchi',
      },
      { no: 7, dir: 'vor', stance: 'ZK', text: '5 × Kizami-Zuki (YA) / Gyaku-Zuki (Wendung)' },
      { no: 8, dir: 'vor', stance: 'ZK', text: '5 × Mae-Geri (Chudan) / Uraken / Gyaku-Zuki (Wendung)' },
      { no: 9, dir: 'vor', stance: 'ZK', text: '5 × Gyaku-Zuki (im Stand) v Ashi-Barai / Gyaku-Zuki (Wendung)' },
      {
        no: 10, dir: 'vor',
        stance: 'ZK',
        text: '4 × Mawashi-Geri (Jodan oder Chudan), vorne absetzen mit Uraken-Uchi / Gyaku-Zuki',
      },
      {
        no: 11, dir: 'vor',
        stance: 'ZK',
        text: '5 × Ushiro-Geri vor (Chudan) absetzen mit Gyaku-Zuki (Wendung)',
      },
      {
        no: 12, dir: 'vor',
        stance: 'ZK',
        text: '5 × Mae-Mawashi-Geri v Ura-Mawashi-Geri / Gyaku-Zuki (alternativ Yoko-Geri Kekomi / Gyaku-Zuki) (Wendung)',
      },
    ],
    kata: {
      tokui: 'Tokui Kata frei aus Kanku Dai, Jion, Empi, Hangetsu (nicht eine bisher gezeigte Kata).',
      shitei: '1 Shitei Kata aus Heian 1–5, Tekki Shodan, Bassai Dai, Kanku Dai, Jion, Empi.',
    },
    bunkai:
      'Drei Verteidigungs-Anwendungen mit Partner aus dem Kihon-Programm sowie drei Bunkai-Anwendungen aus der gewählten Tokui Kata.',
    kumite: {
      form: 'Jiyu-Kumite',
      extra: ['Jiyu-Ippon-Kumite'],
      rows: [
        {
          aspect: 'Ausgangsstellung',
          tori: 'freie Seitenwahl aus Kamae',
          uke: 'freie Seitenwahl aus Kamae',
        },
        { aspect: 'Bewegung', tori: 'Schritt oder Yori-Ashi vor', uke: 'frei' },
        { aspect: 'Angriff', tori: '2 × Kizami-Zuki (re/li), Yori-Ashi', uke: 'frei' },
        { aspect: 'Angriff', tori: '2 × Gyaku-Zuki, Yori-Ashi (re/li)', uke: 'frei' },
        { aspect: 'Angriff', tori: '2 × Oi-Zuki Jodan (re/li)', uke: 'frei' },
        { aspect: 'Angriff', tori: '2 × Mae-Geri (re/li)', uke: 'frei' },
        { aspect: 'Angriff', tori: '2 × Mawashi-Geri (re/li) hinteres Bein', uke: 'frei' },
        { aspect: 'Angriff', tori: '2 × Mawashi-Geri (re/li) vorderes Bein (SA)', uke: 'frei' },
        {
          aspect: 'Angriff',
          tori: '2 × Ushiro-Geri Chudan (re/li) oder alternativ 2 × Ura-Mawashi-Geri (re/li) (Angriff mit hinterem Bein)',
          uke: 'frei',
        },
      ],
      note: 'Die Tabelle beschreibt das Jiyu-Kumite. Abwehr und Gegenangriff sind frei. Es sind Yori-Ashi/Suri-Ashi (Gleitbewegung) und Kai-Ashi (Schritt) zu zeigen. Der Gegenangriff wird zu Kamae zurückgenommen. Es sind unterschiedliche Ausweichbewegungen sowie Faust- und Fußtechniken als Konter zu zeigen.',
    },
  },
  {
    id: '2-dan',
    type: 'dan',
    rank: 2,
    title: '2. Dan',
    belt: 'Schwarzer Gürtel',
    beltColor: BELT.black,
    group: 'Dan-Grade',
    kihon: [
      { no: 1, dir: 'vor', stance: 'ZK', text: '5 × Kizami-Zuki (SA) v Ren-Zuki' },
      { no: 2, dir: 'vor', stance: 'ZK', text: '5 × Age-Uke / Soto-Uke (gleicher Arm) / Gyaku-Zuki' },
      { no: 3, dir: 'vor', stance: 'ZK', text: '5 × Gyaku-Zuki (im Stand) v Uraken / Gyaku-Zuki (Wendung)' },
      { no: 4, dir: 'vor', stance: 'ZK', text: '5 × Mae-Geri v Mawashi-Geri / Uraken / Gyaku-Zuki (Wendung)' },
      {
        no: 5, dir: 'vor',
        stance: 'ZK',
        text: '5 × Oi-Zuki r KB Gedan-Barai / Ushiro-Geri / Uraken (Wendung)',
      },
      {
        no: 6, dir: 'vor',
        stance: 'ZK',
        text: '5 × Mae-Ashi-Geri v Ura-Mawashi-Geri / Gyaku-Zuki, oder nach eigener Wahl Mae-Ashi-Geri / Ushiro-Geri / Gyaku-Zuki (Wendung)',
      },
      { no: 7, dir: 'vor', stance: 'ZK', text: '5 × Yoko-Geri Kekomi (vorderes Bein) / Ushiro-Geri (Wendung)' },
      {
        no: 8, dir: 'vor',
        stance: 'ZK',
        text: '4 × Kizami-Zuki (SA) / Mawashi-Geri (vorderes Bein) / Gyaku-Zuki (2 × Schrittwechsel rechts und links) (Wendung)',
      },
      {
        no: 9, dir: 'vor',
        stance: 'ZK',
        text: '5 × Kizami-Zuki (YA/SA) / Gyaku-Zuki r NA Te-Nagashi-Uke Jodan (YA) / ZK Gyaku-Zuki v Ura-Mawashi-Geri (alternativ Mae-Geri) / Gyaku-Zuki (Wendung)',
      },
      {
        no: 10, dir: 'vor',
        stance: 'ZK',
        text: '5 × Oi-Zuki r KB Gedan-Barai / ZK Gyaku-Zuki v Mae-Geri / Kizami-Zuki / Gyaku-Zuki (Wendung mit Gedan-Barai / Gyaku-Zuki)',
      },
    ],
    kata: {
      tokui: 'Tokui Kata frei (nicht eine bisher gezeigte Kata).',
      shitei: '1 Shitei Kata aus Nijushiho, Tekki Nidan, Bassai Sho, Hangetsu, Empi.',
    },
    bunkai:
      'Drei Verteidigungs-Anwendungen mit Partner aus dem Kihon-Programm sowie drei Bunkai-Anwendungen aus der gewählten Tokui Kata.',
    kumite: {
      form: 'Jiyu-Kumite',
      extra: ['Jiyu-Ippon-Kumite'],
      rows: [
        {
          aspect: 'Ausgangsstellung',
          tori: 'freie Seitenwahl aus Kamae',
          uke: 'freie Seitenwahl aus Kamae',
        },
        { aspect: 'Bewegung', tori: 'Suri-Ashi vor', uke: 'frei' },
        { aspect: 'Angriff', tori: '2 × Kizami-Zuki Jodan (re/li), Suri-Ashi', uke: 'frei' },
        { aspect: 'Angriff', tori: '2 × Gyaku-Zuki Chudan, Suri-Ashi (re/li)', uke: 'frei' },
        { aspect: 'Angriff', tori: '2 × Oi-Zuki Jodan (re/li)', uke: 'frei' },
        { aspect: 'Angriff', tori: '2 × Mae-Geri (re/li)', uke: 'frei' },
        {
          aspect: 'Angriff',
          tori: '2 × Mawashi-Geri (re/li) hinteres Bein (Chudan)',
          uke: 'frei',
        },
        {
          aspect: 'Angriff',
          tori: '2 × Mawashi-Geri (re/li) vorderes Bein (Jodan)',
          uke: 'frei',
        },
        {
          aspect: 'Angriff',
          tori: '2 × Ushiro-Ura-Mawashi-Geri (re/li) oder alternativ 2 × Ushiro-Geri (re/li) (Angriff mit hinterem Bein)',
          uke: 'frei',
        },
      ],
      note: 'Die Tabelle beschreibt das Jiyu-Kumite. Abwehr und Gegenangriff sind frei. Es sind Yori-Ashi/Suri-Ashi (Gleitbewegung) und Kai-Ashi (Schritt) zu zeigen. Der Gegenangriff wird zu Kamae zurückgenommen. Es sind unterschiedliche Ausweichbewegungen sowie Faust- und Fußtechniken als Konter zu zeigen.',
    },
  },
  {
    id: '3-dan',
    type: 'dan',
    rank: 3,
    title: '3. Dan',
    belt: 'Schwarzer Gürtel',
    beltColor: BELT.black,
    group: 'Dan-Grade',
    kihon: [],
    kihonNote:
      '1.–4. Kombinationen nach Ansage des Prüflings, 5.–8. nach Wahl und Ansage der Prüfer. Dem Prüfling soll Gelegenheit gegeben werden, Techniken selbst zu wählen, die seine Stärken im Grundschulprogramm für den 3. Dan zeigen.',
    kata: {
      tokui: 'Tokui Kata frei, nicht eine bisher gezeigte Kata.',
      shitei: '1 Shitei Kata aus Sochin, Kanku-Sho, Gojushiho Sho, Jitte, Kanku Dai.',
    },
    bunkai:
      'Vier Verteidigungs-Anwendungen mit Partner aus dem eigenen Kihon-Programm sowie vier Bunkai-Anwendungen aus der gewählten Tokui Kata.',
    kumite: {
      extra: ['Jiyu-Ippon-Kumite (nach Wahl und Ansage der Prüfer)', 'Jiyu-Kumite'],
    },
  },
  {
    id: '4-dan',
    type: 'dan',
    rank: 4,
    title: '4. Dan',
    belt: 'Schwarzer Gürtel',
    beltColor: BELT.black,
    group: 'Dan-Grade',
    kihon: [],
    kihonNote:
      '1.–4. Kombinationen nach Ansage des Prüflings, 5.–8. nach Wahl und Ansage der Prüfer. Dem Prüfling soll Gelegenheit gegeben werden, Techniken selbst zu wählen, die seine Stärken im Grundschulprogramm für den 4. Dan zeigen.',
    kata: {
      tokui: 'Tokui Kata frei, nicht eine bisher gezeigte Kata.',
      shitei: '1 Shitei Kata aus Unsu, Gojushiho Dai, Meikyo, Chinte, Jiin, Gankaku.',
    },
    bunkai:
      'Vier Verteidigungs-Anwendungen mit Partner aus dem eigenen Kihon-Programm sowie vier Bunkai-Anwendungen aus der gewählten Tokui Kata.',
    kumite: {
      extra: ['Jiyu-Ippon-Kumite (nach Wahl und Ansage der Prüfer)', 'Jiyu-Kumite'],
    },
  },
  {
    id: '5-dan',
    type: 'dan',
    rank: 5,
    title: '5. Dan',
    belt: 'Schwarzer Gürtel',
    beltColor: BELT.black,
    group: 'Dan-Grade',
    kihon: [],
    kihonNote:
      '1.–4. Kombinationen nach Ansage des Prüflings, 5.–8. nach Wahl und Ansage der Prüfer. Dem Prüfling soll Gelegenheit gegeben werden, Techniken selbst zu wählen, die seine Stärken im Grundschulprogramm für den 5. Dan zeigen.',
    kata: {
      tokui: 'Tokui Kata frei, nicht eine bisher gezeigte Kata.',
      shitei: '2 Shitei Katas aus Tekki Sandan, Bassai Sho, Sochin, Meikyo, Jitte, Wankan.',
    },
    bunkai:
      'Vier Verteidigungs-Anwendungen mit Partner aus dem eigenen Kihon-Programm sowie vier Bunkai-Anwendungen aus der gewählten Tokui Kata.',
    kumite: {
      extra: ['Jiyu-Ippon-Kumite (nach Wahl und Ansage der Prüfer)', 'Jiyu-Kumite'],
    },
  },
  {
    id: '6-dan',
    type: 'dan',
    rank: 6,
    title: '6. Dan',
    belt: 'Schwarzer Gürtel',
    beltColor: BELT.black,
    group: 'Dan-Grade',
    kihon: [],
    kihonNote:
      '1.–4. Kombinationen nach Ansage des Prüflings, 5.–6. nach Wahl und Ansage der Prüfer. Dem Prüfling soll Gelegenheit gegeben werden, Techniken selbst zu wählen, die seine Stärken im Grundschulprogramm für den 6. Dan zeigen.',
    kata: { tokui: 'Es sind zwei Katas nach eigener Wahl zu zeigen.' },
    bunkai:
      'Verteidigungs-Anwendungen mit Partner aus dem eigenen Kihon-Programm sowie das gesamte Bunkai aus der gewählten Tokui Kata.',
    kumite: {
      extra: ['Formen nach Wahl des Prüflings (z. B. Jiyu-Kumite, Jiyu-Ippon-Kumite)'],
    },
  },
  {
    id: '7-dan',
    type: 'dan',
    rank: 7,
    title: '7. Dan',
    belt: 'Schwarzer Gürtel',
    beltColor: BELT.black,
    group: 'Dan-Grade',
    kihon: [],
    kihonNote:
      '1.–2. Kombinationen nach Ansage des Prüflings, 3.–5. nach Wahl und Ansage der Prüfer. Dem Prüfling soll Gelegenheit gegeben werden, Techniken selbst zu wählen, die seine Stärken im Grundschulprogramm für den 7. Dan zeigen.',
    kata: { tokui: 'Es sind zwei Katas nach eigener Wahl zu zeigen.' },
    bunkai:
      'Verteidigungs-Anwendungen mit Partner aus dem eigenen Kihon-Programm sowie das gesamte Bunkai aus der gewählten Tokui Kata.',
    kumite: {
      extra: ['Formen nach Wahl des Prüflings (z. B. Jiyu-Kumite, Jiyu-Ippon-Kumite)'],
    },
  },
  {
    id: '8-dan',
    type: 'dan',
    rank: 8,
    title: '8. Dan',
    belt: 'Schwarzer Gürtel',
    beltColor: BELT.black,
    group: 'Dan-Grade',
    kihon: [],
    kata: { tokui: 'Es sind zwei Katas nach eigener Wahl zu zeigen.' },
    bunkai: 'Es ist das gesamte Bunkai einer Tokui Kata zu zeigen.',
  },
]

export const kyuGrades = grades.filter((g) => g.type === 'kyu')
export const danGrades = grades.filter((g) => g.type === 'dan')

export function getGrade(id: string): Grade | undefined {
  return grades.find((g) => g.id === id)
}
