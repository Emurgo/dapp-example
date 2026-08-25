import React, {useState} from 'react'
import {Tabs, TabsHeader, Tab} from '@material-tailwind/react'

const TabsComponent = ({tabsData}) => {
  const [activeTab, setActiveTab] = useState(tabsData[0].value)
  const safeActiveTab = tabsData.some((tab) => tab.value === activeTab) ? activeTab : tabsData[0]?.value
  const activeTabData = tabsData.find((tab) => tab.value === safeActiveTab)

  return (
    <Tabs value={safeActiveTab}>
      <TabsHeader className="rounded-none border-b-2 border-gray-700 bg-transparent p-0 overflow-x-auto">
        {tabsData.map(({label, value}) => (
          <Tab
            key={value}
            value={value}
            className={
              safeActiveTab === value
                ? 'bg-orange-700 text-white rounded-t-lg whitespace-nowrap'
                : 'text-gray-300 border-x border-gray-700 whitespace-nowrap'
            }
            onClick={() => setActiveTab(value)}
          >
            {label}
          </Tab>
        ))}
      </TabsHeader>
      {/* Render only the active tab's content. Material Tailwind's <TabsBody>/
          <TabPanel> keep inactive panels mounted and absolutely positioned; with
          no positioned ancestor they collapse to the top-left of the viewport and
          overlay the page (e.g. the network toggle), swallowing its clicks. */}
      <div className="text-gray-300">{activeTabData?.children}</div>
    </Tabs>
  )
}

export default TabsComponent
