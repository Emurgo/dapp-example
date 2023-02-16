import React, { useState } from 'react';
import useYoroi from '../hooks/yoroiProvider';
import { textPartFromWalletChecksumImagePart } from '@emurgo/cip4-js';
import { IN_PROGRESS } from '../utils/connectionStates';

const AccessButton = () => {
  const { api, connect, authEnabled, connectionState } = useYoroi();
  const [isAuthChecked, setIsAuthChecked] = useState(false);

  const getWalletPlate = (apiObject, isAuthRequired, isAuthEnabled) => {
    let walletId = 'anonymous wallet';
    console.log(`[dApp][getWalletPlate] isAuthRequired - ${isAuthRequired}, isAuthEnabled - ${isAuthEnabled}`);
    if (isAuthRequired || isAuthEnabled) {
      const auth = apiObject.experimental.auth && apiObject.experimental.auth();
      walletId = auth.getWalletId();
      return textPartFromWalletChecksumImagePart(walletId);
    }
    return walletId;
  };

  const handleOnChange = () => {
    setIsAuthChecked(!isAuthChecked);
  };

  return (
    <div className="mx-auto bg-gray-900">
      <div className="grid justify-items-center py-3">
        {api
          ?
          <div className="py-5 text-xl font-bold tracking-tight text-white">
            Connected To Yoroi
            <div className="py-1 text-xl font-bold tracking-tight text-white text-center">
              {getWalletPlate(api, isAuthChecked, authEnabled)}
            </div>
          </div>
          : connectionState === IN_PROGRESS
          ?
          <div className="pt-5 pb-20 text-xl font-bold tracking-tight text-green-500">
              <label>
                  Wallet connecting is in progress ... 
              </label>
          </div> 
          :
          <div>
            <button
            className="rounded-md border-black-300 bg-blue-500 hover:bg-blue-300 active:bg-blue-700 py-5 px-5"
            onClick={() => connect(isAuthChecked, false)}
            >
              Request Access To Yoroi
            </button>
            <div className="grid justify-items-center py-5 text-l font-bold tracking-tight text-white">
              <div>
                <input
                  type="checkbox"
                  id="authRequired"
                  name="authRequiredCheckbox"
                  checked={isAuthChecked}
                  onChange={handleOnChange}
                />
                <label htmlFor="authRequired"><span/> Request authentication</label>
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  );
}

export default AccessButton;
