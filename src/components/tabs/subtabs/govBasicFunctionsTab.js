import TabsComponent from '../tabsComponent'
import VoteDelegationPanel from '../../cards/govActions/voteDelegationPanel'
import {
  base32ToHex,
  getCslCredentialFromBech32,
  getCslCredentialFromHex,
  getCslCredentialFromScriptFromBech32,
  getCslCredentialFromScriptFromHex,
} from '../../../utils/cslTools'
import DRepRegistrationPanel from '../../cards/govActions/dRepRegistrationPanel'
import DRepUpdatePanel from '../../cards/govActions/dRepUpdatePanel'
import DRepRetirementPanel from '../../cards/govActions/dRepRetirementPanel'
import VotePanel from '../../cards/govActions/votePanel'
import RegisterStakeKeyPanel from '../../cards/govActions/regStakeKeyPanel'
import UnregisterStakeKeyPanel from '../../cards/govActions/unregStakeKeyPanel'

const GovBasicFunctionsTab = ({api, onWaiting, onError, getters, setters}) => {
  const handleInputCreds = (input) => {
    try {
      return getCslCredentialFromHex(input)
    } catch (err1) {
      try {
        return getCslCredentialFromBech32(input)
      } catch (err2) {
        onWaiting(false)
        console.error(
          `Error in parsing credential, not Hex or Bech32: ${JSON.stringify(err1)}, ${JSON.stringify(err2)}`,
        )
        onError()
        return null
      }
    }
  }

  /**
   *
   * @param {string} bechID
   * @returns {boolean}
   */
  const isValidDRepID = (bechID) => {
    // DRep ID regex pattern
    // they start with drep1 (at length of 56 or 58) or drep_script1 (at length of 63)
    const drepIDPattern = /^(drep1[a-zA-Z0-9]{51,53}|drep_script1[a-zA-Z0-9]{51})$/
    return drepIDPattern.test(bechID)
  }

  /**
   *
   * @param {string} dRepHex
   * @returns {boolean}
   */
  const isPotentiallyValidHex = (dRepHex) => /^(22|23)[0-9a-fA-F]{56}$/.test(dRepHex)

  /**
   *
   * @param {string} hexID
   * @returns {boolean}
   */
  const isHexIDCIP105 = (hexID) => {
    // Use the length of the hex ID to determine if CIP-105 or CIP-129?
    // if length is 56 then CIP-105, if 58 then CIP-129
    if (hexID.length === 56) {
      return true
    } else if (hexID.length === 58) {
      return false
    }
    throw new Error('Invalid hex encoded DRep ID length. Must be 56 or 58 characters.')
  }

  /**
   *
   * @param {string} bech32
   * @param {boolean} isCIP105
   * @returns {boolean}
   */
  const isBechIDScriptBased = (bech32, isCIP105) => {
    const hexEncodedID = base32ToHex(bech32)
    if (bech32.startsWith('drep_script1')) {
      return true
      // if CIP-129 and 23 then its script-based
    } else if (!isCIP105 && hexEncodedID.startsWith('23')) {
      return true
      // else is CIP105 key-based OR is CIP-129 and 22 then its key-based
    } else {
      return false
    }
  }

  /**
   *
   * @param {string} bechEncodedID
   */
  const handleDrepId = (bechEncodedID) => {
    if (!isValidDRepID(bechEncodedID) && !isPotentiallyValidHex(bechEncodedID)) {
      console.error(`The value "${bechEncodedID}" is not valid dRepID`)
      onError()
      return
    }

    if (isValidDRepID(bechEncodedID)) {
      const hexEncodedID = base32ToHex(bechEncodedID)
      const isCIP105 = isHexIDCIP105(hexEncodedID)
      const isScriptBased = isBechIDScriptBased(bechEncodedID, isCIP105)

      if (isCIP105) {
        return isScriptBased
          ? getCslCredentialFromScriptFromBech32(bechEncodedID)
          : getCslCredentialFromBech32(bechEncodedID)
      }
      return handleDrepId(hexEncodedID)
    }
    if (isPotentiallyValidHex(bechEncodedID)) {
      const hexEncodedID = bechEncodedID
      const isCIP105 = isHexIDCIP105(hexEncodedID)
      const isScriptBased = !isCIP105 && hexEncodedID.startsWith('23')
      return isScriptBased
        ? getCslCredentialFromScriptFromHex(hexEncodedID.slice(2))
        : getCslCredentialFromHex(hexEncodedID.slice(2))
    }
  }

  const panelsProps = {
    api,
    onWaiting,
    onError,
    getters,
    setters,
    handleInputCreds,
    handleDrepId,
  }

  const data = [
    {
      label: 'Vote Delegation',
      value: 'voteDeleg',
      children: <VoteDelegationPanel {...panelsProps} />,
    },
    {
      label: 'DRep Registration',
      value: 'drepReg',
      children: <DRepRegistrationPanel {...panelsProps} />,
    },
    {
      label: 'DRep Update',
      value: 'drepUpdate',
      children: <DRepUpdatePanel {...panelsProps} />,
    },
    {
      label: 'DRep Retirement',
      value: 'drepRet',
      children: <DRepRetirementPanel {...panelsProps} />,
    },
    {
      label: 'Vote',
      value: 'vote',
      children: <VotePanel {...panelsProps} />,
    },
    {
      label: 'Register Stake Key',
      value: 'regStakeKey',
      children: <RegisterStakeKeyPanel {...panelsProps} />,
    },
    {
      label: 'Unregister Stake Key',
      value: 'unregStakeKey',
      children: <UnregisterStakeKeyPanel {...panelsProps} />,
    },
  ]

  return (
    <div className="mt-2">
      <TabsComponent tabsData={data} />
    </div>
  )
}

export default GovBasicFunctionsTab
