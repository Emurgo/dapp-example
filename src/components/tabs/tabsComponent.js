import React, {useState} from 'react'
import {Tabs, TabsHeader, TabsBody, Tab, TabPanel} from '@material-tailwind/react'
import Cip30Tab from './subtabs/cip30Tab'
import Cip95Tab from './subtabs/cip95Tab'
import Cip95TabTools from './subtabs/cip95ToolsTab'
import NFTTab from './subtabs/NFTTab'

const TabsComponent = () => {
  const [activeTab, setActiveTab] = useState('cip30')
  const data = [
    {
      label: 'CIP-30',
      value: 'cip30',
      children: <Cip30Tab />,
    },
    {
      label: 'CIP-95',
      value: 'cip95',
      children: <Cip95Tab />,
    },
    {
      label: 'CIP-95 Tools',
      value: 'cip95Tools',
      children: <Cip95TabTools />,
    },
    {
      label: 'NFTs',
      value: 'nfts',
      children: <NFTTab />,
    },
  ]

  return (
    <Tabs value={activeTab}>
      <TabsHeader
        className="rounded-none border-b-2 border-gray-700 bg-transparent p-0"
      >
        {data.map(({label, value}) => (
          <Tab
            key={value}
            value={value}
            className={activeTab === value ? 'bg-orange-700 hover:bg-orange-800 text-white rounded-t-lg' : 'text-gray-300'}
            onClick={() => setActiveTab(value)}
        >
            {label}
          </Tab>
        ))}
      </TabsHeader>
      <TabsBody>
        {data.map(({value, children}) => (
          <TabPanel key={value} value={value} children={children} />
        ))}
      </TabsBody>
    </Tabs>
  )
}

export default TabsComponent
