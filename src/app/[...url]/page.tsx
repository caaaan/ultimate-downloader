'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import React from 'react'

export default function DownloadPage() {
  const [isDownloading, setIsDownloading] = useState(false)
  const params = useParams()
  
  useEffect(() => {
    if (!params?.url) return
    const fullPath = (params.url as string[]).join('/')
    
    if (fullPath) {
      setIsDownloading(true)
      // Send the full path to our API
      fetch(`/api/download/${fullPath}`)
        .then(response => {
          if (!response.ok) throw new Error('Download failed')
          return response.blob()
        })
        .then(blob => {
          const link = document.createElement('a')
          link.href = window.URL.createObjectURL(blob)
          // Extract format from the content-type header or default to mp3
          const format = 'mp3'
          link.download = `download.${format}`
          setTimeout(() => window.close(), 100);
        })
        .catch(error => {
          console.error('Download failed:', error)
          setIsDownloading(false)
        })
    }
  }, [params])

  return (
    <div className="flex items-center justify-center min-h-screen bg-black text-white">
      <h1 className="text-4xl font-bold">{isDownloading ? 'Downloading...' : 'hi :)'}</h1>
    </div>
  )
}

