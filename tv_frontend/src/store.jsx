/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useMemo, useReducer } from 'react'

/**
 * Global state for TV navigation and selection.
 * Holds search query, selected category, selected item, and focus positions.
 */

const initialState = {
  selectedCategoryId: null,
  searchQuery: '',
  selectedItem: null, // { id, title, url }
  focus: {
    // Home view focus: which row (category index) and col (item index)
    home: { row: 0, col: 0 },
    // Search view focus: 'keyboard' or 'results'; keyboard grid pos r,c or results index
    search: { zone: 'keyboard', keyRow: 0, keyCol: 0, resultsIndex: 0 },
    // Nav focus: 0 home, 1 search
    navIndex: 0,
  },
}

function reducer(state, action) {
  switch (action.type) {
    case 'SET_CATEGORY':
      return { ...state, selectedCategoryId: action.id }
    case 'SET_SEARCH':
      return { ...state, searchQuery: action.query }
    case 'SET_SELECTED_ITEM':
      return { ...state, selectedItem: action.item }
    case 'SET_HOME_FOCUS':
      return { ...state, focus: { ...state.focus, home: action.home } }
    case 'SET_SEARCH_FOCUS':
      return { ...state, focus: { ...state.focus, search: action.search } }
    case 'SET_NAV_FOCUS':
      return { ...state, focus: { ...state.focus, navIndex: action.index } }
    default:
      return state
  }
}

const StoreCtx = createContext(null)

// PUBLIC_INTERFACE
export function StoreProvider({ children }) {
  /** Provide a reducer store for app-wide TV-focused navigation */
  const [state, dispatch] = useReducer(reducer, initialState)
  const api = useMemo(() => {
    return {
      state,
      setCategory: (id) => dispatch({ type: 'SET_CATEGORY', id }),
      setSearch: (query) => dispatch({ type: 'SET_SEARCH', query }),
      setSelectedItem: (item) => dispatch({ type: 'SET_SELECTED_ITEM', item }),
      setHomeFocus: (home) => dispatch({ type: 'SET_HOME_FOCUS', home }),
      setSearchFocus: (search) => dispatch({ type: 'SET_SEARCH_FOCUS', search }),
      setNavFocus: (index) => dispatch({ type: 'SET_NAV_FOCUS', index }),
    }
  }, [state])
  return <StoreCtx.Provider value={api}>{children}</StoreCtx.Provider>
}

// PUBLIC_INTERFACE
export function useStore() {
  /** Access the global store API */
  const ctx = useContext(StoreCtx)
  if (!ctx) throw new Error('useStore must be used within StoreProvider')
  return ctx
}
