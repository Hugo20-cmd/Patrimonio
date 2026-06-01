import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Patrimônio Plus',
    short_name: 'Patrimônio',
    description: 'Acompanhe seus investimentos e patrimônio.',
    start_url: '/',
    display: 'standalone',
    background_color: '#080810',
    theme_color: '#080810',
    icons: [
      {
        src: '/icon',
        sizes: 'any',
        type: 'image/png',
      },
      {
        src: '/apple-icon',
        sizes: 'any',
        type: 'image/png',
      },
    ],
  }
}
