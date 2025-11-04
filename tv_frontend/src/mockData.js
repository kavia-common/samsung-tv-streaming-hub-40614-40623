export const categories = [
  {
    id: 'featured',
    title: 'Featured Classics',
    items: [
      { id: 'vid1', title: 'Sample Ocean Waves', thumbnail: '', url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4' },
      { id: 'vid2', title: 'Retro Demo Reel', thumbnail: '', url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4' },
      { id: 'vid3', title: 'Amber Lights', thumbnail: '', url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4' },
      { id: 'vid4', title: 'Blue Horizons', thumbnail: '', url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4' },
      { id: 'vid5', title: 'Pixel Night', thumbnail: '', url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4' },
    ],
  },
  {
    id: 'action',
    title: 'Action',
    items: [
      { id: 'vid6', title: 'Chase Scene', thumbnail: '', url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4' },
      { id: 'vid7', title: 'Retro Fighters', thumbnail: '', url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4' },
      { id: 'vid8', title: 'Neon Streets', thumbnail: '', url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4' },
      { id: 'vid9', title: 'Turbo Rush', thumbnail: '', url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4' },
    ],
  },
  {
    id: 'documentary',
    title: 'Documentary',
    items: [
      { id: 'vid10', title: 'Nature Retro', thumbnail: '', url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4' },
      { id: 'vid11', title: 'Deep Sea', thumbnail: '', url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4' },
      { id: 'vid12', title: 'City Stories', thumbnail: '', url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4' },
    ],
  },
]

export function searchItems(query) {
  if (!query) return []
  const q = query.toLowerCase()
  const results = []
  for (const cat of categories) {
    for (const item of cat.items) {
      if (item.title.toLowerCase().includes(q)) {
        results.push(item)
      }
    }
  }
  return results.slice(0, 25)
}
