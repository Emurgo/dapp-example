import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App'
import {CardanoProvider} from './hooks/cardanoProvider'
import {NetworkProvider} from './hooks/networkProvider'
import {EthereumProvider} from './hooks/ethereumProvider'
import {BitcoinProvider} from './hooks/bitcoinProvider'
import {BrowserRouter, Route, Routes} from 'react-router-dom'

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(
  <React.StrictMode>
    <NetworkProvider>
      <CardanoProvider>
        <EthereumProvider>
          <BitcoinProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/*" element={<App />} />
              </Routes>
            </BrowserRouter>
          </BitcoinProvider>
        </EthereumProvider>
      </CardanoProvider>
    </NetworkProvider>
  </React.StrictMode>,
)
