import { ListItem } from '@components/ListItem'
// import snakeCase from 'just-snake-case'
import { TreeMapWithData } from '@components/TreeMap/withData'
import { mapRawQueryToState, ParsedPageQueryType } from '@lib/utils/queryUtil'
import { GetServerSideProps } from 'next'
import { FC, useState, useEffect } from 'react'
import useDimensions from 'react-cool-dimensions'
import { TreeMapControls } from '@components/TreeMapControls'
import classNames from 'classnames'
import { policyAreas } from '@data/policyAreas'
import { getColorByMainTopic } from '@components/TreeMap/colors'
import { useRouter } from 'next/router'
import { EmbeddPopup } from '@components/EmbeddPopup'
import { DEFAULT_YEAR, isValidYear } from '@lib/utils/yearValidator'
import { Button } from '@components/Button'
import fs from 'fs'
import path from 'path'

// Type definitions for Leipzig budget data
interface TreemapNode {
  id: string
  name: string
  value?: number
  color?: string
  children?: TreemapNode[]
}

interface BudgetItem {
  id: string
  title: string
  amount: number
  policyArea: string
  policyAreaName: string
  productCode: string
  amt: string
}

interface VisualizationProps {
  query: Partial<ParsedPageQueryType>
  queriedYear: number
  queriedPolicyArea: string | null
  hierarchyData: TreemapNode
  initialListData: BudgetItem[]
}

const ALL_POLICY_AREAS = 'all'
const MAX_ROWS = 100

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

    // Load list data
    const listPath = path.join(dataDir, `${year}`, 'list.json')
    const listData = JSON.parse(fs.readFileSync(listPath, 'utf-8'))

    // Filter by policy area if specified
    let filteredListData = listData
    if (queriedPolicyArea && queriedPolicyArea !== ALL_POLICY_AREAS) {
      filteredListData = listData.filter(
        (item: BudgetItem) => item.policyArea === queriedPolicyArea
      )
    }

    // Sort by amount and take top items
    const initialListData = filteredListData
      .sort((a: BudgetItem, b: BudgetItem) => b.amount - a.amount)
      .slice(0, MAX_ROWS)

    return {
      props: {
        title: 'Visualisierung',
        query,
        queriedYear: year,
        queriedPolicyArea: queriedPolicyArea,
        hierarchyData: treemapData,
        initialListData: initialListData,
      },
    }
  } catch (error) {
    console.error('Error loading static data:', error)
    throw new Error(
      `Failed to load data for year ${year}. Make sure to run: npm run data:build`
    )
  }
}

export const Visualization: FC<VisualizationProps> = ({
  queriedYear,
  queriedPolicyArea,
  hierarchyData,
  initialListData,
}) => {
  const { observe, width, height } = useDimensions()
  const { push, pathname } = useRouter()

  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [listData, setListData] = useState<BudgetItem[]>(initialListData)
  const [visibleRows, setVisibleRows] = useState<number>(MAX_ROWS)
  const [isLoading, setIsLoading] = useState(false)

  const loadMoreRows = (): void => {
    const rowsToAdd = 10
    setVisibleRows(
      visibleRows + rowsToAdd >= listData.length
        ? listData.length
        : visibleRows + rowsToAdd
    )
  }

  // Load filtered data when policy area changes
  useEffect(() => {
    const loadFilteredData = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`/data/${queriedYear}/list.json`)
        const allData = await response.json()

        let filtered = allData
        if (queriedPolicyArea && queriedPolicyArea !== ALL_POLICY_AREAS) {
          filtered = allData.filter(
            (item: BudgetItem) => item.policyArea === queriedPolicyArea
          )
        }

        // Filter by selected node if any
        if (selectedNode && selectedNode !== 'root') {
          filtered = filtered.filter((item: BudgetItem) => {
            // Match by policy area ID or product code
            return (
              item.policyArea === selectedNode ||
              item.productCode === selectedNode ||
              item.productCode.startsWith(selectedNode)
            )
          })
        }

        const sorted = filtered.sort(
          (a: BudgetItem, b: BudgetItem) => b.amount - a.amount
        )
        setListData(sorted)
        setVisibleRows(Math.min(MAX_ROWS, sorted.length))
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    void loadFilteredData()
  }, [queriedPolicyArea, queriedYear, selectedNode])

  return (
    <>
      <div className="min-h-screen pb-12">
        <div
          className={classNames(
            'w-full',
            'sticky top-0',
            'px-4 py-5 sm:py-4',
            'bg-white',
            'border-b border-gray-200 shadow-sm',
            'z-10'
          )}
        >
          <div
            className={classNames(
              'container mx-auto',
              'flex justify-between items-center'
            )}
          >
            <div className="w-full z-10">
              <TreeMapControls
                district={(queriedPolicyArea || ALL_POLICY_AREAS) as string}
                onChange={(newQuery) => {
                  // Clear selected node when filters change
                  setSelectedNode(null)

                  void push({ pathname, query: newQuery }, undefined, {
                    shallow: false,
                  })
                }}
              />
            </div>
            <div className="hidden lg:inline-flex">
              <EmbeddPopup />
            </div>
          </div>
        </div>
        <div className="px-4 mt-6">
          <div
            className="container mx-auto w-full h-[80vh] overflow-hidden"
            ref={observe}
          >
            {hierarchyData && width && height && (
              <TreeMapWithData
                hierarchy={hierarchyData}
                width={width}
                height={height}
                onChangeLevel={(level: { topicLabel?: string }) => {
                  setSelectedNode(level.topicLabel || null)
                }}
              />
            )}
          </div>
          <div className="container mx-auto mt-4 flex justify-end lg:hidden">
            <EmbeddPopup />
          </div>
          <div className="container mx-auto">
            <h2 className="mb-6 mt-12 px-4 font-bold text-2xl">
              Höchste Ausgaben
              {queriedPolicyArea &&
                queriedPolicyArea !== ALL_POLICY_AREAS &&
                ` – ${policyAreas[queriedPolicyArea as keyof typeof policyAreas]}`}
            </h2>
            {isLoading ? (
              <div className="text-center py-12">Lädt...</div>
            ) : (
              <>
                <ul className="flex flex-col gap-4">
                  {listData
                    .slice(0, visibleRows)
                    .map((item) => (
                      <ListItem
                        key={item.id}
                        title={item.title}
                        id={item.id}
                        group={item.policyAreaName}
                        groupColor={getColorByMainTopic(item.policyAreaName)}
                        district={item.amt}
                        price={item.amount}
                      />
                    ))}
                </ul>

                <div className="justify-center flex mt-8">
                  <Button
                    onClick={loadMoreRows}
                    disabled={visibleRows >= listData.length}
                  >
                    <span className="block">
                      Weitere Ausgaben anzeigen
                      <span className="font-normal text-xs block">
                        ({visibleRows}/{listData.length})
                      </span>
                    </span>
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default Visualization
