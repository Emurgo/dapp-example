import React from 'react'
import ExpandablePanel from '../../expandablePanel'
import {iconCollapsed16, iconExpanded16} from '../../ui-constants'

const CertificatesInTxPart = ({getters}) => {
  const {certsInTx, votesInTx} = getters
  let amountOfVotesInTx = 0
  if (votesInTx) {
    amountOfVotesInTx = JSON.parse(votesInTx).length
  }
  const amountOfCertsAndVotesInTx = () => certsInTx.length + amountOfVotesInTx
  const getAllInOne = () => {
    const resultArray = []
    for (const certInTx of certsInTx) {
      const certPartWithName = certInTx.split('\n')[1]
      const cleanCertName = certPartWithName.split('"')[1]
      const certJsonObject = JSON.parse(certInTx)
      resultArray.push([cleanCertName, certJsonObject])
    }
    if (votesInTx) {
      const voteJsonObjects = JSON.parse(votesInTx)
      console.log('voteJsonObjects', voteJsonObjects)
      for (const voteJsonObject of voteJsonObjects) {
        resultArray.push(['Votes', voteJsonObject])
      }
    }
    return resultArray
  }
  const mainPanelStyles = 'border rounded-md bg-gray-700 border-gray-700 px-5 py-2 mt-5'
  const mainPanelTitleStyles = 'text-m'
  const nestedPanelsStyles = 'border rounded-md bg-gray-700 border-gray-700 py-2 w-full'
  const nestedPanelsTitleStyles = 'text-m'

  return (
    <ExpandablePanel
      title={`Certificates and Votes in Tx ( ${amountOfCertsAndVotesInTx()} )`}
      generalPanelStyles={mainPanelStyles}
      titleStyles={mainPanelTitleStyles}
      collapsedIcon={iconCollapsed16}
      expandedIcon={iconExpanded16}
    >
      <div>
        {getAllInOne().map((certInfo) => (
          <ExpandablePanel
            title={'-> ' + certInfo[0]}
            generalPanelStyles={nestedPanelsStyles}
            titleStyles={nestedPanelsTitleStyles}
            collapsedIcon={iconCollapsed16}
            expandedIcon={iconExpanded16}
          >
            <div className="pt-1">
              <textarea
                className="w-full h-64 rounded bg-gray-900 text-white px-2 readonly"
                readOnly
                value={JSON.stringify(certInfo[1], null, 4)}
              ></textarea>
            </div>
          </ExpandablePanel>
        ))}
      </div>
    </ExpandablePanel>
  )
}

export default CertificatesInTxPart
