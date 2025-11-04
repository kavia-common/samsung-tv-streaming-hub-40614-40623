import React from 'react'
import { createBrowserRouter } from 'react-router-dom'
import AppShell from './ui/AppShell.jsx'
import Home from './views/Home.jsx'
import Search from './views/Search.jsx'
import Player from './views/Player.jsx'

// PUBLIC_INTERFACE
export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <Home /> },
      { path: 'search', element: <Search /> },
      { path: 'player/:id', element: <Player /> },
    ],
  },
])

export default router
