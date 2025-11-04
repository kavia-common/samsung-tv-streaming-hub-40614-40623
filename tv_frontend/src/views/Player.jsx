import React, { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useStore } from '../store.jsx'
import { useTizenKeys } from '../hooks/useTizenKeys'
import { categories } from '../mockData'

/**
 - PUBLIC_INTERFACE
 Player screen
 Purpose: Playback a selected video using HTML5 video tailored for Tizen Web runtime.
 Params: URL param id, used to resolve the item from store fallback search.
 Returns: A full-screen player area with minimal overlay.
 Remote controls:
  - ENTER: toggle play/pause
  - BACK: navigate back (handled in AppShell)
  - LEFT/RIGHT: small seek (-/+ 5 seconds)
  - UP/DOWN: show/hide overlay
 */
export default function Player() {
  const params = useParams()
  const nav = useNavigate()
  const { state, setSelectedItem } = useStore()
  const videoRef = useRef(null)
  const [showOverlay, setShowOverlay] = useState(true)

  // Resolve item if not present (navigate directly)
  useEffect(() => {
    if (!state.selectedItem) {
      // find by id in mock data
      for (const cat of categories) {
        const found = cat.items.find(i => i.id === params.id)
        if (found) {
          setSelectedItem(found)
          break
        }
      }
    }
  }, [params.id, setSelectedItem, state.selectedItem])

  useEffect(() => {
    // auto play when loaded if possible
    const v = videoRef.current
    if (!v || !state.selectedItem) return
    const onCanPlay = () => {
      v.play().catch(() => {})
    }
    v.addEventListener('canplay', onCanPlay)
    return () => v.removeEventListener('canplay', onCanPlay)
  }, [state.selectedItem])

  useTizenKeys({
    onEnter: () => {
      const v = videoRef.current
      if (!v) return
      if (v.paused) v.play().catch(() => {})
      else v.pause()
    },
    onLeft: () => {
      const v = videoRef.current
      if (!v) return
      v.currentTime = Math.max(0, v.currentTime - 5)
    },
    onRight: () => {
      const v = videoRef.current
      if (!v) return
      v.currentTime = Math.min((v.duration || v.currentTime + 5), v.currentTime + 5)
    },
    onUp: () => setShowOverlay(true),
    onDown: () => setShowOverlay(false),
    onBack: () => nav(-1),
  })

  if (!state.selectedItem) {
    return <div style={{ padding: 24 }}>Loading...</div>
  }

  return (
    <div style={{ width:'100%', height:'100%', display:'flex', flexDirection:'column' }}>
      <div style={{ padding:'12px 16px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div style={{ fontWeight:800 }}>{state.selectedItem.title}</div>
        <div style={{ color:'#6b7280' }}>ENTER: Play/Pause • ←/→: Seek • BACK: Exit</div>
      </div>
      <div className="player-stage surface-card">
        <video
          ref={videoRef}
          className="video-el"
          src={state.selectedItem.url}
          controls={false}
          playsInline
          preload="auto"
        />
        {showOverlay && (
          <div style={{
            position:'absolute', left:16, bottom:16, background:'rgba(0,0,0,0.5)',
            color:'#fff', padding:'10px 12px', borderRadius:10, fontSize:16
          }}>
            Playing on Tizen HTML5 video. Use remote to control playback.
          </div>
        )}
      </div>
    </div>
  )
}
