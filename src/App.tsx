import { NavLink, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { Belt } from './components/Belt'
import { beltContrast } from './belt'
import { HomePage } from './pages/HomePage'
import { GradeDetailPage } from './pages/GradeDetailPage'
import { GlossaryPage } from './pages/GlossaryPage'
import { SettingsPage } from './pages/SettingsPage'
import { getGrade } from './data/grades'

function AppBar() {
  const location = useLocation()
  const navigate = useNavigate()

  const isDetail = location.pathname.startsWith('/grade/')
  const detailGrade = isDetail ? getGrade(location.pathname.split('/')[2]) : undefined

  // Belt-tinted merged header on a resolved grade detail page.
  if (detailGrade) {
    const { fg, isLight } = beltContrast(detailGrade.beltColor)
    return (
      <header
        className={`appbar belt-head${isLight ? ' belt-head--light' : ''}`}
        style={{ background: detailGrade.beltColor, color: fg }}
      >
        <button className="back" onClick={() => navigate('/')} aria-label="Zur Gürtel-Übersicht">
          ‹
        </button>
        <Belt grade={detailGrade} />
        <div className="head-text">
          <div className="head-title">{detailGrade.title}</div>
          <div className="head-sub">
            {detailGrade.belt} · {detailGrade.group}
          </div>
        </div>
      </header>
    )
  }

  let title = 'Shotokan Prüfungsordnung'
  let subtitle = '9. Kyu – 8. Dan'
  if (location.pathname.startsWith('/glossar')) {
    title = 'Glossar'
    subtitle = 'Japanische Begriffe'
  } else if (location.pathname.startsWith('/info')) {
    title = 'Einstellung'
    subtitle = 'Darstellung & Grundsätze'
  } else if (isDetail) {
    // Detail route but grade id not found.
    title = 'Grad'
    subtitle = ''
  }

  return (
    <header className="appbar">
      {isDetail && (
        <button className="back" onClick={() => navigate('/')} aria-label="Zur Gürtel-Übersicht">
          ‹
        </button>
      )}
      <h1>
        {title} <span className="subtitle">{subtitle}</span>
      </h1>
    </header>
  )
}

function TabBar() {
  return (
    <nav className="tabbar">
      <NavLink to="/" end>
        <span className="ico">🥋</span>
        Gürtel
      </NavLink>
      <NavLink to="/glossar">
        <span className="ico">📖</span>
        Glossar
      </NavLink>
      <NavLink to="/info">
        <span className="ico">⚙️</span>
        Einstellung
      </NavLink>
    </nav>
  )
}

export default function App() {
  return (
    <div className="app">
      <AppBar />
      <main className="content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/grade/:id" element={<GradeDetailPage />} />
          <Route path="/glossar" element={<GlossaryPage />} />
          <Route path="/info" element={<SettingsPage />} />
          <Route path="*" element={<HomePage />} />
        </Routes>
      </main>
      <TabBar />
    </div>
  )
}
