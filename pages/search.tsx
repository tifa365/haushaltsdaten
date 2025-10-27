import { GetStaticProps } from 'next'
import { FC } from 'react'
import { InternalLink } from '@components/InternalLink'

// eslint-disable-next-line @typescript-eslint/require-await
export const getStaticProps: GetStaticProps = async () => ({
  props: {
    title: 'Suche',
  },
})

const SearchPage: FC = () => {
  return (
    <div className="px-8">
      <div className="md:w-4/5 m-auto mt-12 md:mt-20">
        <h1 className="font-bold text-2xl md:text-3xl lg:text-4xl lg:ml-28">
          Suchfunktion
        </h1>
        <div className="lg:w-3/6 m-auto mt-6 md:mt-16">
          <div className="flex-col mt-6">
            <p className="mb-4">
              Die Textsuche für Leipzig Haushaltsdaten ist derzeit nicht
              verfügbar.
            </p>
            <p className="mb-4">
              Sie können die Haushaltsdaten über die{' '}
              <InternalLink href="/visualisierung" className="text-brand">
                interaktive Visualisierung
              </InternalLink>{' '}
              erkunden. Nutzen Sie die Filterfunktionen, um nach
              Politikbereichen zu suchen und durch die Produktebenen zu
              navigieren.
            </p>
            <div className="mt-8">
              <InternalLink
                href="/visualisierung"
                className="inline-block px-6 py-3 bg-brand text-white rounded hover:opacity-80 transition-opacity"
              >
                → Zur Visualisierung
              </InternalLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SearchPage
