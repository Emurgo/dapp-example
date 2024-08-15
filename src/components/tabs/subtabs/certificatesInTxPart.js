import React from 'react'
import {useCollapse} from 'react-collapsed'
import ExpandablePanel from '../../expandablePanel'

const CertificatesInTxPart = ({getters}) => {
  const {getCollapseProps, getToggleProps, isExpanded} = useCollapse()
  const {certsInTx, votesInTx} = getters
  const amountOfCertsAndVotesInTx = () => certsInTx.length + votesInTx.length
  const getAllInOne = () => {
    const resultArray = []
    for (const certInTx of certsInTx) {
      const certPartWithName = certInTx.split('\n')[1]
      const cleanCertName = certPartWithName.split('"')[1]
      const certJsonObject = JSON.parse(certInTx)
      resultArray.push([cleanCertName, certJsonObject])
    }
    for (const voteInTx of votesInTx) {
      const votePartWithName = voteInTx.split('\n')[1]
      const cleanVoteName = votePartWithName.split('"')[1]
      const voteJsonObject = JSON.parse(voteInTx)
      resultArray.push([cleanVoteName, voteJsonObject])
    }
    return resultArray
  }

  return (
    <div className="border rounded-md bg-gray-700 border-gray-700 px-5 py-2 mt-5">
      <div {...getToggleProps()}>
        <div>
          <span className="text-m">
            Certtificates in Tx {`(${amountOfCertsAndVotesInTx()})`}&nbsp;
            {isExpanded ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="inline align-text-bottom feather feather-arrow-down"
              >
                <line x1="8" y1="3" x2="8" y2="12"></line>
                <polyline points="13 8 8 12 3 8"></polyline>
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="inline align-text-bottom feather feather-arrow-up"
              >
                <line x1="8" y1="3" x2="8" y2="13"></line>
                <polyline points="3 8 8 3 13 8"></polyline>
              </svg>
            )}
          </span>
        </div>
      </div>
      <div {...getCollapseProps()}>
        <div>
          {getAllInOne().map((certInfo) => (
            <ExpandablePanel
              title={'-> ' + certInfo[0]}
              innerInfo={JSON.stringify(certInfo[1], null, 4)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default CertificatesInTxPart
