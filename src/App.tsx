import { NavLink, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { useTheme } from './useTheme'
import { HomePage } from './pages/HomePage'
import { GradeDetailPage } from './pages/GradeDetailPage'
import { GlossaryPage } from './pages/GlossaryPage'
import { InfoPage } from './pages/InfoPage'
import { getGrade } from './data/grades'

function AppBar() {
  const { theme, toggle } = useTheme()
  const location = useLocation()
  const navigate = useNavigate()

  const isDetail = location.pathname.startsWith('/grade/')
  let title = 'Shotokan Prüfungsordnung'
  let subtitle = '9. Kyu – 8. Dan'
  if (location.pathname.startsWith('/glossar')) {
    title = 'Glossar'
    subtitle = 'Japanische Begriffe'
  } else if (location.pathname.startsWith('/info')) {
    title = 'Information'
    subtitle = 'Grundsätze & Legende'
  } else if (isDetail) {
    const id = location.pathname.split('/')[2]
    const g = getGrade(id)
    title = g ? g.title : 'Grad'
    subtitle = g ? g.belt : ''
  }

  return (
    <header className="appbar">
      {isDetail && (
        <button className="back" onClick={() => navigate(-1)} aria-label="Zurück">
          ‹
        </button>
      )}
      <h1>
        {title} <span className="subtitle">{subtitle}</span>
      </h1>
      <button
        className="theme-toggle"
        onClick={toggle}
        aria-label="Hell/Dunkel umschalten"
        title="Hell/Dunkel umschalten"
      >
        {theme === 'dark' ? '☀' : '☾'}
      </button>
    </header>
  )
}

function TabBar() {
  return (
    <nav className="tabbar">
      <NavLink to="/" end>
        <span className="ico">🥋</span>
        Grade
      </NavLink>
      <NavLink to="/glossar">
        <span className="ico">📖</span>
        Glossar
      </NavLink>
      <NavLink to="/info">
        <span className="ico">ℹ️</span>
        Info
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
          <Route path="/info" element={<InfoPage />} />
          <Route path="*" element={<HomePage />} />
        </Routes>
      </main>
      <TabBar />
    </div>
  )
}
