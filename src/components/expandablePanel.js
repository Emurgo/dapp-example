import React from 'react'
import {useCollapse} from 'react-collapsed'

const ExpandablePanel = (props) => {
  const {getCollapseProps, getToggleProps, isExpanded} = useCollapse()
  const {title, generalPanelStyles, titleStyles, collapsedIcon, expandedIcon, children} = props

  const getExpandedIcon = () => (expandedIcon != null && expandedIcon !== undefined ? expandedIcon : <></>)
  const getCollapsedIcon = () => (collapsedIcon != null && collapsedIcon !== undefined ? collapsedIcon : <></>)

  return (
    <div className={generalPanelStyles} key={`expandablePanel`}>
      <div {...getToggleProps()}>
        <div>
          <span className={titleStyles}>
            {title}&nbsp;
            {isExpanded ? getExpandedIcon() : getCollapsedIcon()}
          </span>
        </div>
      </div>
      <div {...getCollapseProps()}>{children}</div>
    </div>
  )
}

export default ExpandablePanel
