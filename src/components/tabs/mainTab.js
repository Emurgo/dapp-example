const MainTab = (props) => {
  const {isWalletConnected, isNotCardanoWallet} = props

  const walletConnectionMessage = () => {
    if (!isWalletConnected) {
      if (isNotCardanoWallet) {
        return (
          <div className="text-m font-bold tracking-tight text-white">
            <label>Cardano wallet is not found</label>
          </div>
        )
      } else {
        return (
          <div className="text-m font-bold tracking-tight text-white">
            <label>Wallet is not connected</label>
          </div>
        )
      }
    }
  }

  return (
    <>
      <div className="bg-gray-900 grid justify-items-center pt-5">{walletConnectionMessage()}</div>
    </>
  )
}

export default MainTab
