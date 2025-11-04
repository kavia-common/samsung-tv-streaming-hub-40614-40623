//
// PUBLIC_INTERFACE
// Global UI settings for TV scroll mode and pagination behavior.
//
export const UI_SETTINGS = {
  /** Disable global scroll on TV (body/root overflow hidden). Set to false to restore scroll. */
  disableScroll: false,
  /** If scroll is enabled, you can control axis-specific behavior. */
  allowVerticalScroll: true,
  allowHorizontalScroll: true,
  /** Items per row for Home carousels (used when scroll is disabled to paginate). */
  homeItemsPerPage: 5,
  /** Maximum categories shown per page (if needed). Keep 3 for 1080p TV layout. */
  homeRowsPerPage: 3,
  /** Results grid pagination (no scroll): columns and rows per page. */
  searchResultsCols: 4,
  searchResultsRows: 2,
}

// PUBLIC_INTERFACE
export function isScrollDisabled() {
  /** Return whether global scroll should be off across the app. */
  return !!UI_SETTINGS.disableScroll
}

// PUBLIC_INTERFACE
export function scrollAxes() {
  /** Return the allowed scroll axes based on settings. */
  return {
    vertical: !!UI_SETTINGS.allowVerticalScroll,
    horizontal: !!UI_SETTINGS.allowHorizontalScroll,
  }
}
