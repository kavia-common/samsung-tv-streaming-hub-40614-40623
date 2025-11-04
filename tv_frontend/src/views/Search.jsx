import React, { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store.jsx'
import { useTizenKeys } from '../hooks/useTizenKeys'
import { searchItems } from '../mockData'

const keyboardRows = [
  'QWERTYUIOP'.split(''),
  'ASDFGHJKL'.split(''),
  ['⇦','Z','X','C','V','B','N','M','⌫','␣','OK'], // includes backspace, space, OK
]

/**
 * Search screen:
 * - Focus zone between keyboard and results list
 * - Keyboard supports letters, backspace, space, OK (stay)
 * - Results refreshed as you type; ENTER on result plays it
 */
export default function Search() {
  const nav = useNavigate()
  const { state, setSearch, setSearchFocus, setSelectedItem } = useStore()
  const results = useMemo(() => searchItems(state.searchQuery), [state.searchQuery])

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
      // move focus back to nav via Home logic; emulate Left on first col
      setSearchFocus({ ...state.focus.search, zone: 'keyboard', keyRow, keyCol: 0 })
      return
    }
    if (key === 'OK') {
      // could trigger search submit; here no-op as we search live
      return
    }
    setSearch(state.searchQuery + key)
  }

  useTizenKeys({
    onLeft: () => {
      if (state.focus.search.zone === 'keyboard') {
        moveKeyboard(0, -1)
      } else {
        // From results, go back to keyboard zone
        setSearchFocus({ ...state.focus.search, zone: 'keyboard' })
      }
    },
    onRight: () => {
      if (state.focus.search.zone === 'keyboard') {
        moveKeyboard(0, +1)
      } else {
        // stay in results grid; move focus to next item
        const idx = state.focus.search.resultsIndex
        setSearchFocus({ ...state.focus.search, zone: 'results', resultsIndex: Math.min(results.length - 1, idx + 1) })
      }
    },
    onUp: () => {
      if (state.focus.search.zone === 'keyboard') {
        moveKeyboard(-1, 0)
      } else {
        // move up in results grid (4 cols)
        const idx = state.focus.search.resultsIndex
        const n = Math.max(0, idx - 4)
        setSearchFocus({ ...state.focus.search, zone: 'results', resultsIndex: n })
      }
    },
    onDown: () => {
      if (state.focus.search.zone === 'keyboard') {
        // jump to results if any
        if (results.length > 0) {
          setSearchFocus({ ...state.focus.search, zone: 'results', resultsIndex: 0 })
        }
      } else {
        const idx = state.focus.search.resultsIndex
        const n = Math.min(results.length - 1, idx + 4)
        setSearchFocus({ ...state.focus.search, zone: 'results', resultsIndex: n })
      }
    },
    onEnter: () => {
      if (state.focus.search.zone === 'keyboard') {
        activateKey()
      } else {
        const item = results[state.focus.search.resultsIndex]
        if (item) {
          setSelectedItem(item)
          nav(`/player/${item.id}`)
        }
      }
    },
  })

  return (
    <div style={{ width:'100%', height:'100%', overflow:'hidden', display:'flex', flexDirection:'column' }}>
      <div style={{ padding: '16px', display:'flex', gap: '12px', alignItems:'center' }}>
        <div className={'search-bar ' + (state.focus.search.zone === 'keyboard' ? 'focused' : '')}>
          <span className="search-input">{state.searchQuery || 'Type with on-screen keyboard...'}</span>
        </div>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'520px 1fr', gap:'12px', padding:'0 12px 12px 12px', overflow:'hidden', flex:'1' }}>
        <div className="surface-card" style={{ overflow:'hidden' }}>
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
        <div className="surface-card" style={{ overflow:'auto' }}>
          <div style={{ padding:'12px 16px', fontWeight:700, color:'#374151' }}>Results</div>
          <div className="results">
            {results.length === 0 ? (
              <div style={{ padding:'16px', color:'#6b7280' }}>No results</div>
            ) : results.map((r, idx) => {
              const focused = state.focus.search.zone === 'results' && state.focus.search.resultsIndex === idx
              return (
                <div key={r.id} className={'result-item ' + (focused ? 'focused' : '')}>
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
