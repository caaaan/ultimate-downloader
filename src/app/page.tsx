'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

export default function Home() {
  const [isDownloading, setIsDownloading] = useState(false)
  const [error, setError] = useState(false)
  const searchParams = useSearchParams()

  useEffect(() => {
    if (!searchParams) {
      setError(true)
      return 
    }
    const url = searchParams.get('url')
    const format = searchParams.get('format') || 'mp3'

    if (url) {
      setIsDownloading(true)
      fetch(`/api/download?url=${encodeURIComponent(url)}&format=${format}`)
        .then(response => response.blob())
        .then(blob => {
          const link = document.createElement('a')
          link.href = window.URL.createObjectURL(blob)
          link.download = `download.${format}`
          document.body.appendChild(link)
          link.click()
          link.remove()
          window.close()
        })
        .catch(error => {
          console.error('Download failed:', error)
          setIsDownloading(false)
        })
    }
  }, [searchParams])

  if (error) {
    return <h1 className="text-2xl">sorry, unsupported link :(</h1>
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-black text-white">
      <h1 className="text-4xl font-bold">{isDownloading ? 'here you go!' : 'hi :)'}</h1>
    </div>
  )
}

