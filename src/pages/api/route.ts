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
  { params }: { params: { slug: string[] } }
) {
  const [encodedUrl, format = 'mp3'] = params.slug
  const url = decodeURIComponent(encodedUrl)

  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 })
  }

  try {
    let stream

    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      stream = ytdl(url, { filter: format === 'mp3' ? 'audioonly' : 'audioandvideo' })
    } else if (url.includes('soundcloud.com')) {
      const trackInfo = await scdl.getInfo(url)
      stream = await scdl.download(url)
    } else if (url.includes('spotify.com')) {
      const trackId = url.split('/').pop()
      await spotifyApi.clientCredentialsGrant()
      const { body } = await spotifyApi.getTrack(trackId!)
      // Note: Spotify doesn't allow direct downloads, so we'd need to use a different service or approach here
      return NextResponse.json({ error: 'Spotify downloads are not supported' }, { status: 400 })
    } else {
      return NextResponse.json({ error: 'Unsupported URL' }, { status: 400 })
    }

    // Set appropriate headers for the download
    const headers = new Headers()
    headers.set('Content-Disposition', `attachment; filename="download.${format}"`)
    headers.set('Content-Type', `audio/${format}`)

    return new NextResponse(stream as any, { headers })
  } catch (error) {
    console.error('Download error:', error)
    return NextResponse.json({ error: 'Download failed' }, { status: 500 })
  }
}

