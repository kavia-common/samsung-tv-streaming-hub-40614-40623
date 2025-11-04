import React, { useEffect, useMemo } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'
import { useTizenKeys } from '../hooks/useTizenKeys'
import { useStore } from '../store.jsx'
import { categories } from '../mockData'

/**
 * Home screen:
 * - Renders multiple horizontal carousels for categories
 * - Focus: row/col item with LEFT/RIGHT to move within row and UP/DOWN to change category row
 * - ENTER navigates to player for the focused item
 * - LEFT at col 0 moves focus to nav
 */
export default function Home() {
  const nav = useNavigate()
  const { setNavFocus } = useOutletContext()
  const { state, setHomeFocus, setSelectedItem } = useStore()

  const rows = useMemo(() => categories, [])

  useEffect(() => {
    // keep indices within bounds in case of navigation back
    const r = Math.min(state.focus.home.row, rows.length - 1)
    const c = Math.min(state.focus.home.col, rows[r].items.length - 1)
    if (r !== state.focus.home.row || c !== state.focus.home.col) {
      setHomeFocus({ row: r, col: c })
    }
  }, [rows, setHomeFocus, state.focus.home.row, state.focus.home.col])

  useTizenKeys({
    onLeft: () => {
      const { row, col } = state.focus.home
      if (col === 0) {
        setNavFocus(0)
      } else {
        setHomeFocus({ row, col: Math.max(0, col - 1) })
      }
    },
    onRight: () => {
      const { row, col } = state.focus.home
      setHomeFocus({ row, col: Math.min(rows[row].items.length - 1, col + 1) })
    },
    onUp: () => {
      const { row, col } = state.focus.home
      const nr = Math.max(0, row - 1)
      setHomeFocus({ row: nr, col: Math.min(col, rows[nr].items.length - 1) })
    },
    onDown: () => {
      const { row, col } = state.focus.home
      const nr = Math.min(rows.length - 1, row + 1)
      setHomeFocus({ row: nr, col: Math.min(col, rows[nr].items.length - 1) })
    },
    onEnter: () => {
      const { row, col } = state.focus.home
      const item = rows[row].items[col]
      setSelectedItem(item)
      nav(`/player/${item.id}`)
    },
  })

  return (
    <div style={{ width:'100%', height:'100%', overflow:'hidden', display:'flex', flexDirection:'column' }}>
      <div style={{ padding: '18px 18px 8px 18px', color: '#374151', fontWeight: 700 }}>
        Browse
      </div>
      <div style={{ flex:1, overflowY:'auto', padding:'0 8px 12px 8px' }}>
        {rows.map((cat, rIndex) => (
          <section key={cat.id} className="carousel surface-card">
            <div className="carousel-title">{cat.title}</div>
            <div className="carousel-row">
              {cat.items.map((it, cIndex) => {
                const focused = rIndex === state.focus.home.row && cIndex === state.focus.home.col
                return (
                  <div
                    key={it.id}
                    className={'card ' + (focused ? 'focused' : '')}
                    role="button"
                    aria-label={it.title}
                  >
                    <div className="card-label">{it.title}</div>
                  </div>
                )
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
