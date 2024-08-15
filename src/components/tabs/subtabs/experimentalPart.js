import React from 'react'
import AuthCard from '../../cards/authCard'
import ListNFTsCard from '../../cards/listNFTsCard'
import ExpandablePanel from '../../expandablePanel'
import {iconCollapsed24, iconExpanded24} from '../../ui-constants'

const ExperimentalPart = ({api, onRawResponse, onResponse, onWaiting}) => {
  const panelStyles = 'border rounded bg-gray-700 border-gray-700 p-5 mt-5'
  const panelTitleStyles = 'text-2xl'
  return (
    <ExpandablePanel
      title="Experimental"
      generalPanelStyles={panelStyles}
      titleStyles={panelTitleStyles}
      collapsedIcon={iconCollapsed24}
      expandedIcon={iconExpanded24}
    >
      <div className="grid justify-items-stretch grid-cols-1 lg:grid-cols-3 gap-2 pt-3">
        <div>
          <AuthCard api={api} onRawResponse={onRawResponse} onResponse={onResponse} onWaiting={onWaiting} />
        </div>
        <div>
          <ListNFTsCard api={api} onRawResponse={onRawResponse} onResponse={onResponse} onWaiting={onWaiting} />
        </div>
      </div>
    </ExpandablePanel>
  )
}

export default ExperimentalPart
