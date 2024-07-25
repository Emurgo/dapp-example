import React, {useState} from 'react'
import {Tabs, TabsHeader, TabsBody, Tab, TabPanel} from '@material-tailwind/react'

const TabsComponent = ({tabsData}) => {
  const [activeTab, setActiveTab] = useState(tabsData[0].value)

  return (
    <Tabs value={activeTab}>
      <TabsHeader className="rounded-none border-b-2 border-gray-700 bg-transparent p-0">
        {tabsData.map(({label, value}) => (
          <Tab
            key={value}
            value={value}
            className={
              activeTab === value ? 'bg-orange-700 text-white rounded-t-lg' : 'text-gray-300 border-x border-gray-700'
            }
            onClick={() => setActiveTab(value)}
          >
            {label}
          </Tab>
        ))}
      </TabsHeader>
      <TabsBody>
        {tabsData.map(({value, children}) => (
          <TabPanel key={value} value={value}>
            {activeTab === value ? children : <div></div>}
          </TabPanel>
        ))}
      </TabsBody>
    </Tabs>
  )
}

export default TabsComponent
