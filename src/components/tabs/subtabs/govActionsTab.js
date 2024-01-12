import React from 'react'
import TabsComponent from '../tabsComponent'

const GovActionsTab = () => {
  const data = [
    {
      label: 'Motion of no-confidence',
      value: 'motionNoConfidence',
      children: <></>,
    },
    {
      label: 'Update Cons. Committe',
      value: 'updConsComm',
      children: <></>,
    },
    {
      label: 'Update Constitution',
      value: 'updConstitution',
      children: <></>,
    },
    {
      label: 'Hard-Fork Initation',
      value: 'hfInit',
      children: <></>,
    },
    {
      label: 'Treasury Withdrawal',
      value: 'treasuryWithdrawal',
      children: <></>,
    },
    {
      label: 'Info Action',
      value: 'infoAct',
      children: <></>,
    },
  ]

  return (
    <div className="mt-2">
      <TabsComponent tabsData={data} />
    </div>
  )
}

export default GovActionsTab
