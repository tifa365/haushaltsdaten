import { TreeMapWithData } from '@components/TreeMap/withData'
import { mapRawQueryToState, ParsedPageQueryType } from '@lib/utils/queryUtil'
import { GetServerSideProps } from 'next'
import { FC } from 'react'
import useDimensions from 'react-cool-dimensions'
import { DEFAULT_YEAR, isValidYear } from '@lib/utils/yearValidator'
import fs from 'fs'
import path from 'path'

interface TreemapNode {
  id: string
  name: string
  value?: number
  color?: string
  children?: TreemapNode[]
}

interface SharePageProps {
  query: Partial<ParsedPageQueryType>
  queriedYear: number
  queriedPolicyArea: string | null
  hierarchyData: TreemapNode
}

// const ALL_POLICY_AREAS = 'all'

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const parsedQuery = query ? mapRawQueryToState(query) : {}

  const queriedPolicyArea =
    parsedQuery && parsedQuery.district && !Array.isArray(parsedQuery.district)
      ? parsedQuery.district
      : null

  const queriedYear = parsedQuery.year

  // Load static JSON data from filesystem (server-side)
  const dataDir = path.join(process.cwd(), 'public', 'data')
  const year = queriedYear && isValidYear(queriedYear) ? queriedYear : DEFAULT_YEAR

  try {
    // Load treemap data
    const treemapPath = path.join(dataDir, `${year}`, 'treemap.json')
    const treemapData = JSON.parse(fs.readFileSync(treemapPath, 'utf-8'))

    return {
      props: {
        title: 'Visualisierung',
        query,
        queriedYear: year,
        queriedPolicyArea: queriedPolicyArea,
        hierarchyData: treemapData,
      },
    }
  } catch (error) {
    console.error('Error loading static data:', error)
    throw new Error(
      `Failed to load data for year ${year}. Make sure to run: npm run data:build`
    )
  }
}

export const SharePage: FC<SharePageProps> = ({ hierarchyData }) => {
  const { observe, width, height } = useDimensions()

  return (
    <>
      <div className="w-full h-screen overflow-hidden" ref={observe}>
        {hierarchyData && width && height && (
          <TreeMapWithData
            hierarchy={hierarchyData}
            width={width}
            height={height}
          />
        )}
      </div>
    </>
  )
}

export default SharePage
