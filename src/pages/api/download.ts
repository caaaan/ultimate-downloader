
import { NextApiRequest, NextApiResponse } from 'next';

const downloadHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { url, format = "mp3" } = req.query;

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'URL is required' });
  }

  // Determine the source site
  let site;
  if (url.includes('youtube.com')) {
    site = 'YouTube';
  } else if (url.includes('soundcloud.com')) {
    site = 'SoundCloud';
  } else if (url.includes('spotify.com')) {
    site = 'Spotify';
  } else {
    return res.status(400).json({ error: 'Unsupported site' });
  }

  // Validate format
  const validFormats: string[] = ['mp3', 'mp4', 'wav'];
  const formatString = Array.isArray(format) ? format[0] : format; // Ensure format is a string
  if (!validFormats.includes(formatString)) {
    return res.status(400).json({ error: 'Invalid format' });
  }

  // Here you would add the logic to handle the download
  // For example, using a library to download and convert the media

  // Simulate download process
  res.setHeader('Content-Disposition', `attachment; filename="download.${format}"`);
  res.status(200).send(`Downloading from ${site} in ${format} format...`);

  // Close the tab (this is not possible directly from the server-side)
  // You would need to handle this on the client-side after the download starts
};

export default downloadHandler; 