import {render, screen, fireEvent} from '@testing-library/react'
import {useState} from 'react'
import TabsComponent from './tabsComponent'

jest.mock('@material-tailwind/react', () => ({
  Tabs: ({children}) => <div>{children}</div>,
  TabsHeader: ({children}) => <div>{children}</div>,
  Tab: ({children, onClick}) => (
    <button type="button" onClick={onClick}>
      {children}
    </button>
  ),
}))

const Harness = ({tabsData}) => {
  const [tabs, setTabs] = useState(tabsData)
  return (
    <div>
      <button type="button" onClick={() => setTabs(tabs.filter((tab) => tab.value !== 'cip95'))}>
        Hide CIP-95
      </button>
      <TabsComponent tabsData={tabs} />
    </div>
  )
}

describe('TabsComponent', () => {
  it('falls back to the first remaining tab when the active tab is removed', () => {
    render(
      <Harness
        tabsData={[
          {label: 'CIP-30', value: 'cip30', children: <div>cip30 panel</div>},
          {label: 'CIP-95', value: 'cip95', children: <div>cip95 panel</div>},
        ]}
      />,
    )

    fireEvent.click(screen.getByRole('button', {name: 'CIP-95'}))
    expect(screen.getByText('cip95 panel')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', {name: 'Hide CIP-95'}))
    expect(screen.queryByText('cip95 panel')).not.toBeInTheDocument()
    expect(screen.getByText('cip30 panel')).toBeInTheDocument()
  })
})
