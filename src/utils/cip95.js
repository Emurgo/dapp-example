export const CIP95 = 95

export const walletSupportsCip95 = (wallet) => {
  if (!Array.isArray(wallet?.supportedExtensions)) {
    return false
  }
  return wallet.supportedExtensions.some((extension) => Number(extension?.cip) === CIP95)
}

export const buildEnableOptions = ({requestIdentification, silent, wallet}) => {
  const options = {
    requestIdentification,
    onlySilent: silent,
  }
  if (walletSupportsCip95(wallet)) {
    options.extensions = [{cip: CIP95}]
  }
  return options
}

export const isCip95Api = (api) => Boolean(api?.cip95)

export const CIP95_TAB_VALUES = ['cip95', 'cip95Tools']

export const isCip95Tab = (tabValue) => CIP95_TAB_VALUES.includes(tabValue)
