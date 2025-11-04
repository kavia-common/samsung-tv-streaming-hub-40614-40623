import React, { useEffect, useMemo } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'
import { useTizenKeys } from '../hooks/useTizenKeys'
import { useStore } from '../store.jsx'
import { categories } from '../mockData'
import { UI_SETTINGS } from '../uiSettings'

/**
 * Home screen (no-scroll):
 * - Uses pagination for carousels (no native scroll). LEFT/RIGHT adjusts col and shifts page when crossing bounds.
 * - UP/DOWN changes category row.
 * - ENTER navigates to player for the focused item.
 * - LEFT at col 0 moves focus to nav.
 * Animations rely on transform/opacity only for 60fps on TV hardware.
 */
export default function Home() {
  const nav = useNavigate()
  const { setNavFocus } = useOutletContext()
  const { state, setHomeFocus, setSelectedItem } = useStore()

  const rows = useMemo(() => categories, [])
  const pageSize = UI_SETTINGS.homeItemsPerPage

  useEffect(() => {
    // keep indices within bounds in case of navigation back
    const r = Math.min(state.focus.home.row, rows.length - 1)
    const c = Math.min(state.focus.home.col, rows[r].items.length - 1)
    if (r !== state.focus.home.row || c !== state.focus.home.col) {
      setHomeFocus({ row: r, col: c })
    }
  }, [rows, setHomeFocus, state.focus.home.row, state.focus.home.col])

  function visibleSliceForRow(rIndex) {
    const currentCol = state.focus.home.row === rIndex ? state.focus.home.col : 0
    const page = Math.floor(currentCol / pageSize)
    const start = page * pageSize
    const end = start + pageSize
    return { start, end }
  }

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
      <div style={{ flex:1, overflow:'hidden', padding:'0 8px 12px 8px' }}>
        {rows.map((cat, rIndex) => {
          const { start, end } = visibleSliceForRow(rIndex)
          const items = cat.items.slice(start, end)
          const currentPage = Math.floor((state.focus.home.row === rIndex ? state.focus.home.col : 0) / pageSize)
          return (
            <section key={cat.id} className="carousel surface-card fx-fade-in">
              <div className="carousel-title">{cat.title}</div>
              <div
                className="carousel-row"
                style={{
                  // Horizontal slide to suggest there are more items without scrolling
                  transform: 'translate3d(0,0,0)',
                }}
              >
                {items.map((it, idx) => {
                  const absoluteIndex = start + idx
                  const focused = rIndex === state.focus.home.row && absoluteIndex === state.focus.home.col
                  return (
                    <div
                      key={`${it.id}-${currentPage}-${idx}`}
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
          )
        })}
      </div>
    </div>
  )
}
