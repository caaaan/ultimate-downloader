import { NextRequest, NextResponse } from 'next/server'
import ytdl from 'ytdl-core'
import scdl from 'soundcloud-downloader'
import SpotifyWebApi from 'spotify-web-api-node'

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
})

export async function GET(
  request: NextRequest,
  { params }: { params: { url: string[] } }
) {
  try {
    // Join the URL segments back together
    const fullPath = params.url.join('/')
    // The last segment might be the format
    const urlParts = fullPath.split('/')
    const format = urlParts[urlParts.length - 1]
    
    // Check if the last part is a format specification
    const isFormat = ['mp3', 'mp4', 'wav'].includes(format)
    
    // Get the actual URL (everything except the format if present)
    const url = isFormat 
      ? urlParts.slice(0, -1).join('/')
      : fullPath
    
    // Use the specified format or default to mp3
    const outputFormat = isFormat ? format : 'mp3'

    let stream
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      stream = ytdl(url, {
        filter: outputFormat === 'mp3' ? 'audioonly' : 'audioandvideo'
      })
    } else if (url.includes('soundcloud.com')) {
      stream = await scdl.download(url)
    } else if (url.includes('spotify.com')) {
      const trackId = url.split('/').pop()
      await spotifyApi.clientCredentialsGrant()
      const { body } = await spotifyApi.getTrack(trackId!)
      return NextResponse.json(
        { error: 'Spotify downloads are not supported' },
        { status: 400 }
      )
    } else {
      return NextResponse.json(
        { error: 'Unsupported URL' },
        { status: 400 }
      )
    }

    // Set appropriate headers for the download
    const headers = new Headers()
    headers.set('Content-Disposition', `attachment; filename="download.${outputFormat}"`)
    headers.set('Content-Type', `audio/${outputFormat}`)

    return new NextResponse(stream as any, { headers })
  } catch (error) {
    console.error('Download error:', error)
    return NextResponse.json(
      { error: 'Download failed' },
      { status: 500 }
    )
  }
}

