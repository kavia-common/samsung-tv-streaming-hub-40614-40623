import { useStore } from '../store.jsx'

/**
 * Helpers for moving focus between nav and content.
 * You can use focus metadata in store to coordinate remote focus drawing.
 */

// PUBLIC_INTERFACE
export function useNavFocus() {
  const { state, setNavFocus } = useStore()
  return {
    navIndex: state.focus.navIndex,
    setNavFocus,
  }
}
