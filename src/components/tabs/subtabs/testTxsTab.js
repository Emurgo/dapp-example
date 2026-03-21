import React, {useState, useEffect} from 'react'
import useYoroi from '../../../hooks/yoroiProvider'
import ResponsesPart from './responsesPart'
import CheckboxWithLabel from '../../checkboxWithLabel'
import ExpandablePanel from '../../expandablePanel'
import {iconCollapsed16, iconExpanded16} from '../../ui-constants'
import {CONNECTED} from '../../../utils/connectionStates'
import {buildTestTx, FEATURE_GROUPS, CREDENTIAL_FEATURES} from '../../../utils/testTxBuilder'

const CRED_MODE_LABELS = {wallet: 'W', key: 'K', script: 'S'}
const CRED_MODE_ORDER = ['wallet', 'key', 'script']

const defaultCredModes = () =>
  Object.fromEntries([...CREDENTIAL_FEATURES].map((f) => [f, 'key']))

const TestTxsTab = () => {
  const {api, connectionState} = useYoroi()
  const [enabledFeatures, setEnabledFeatures] = useState(new Set())
  const [credModes, setCredModes] = useState(defaultCredModes)
  const [walletRewardAddrHex, setWalletRewardAddrHex] = useState(null)
  const [walletChangeAddrHex, setWalletChangeAddrHex] = useState(null)
  const [networkId, setNetworkId] = useState(0)
  const [currentText, setCurrentText] = useState('')
  const [rawCurrentText, setRawCurrentText] = useState('')
  const [waiterState, setWaiterState] = useState(false)

  // Fetch wallet addresses when API becomes available
  useEffect(() => {
    if (!api) return
    api
      .getRewardAddresses()
      .then((addrs) => {
        if (addrs && addrs.length > 0) setWalletRewardAddrHex(addrs[0])
      })
      .catch(console.error)
    api
      .getChangeAddress()
      .then((addr) => setWalletChangeAddrHex(addr))
      .catch(console.error)
    api
      .getNetworkId()
      .then((id) => setNetworkId(id))
      .catch(console.error)
  }, [api])

  const toggleFeature = (key) => {
    setEnabledFeatures((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const cycleCredMode = (feat) => {
    setCredModes((prev) => {
      const cur = prev[feat]
      const next = CRED_MODE_ORDER[(CRED_MODE_ORDER.indexOf(cur) + 1) % CRED_MODE_ORDER.length]
      return {...prev, [feat]: next}
    })
  }

  const handleBuild = () => {
    if (!walletChangeAddrHex) {
      setCurrentText('Error: wallet change address not loaded yet')
      setRawCurrentText('')
      return
    }
    setWaiterState(true)
    try {
      const {txHex, txBodyHex} = buildTestTx(
        enabledFeatures,
        credModes,
        walletRewardAddrHex,
        walletChangeAddrHex,
        networkId,
      )
      setRawCurrentText(txHex)
      setCurrentText(JSON.stringify({txBodyHex, txHex}, undefined, 2))
    } catch (e) {
      setRawCurrentText('')
      setCurrentText(`Build error: ${e.message ?? String(e)}`)
    }
    setWaiterState(false)
  }

  const handleSign = async () => {
    if (!walletChangeAddrHex) {
      setCurrentText('Error: wallet change address not loaded yet')
      setRawCurrentText('')
      return
    }
    setWaiterState(true)
    try {
      const {txHex} = buildTestTx(
        enabledFeatures,
        credModes,
        walletRewardAddrHex,
        walletChangeAddrHex,
        networkId,
      )
      const witnessHex = await api.signTx(txHex, true)
      setRawCurrentText(witnessHex)
      setCurrentText(witnessHex)
    } catch (e) {
      setRawCurrentText('')
      setCurrentText(`Sign error: ${e.message ?? JSON.stringify(e)}`)
      console.error(e)
    }
    setWaiterState(false)
  }

  return (
    <div className="py-5 px-5 text-gray-300">
      {connectionState === CONNECTED ? (
        <div className="flex flex-col gap-4">
          <div>
            {/* Info header */}
            <div className="rounded-lg border border-gray-600 bg-gray-700 px-4 py-3 mb-4">
              <p className="font-semibold text-gray-200 text-sm mb-1">Credential mode (W / K / S)</p>
              <p className="text-gray-400 text-xs mb-2">
                {'Shown next to cert/withdrawal features when enabled. Click to cycle: '}
                <span className="text-orange-400 font-bold">W</span>{' = wallet stake addr  '}
                <span className="text-orange-400 font-bold">K</span>{' = fake key hash  '}
                <span className="text-orange-400 font-bold">S</span>{' = fake script hash'}
              </p>
              {walletRewardAddrHex ? (
                <p className="text-gray-300 font-mono text-xs break-all">
                  <span className="text-gray-400">Wallet stake: </span>{walletRewardAddrHex}
                </p>
              ) : (
                <p className="text-gray-500 text-xs">Wallet stake address: not loaded</p>
              )}
            </div>

            {/* Collapsible feature groups */}
            {FEATURE_GROUPS.map((group) => {
              const selectedCount = group.features.filter((f) => enabledFeatures.has(f.key)).length
              const title = selectedCount > 0 ? `${group.label} (${selectedCount})` : group.label
              return (
                <ExpandablePanel
                  key={group.label}
                  title={title}
                  generalPanelStyles="border rounded-md bg-gray-700 border-gray-600 px-4 py-2 mb-2"
                  titleStyles="text-sm font-semibold text-gray-300 uppercase tracking-wider"
                  collapsedIcon={iconCollapsed16}
                  expandedIcon={iconExpanded16}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 pt-1">
                    {group.features.map((feat) => {
                      const isCredFeat = CREDENTIAL_FEATURES.has(feat.key)
                      const isEnabled = enabledFeatures.has(feat.key)
                      const mode = isCredFeat ? credModes[feat.key] ?? 'key' : null
                      return (
                        <div key={feat.key} className="flex items-center justify-between">
                          <CheckboxWithLabel
                            currentState={isEnabled}
                            onChangeFunc={() => toggleFeature(feat.key)}
                            name={feat.key}
                            labelText={feat.label}
                          />
                          {isCredFeat && isEnabled && (
                            <button
                              onClick={() => cycleCredMode(feat.key)}
                              title="Cycle: W=wallet stake addr, K=fake key hash, S=fake script hash"
                              className="ml-2 px-2 py-0.5 text-xs rounded bg-orange-700 hover:bg-orange-600 active:bg-orange-500 text-white font-bold flex-shrink-0"
                            >
                              {CRED_MODE_LABELS[mode]}
                            </button>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </ExpandablePanel>
              )
            })}

            <div className="flex gap-2 mt-4">
              <button
                onClick={handleBuild}
                disabled={waiterState}
                className="flex-1 h-12 bg-gray-600 hover:bg-gray-500 active:bg-gray-400 disabled:bg-gray-800 rounded-lg text-white text-base"
              >
                Build Tx
              </button>
              <button
                onClick={handleSign}
                disabled={waiterState}
                className="flex-1 h-12 bg-orange-700 hover:bg-orange-800 active:bg-orange-500 disabled:bg-gray-800 rounded-lg text-white text-base"
              >
                Sign Tx
              </button>
            </div>
          </div>

          <ResponsesPart
            rawCurrentText={rawCurrentText}
            currentText={currentText}
            currentWaiterState={waiterState}
          />
        </div>
      ) : (
        <div />
      )}
    </div>
  )
}

export default TestTxsTab
