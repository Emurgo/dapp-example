import React, {useState} from 'react'

const ResponsesPart = ({rawCurrentText, currentText, currentWaiterState}) => {
  const [isMessageDisplayed, setMessageDisplayed] = useState(false)
  const [isMessageDisplayedRaw, setMessageDisplayedRaw] = useState(false)

  const copyToClipboard = () => {
    navigator.clipboard.writeText(currentText).then(
      function () {
        console.log('Async: Copying the processed response to clipboard was successful!')
        setMessageDisplayed(true)
        hideMessage()
      },
      function (err) {
        console.error('Async: Could not copy text: ', err)
      },
    )
  }

  const copyRawToClipboard = () => {
    navigator.clipboard.writeText(rawCurrentText).then(
      function () {
        console.log('Async: Copying raw response to clipboard was successful!')
        setMessageDisplayedRaw(true)
        hideMessageRaw()
      },
      function (err) {
        console.error('Async: Could not copy raw response: ', err)
      },
    )
  }

  const hideMessage = () => {
    setTimeout(() => setMessageDisplayed(false), 3000)
  }

  const hideMessageRaw = () => {
    setTimeout(() => setMessageDisplayedRaw(false), 3000)
  }

  return (
    <div className="col-span-2 block p-3 sm:p-5 min-w-full rounded-lg border shadow-md bg-gray-900 border-gray-700">
      <div className="grid grid-rows-4 gap-2 h-full">
        <div>
          <div className="grid grid-rows-3 h-full">
            <div className="flex flex-wrap items-end justify-between gap-1">
              <span className="text-sm sm:text-base font-bold text-white">Raw response:</span>
              <div className="flex items-center gap-2">
                <label className="text-white font-medium text-sm">
                  {currentWaiterState ? 'Waiting for the response...' : ''}
                </label>
                <label className="text-green-600 font-medium text-sm">{isMessageDisplayedRaw ? 'Copied!' : ''}</label>
                <button
                  className="text-white font-medium rounded-lg text-sm px-3 sm:px-5 py-2.5 text-center bg-orange-700 hover:bg-orange-800 focus:ring-orange-900 active:ring-orange-600 disabled:opacity-50"
                  onClick={copyRawToClipboard}
                >
                  Copy
                </button>
              </div>
            </div>
            <div className="row-span-2">
              <textarea
                className="w-full h-full rounded bg-gray-700 text-gray-300 px-3 py-2"
                disabled
                readOnly
                value={rawCurrentText}
              />
            </div>
          </div>
        </div>
        <div className="row-span-3">
          <div className="grid grid-rows-5 h-full">
            <div className="flex flex-wrap items-end justify-between gap-1">
              <span className="text-sm sm:text-base font-bold text-white">Processed response:</span>
              <div className="flex items-center gap-2">
                <label className="text-white font-medium text-sm">
                  {currentWaiterState ? 'Waiting for the response...' : ''}
                </label>
                <label className="text-green-600 font-medium text-sm">{isMessageDisplayed ? 'Copied!' : ''}</label>
                <button
                  className="text-white font-medium rounded-lg text-sm px-3 sm:px-5 py-2.5 text-center bg-orange-700 hover:bg-orange-800 focus:ring-orange-900 active:ring-orange-600 disabled:opacity-50"
                  onClick={copyToClipboard}
                >
                  Copy
                </button>
              </div>
            </div>
            <div className="row-span-4">
              <textarea
                className="w-full h-full rounded bg-gray-700 text-gray-300 px-3 py-2"
                disabled
                readOnly
                value={currentText}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ResponsesPart
