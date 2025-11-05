import { TreemapHierarchyType, TopicDepth } from '../../types/treemap'
// import { TopicType } from 'pages/visualisierung'
import { FC } from 'react'
import { TreeMap } from '.'

interface TreeMapWithDataPropType {
  hierarchy: TreemapHierarchyType
  width: number
  height: number
  onChangeLevel?: (level: {
    topicLabel?: string
    topicDepth?: TopicDepth
  }) => void
}

export const TreeMapWithData: FC<TreeMapWithDataPropType> = ({
  hierarchy,
  width,
  height,
  onChangeLevel = () => undefined,
}) => {
  return (
    <TreeMap
      width={width}
      height={height}
      hierarchy={hierarchy}
      onChangeLevel={(level) => onChangeLevel(level)}
    />
  )
}
