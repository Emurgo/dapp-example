import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App'
import {YoroiProvider} from './hooks/yoroiProvider'
import {NetworkProvider} from './hooks/networkProvider'
import {EthereumProvider} from './hooks/ethereumProvider'
import {BitcoinProvider} from './hooks/bitcoinProvider'
import {BrowserRouter, Route, Routes} from 'react-router-dom'

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(
  <React.StrictMode>
    <NetworkProvider>
      <YoroiProvider>
        <EthereumProvider>
          <BitcoinProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/*" element={<App />} />
            </Routes>
          </BrowserRouter>
          </BitcoinProvider>
        </EthereumProvider>
      </YoroiProvider>
    </NetworkProvider>
  </React.StrictMode>,
)
