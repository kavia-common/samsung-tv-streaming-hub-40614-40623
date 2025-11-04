import React, { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store.jsx'
import { useTizenKeys } from '../hooks/useTizenKeys'
import { searchItems } from '../mockData'
import { UI_SETTINGS } from '../uiSettings'

const keyboardRows = [
  'QWERTYUIOP'.split(''),
  'ASDFGHJKL'.split(''),
  ['⇦','Z','X','C','V','B','N','M','⌫','␣','OK'], // includes backspace, space, OK
]

/**
 * Search screen (no-scroll):
 * - Keyboard zone and paginated results grid (no container scrolling).
 * - Results grid paginates using cols x rows from UI settings.
 */
export default function Search() {
  const nav = useNavigate()
  const { state, setSearch, setSearchFocus, setSelectedItem } = useStore()
  const allResults = useMemo(() => searchItems(state.searchQuery), [state.searchQuery])

  const COLS = UI_SETTINGS.searchResultsCols
  const ROWS = UI_SETTINGS.searchResultsRows
  const PAGE_SIZE = COLS * ROWS

  const currentIdx = state.focus.search.resultsIndex
  const page = Math.floor(currentIdx / PAGE_SIZE)
  const start = page * PAGE_SIZE
  const end = start + PAGE_SIZE
  const pageResults = allResults.slice(start, end)

  function moveKeyboard(dr, dc) {
    const { keyRow, keyCol } = state.focus.search
    const rows = keyboardRows
    let nr = Math.max(0, Math.min(rows.length - 1, keyRow + dr))
    let nc = Math.max(0, Math.min(rows[nr].length - 1, keyCol + dc))
    setSearchFocus({ ...state.focus.search, zone: 'keyboard', keyRow: nr, keyCol: nc })
  }

  function activateKey() {
    const { keyRow, keyCol } = state.focus.search
    const key = keyboardRows[keyRow][keyCol]
    if (key === '⌫') {
      setSearch(state.searchQuery.slice(0, -1))
      return
    }
    if (key === '␣') {
      setSearch(state.searchQuery + ' ')
      return
    }
    if (key === '⇦') {
      // move focus to first key to hint nav access via Home LEFT handling
      setSearchFocus({ ...state.focus.search, zone: 'keyboard', keyRow, keyCol: 0 })
      return
    }
    if (key === 'OK') {
      // no-op (live search)
      return
    }
    setSearch(state.searchQuery + key)
  }

  useTizenKeys({
    onLeft: () => {
      if (state.focus.search.zone === 'keyboard') {
        moveKeyboard(0, -1)
      } else {
        const idx = Math.max(0, currentIdx - 1)
        setSearchFocus({ ...state.focus.search, zone: 'results', resultsIndex: idx })
      }
    },
    onRight: () => {
      if (state.focus.search.zone === 'keyboard') {
        moveKeyboard(0, +1)
      } else {
        const idx = Math.min(allResults.length - 1, currentIdx + 1)
        setSearchFocus({ ...state.focus.search, zone: 'results', resultsIndex: idx })
      }
    },
    onUp: () => {
      if (state.focus.search.zone === 'keyboard') {
        moveKeyboard(-1, 0)
      } else {
        const idx = Math.max(0, currentIdx - COLS)
        setSearchFocus({ ...state.focus.search, zone: 'results', resultsIndex: idx })
      }
    },
    onDown: () => {
      if (state.focus.search.zone === 'keyboard') {
        if (allResults.length > 0) {
          setSearchFocus({ ...state.focus.search, zone: 'results', resultsIndex: 0 })
        }
      } else {
        const idx = Math.min(allResults.length - 1, currentIdx + COLS)
        setSearchFocus({ ...state.focus.search, zone: 'results', resultsIndex: idx })
      }
    },
    onEnter: () => {
      if (state.focus.search.zone === 'keyboard') {
        activateKey()
      } else {
        const item = allResults[currentIdx]
        if (item) {
          setSelectedItem(item)
          nav(`/player/${item.id}`)
        }
      }
    },
  })

  return (
    <div style={{ width:'100%', height:'100%', display:'flex', flexDirection:'column' }}>
      <div style={{ padding: '16px', display:'flex', gap: '12px', alignItems:'center' }}>
        <div className={'search-bar ' + (state.focus.search.zone === 'keyboard' ? 'focused' : '')}>
          <span className="search-input">{state.searchQuery || 'Type with on-screen keyboard...'}</span>
        </div>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'520px 1fr', gap:'12px', padding:'0 12px 12px 12px', flex:'1' }}>
        <div className="surface-card">
          <div className="keyboard">
            {keyboardRows.map((row, r) => row.map((k, c) => {
              const focused = state.focus.search.zone === 'keyboard' && state.focus.search.keyRow === r && state.focus.search.keyCol === c
              const isWide = k === '␣' || k === 'OK'
              return (
                <div key={`${k}-${r}-${c}`} className={'key ' + (isWide ? 'wide ' : '') + (focused ? 'focused' : '')}>
                  {k}
                </div>
              )
            }))}
          </div>
        </div>
        <div className="surface-card" style={{ overflow:'hidden' }}>
          <div style={{ padding:'12px 16px', fontWeight:700, color:'#374151' }}>
            Results {allResults.length > PAGE_SIZE ? `(Page ${page + 1}/${Math.max(1, Math.ceil(allResults.length / PAGE_SIZE))})` : ''}
          </div>
          <div className="results">
            {pageResults.length === 0 ? (
              <div style={{ padding:'16px', color:'#6b7280' }}>No results</div>
            ) : pageResults.map((r, idx) => {
              const absoluteIdx = start + idx
              const focused = state.focus.search.zone === 'results' && state.focus.search.resultsIndex === absoluteIdx
              return (
                <div key={`${r.id}-${page}-${idx}`} className={'result-item ' + (focused ? 'focused' : '')}>
                  <div style={{ fontWeight:700 }}>{r.title}</div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
