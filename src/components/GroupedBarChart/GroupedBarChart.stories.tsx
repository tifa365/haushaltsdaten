// import { TOTAL_EXPENSES } from '@data/totalExpenses'
import { Story, Meta } from '@storybook/react'

import { GroupedBarChart } from '.'

export default {
  title: 'UI Elements/GroupedBarChart',
  component: GroupedBarChart,
} as Meta

// Temporarily disabled - needs Leipzig data
const Template: Story = () => <GroupedBarChart data={[]} />

export const Default = Template.bind({})
Default.args = {}
