import React, { useEffect, useMemo } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useTizenKeys } from '../hooks/useTizenKeys'
import { useStore } from '../store.jsx'
import { isScrollDisabled } from '../uiSettings'
import '../theme.css'

/**
 * AppShell renders:
 * - Left navigation rail (Home, Search) with remote focus
 * - Header with current route title
 * - Outlet to show view content
 *
 * Remote behavior:
 * - LEFT when in main content moves focus to nav
 * - RIGHT from nav moves into content
 * - ENTER on nav triggers navigation
 * - BACK navigates up: from player -> previous, from search/home -> stays or logs
 */

 // PUBLIC_INTERFACE
export default function AppShell() {
  const nav = useNavigate()
  const loc = useLocation()
  const { state, setNavFocus } = useStore()

  // Enforce body no-scroll if configured
  useEffect(() => {
    if (isScrollDisabled()) {
      document.documentElement.style.overflow = 'hidden'
      document.body.style.overflow = 'hidden'
    }
    return () => {
      // keep hidden for the app lifetime; no-op on unmount
    }
  }, [])

  const title = useMemo(() => {
    if (loc.pathname.startsWith('/search')) return 'Search'
    if (loc.pathname.startsWith('/player')) return 'Now Playing'
    return 'Home'
  }, [loc.pathname])

  useTizenKeys({
    onBack: () => {
      if (loc.pathname.startsWith('/player')) {
        nav(-1)
      } else {
        // In a real Tizen app, tizen.application.getCurrentApplication().exit();
        console.log('Back pressed at root; ignoring in dev.')
      }
    },
  })

  function handleEnterNav(index) {
    if (index === 0) nav('/')
    if (index === 1) nav('/search')
  }

  return (
    <div className="app-shell">
      <aside className="nav-rail">
        <div className="nav-title">Retro Stream</div>
        <div className="retro-divider" />
        <button
          className={'nav-item ' + (state.focus.navIndex === 0 ? 'focused' : '')}
          onClick={() => handleEnterNav(0)}
          data-focusable="nav"
          data-index="0"
        >
          Home
        </button>
        <button
          className={'nav-item ' + (state.focus.navIndex === 1 ? 'focused' : '')}
          onClick={() => handleEnterNav(1)}
          data-focusable="nav"
          data-index="1"
        >
          Search
        </button>
      </aside>
      <main className="main-area">
        <div className="header-bar">
          <div className="header-title">{title}</div>
          <div className="header-actions"></div>
        </div>
        <div
          className="surface-card fx-fade-in"
          style={{ width: '100%', height: 'calc(100% - 52px)', overflow: 'hidden' }}
        >
          <Outlet context={{ setNavFocus }} />
        </div>
      </main>
    </div>
  )
}
