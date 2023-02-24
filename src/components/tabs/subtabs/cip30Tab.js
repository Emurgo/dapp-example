import React, {useState} from "react";
import useYoroi from "../../../hooks/yoroiProvider";
import useWasm from "../../../hooks/useWasm";
import GetBalanceCard from "../../cards/getBalanceCard";
import GetChangeAddressCard from "../../cards/getChangeAddressCard";
import GetCollateralUtxosCard from "../../cards/getCollateralUtxosCard";
import GetRewardAddressesCard from "../../cards/getRewardAddressesCard";
import GetUnusedAddressesCard from "../../cards/getUnusedAddressCard";
import GetUsedAddresses from "../../cards/getUsedAddressCard";
import GetUtxosCard from "../../cards/getUtxosCard";
import SignDataCard from "../../cards/signDataCard";
import BuildTransactionCard from "../../cards/buildTransactionCard";
import SignTransactionCard from "../../cards/signTransactionCard";
import SubmitTransactionCard from "../../cards/submitTransactionCard";
import IsEnabledCard from "../../cards/isEnabledCard";

const Cip30Tab = () => {
    const { api } = useYoroi();
    const wasm = useWasm();
    const [currentText, setCurrentText] = useState('');
    const [rawCurrentText, setRawCurrentText] = useState('');
    const [currentWaiterState, setWaiterState] = useState(false);
    const [isMessageDisplayed, setMessageDisplayed] = useState(false);
    const [isMessageDisplayedRaw, setMessageDisplayedRaw] = useState(false);

    const setResponse = (response) => {
        setCurrentText(JSON.stringify(response, undefined, 2));
    };
  
    const copyToClipboard = () => {
        navigator.clipboard.writeText(currentText).then(
            function() {
                console.log('Async: Copying the processed response to clipboard was successful!');
                setMessageDisplayed(true);
                hideMessage();
            },
            function(err) {
                console.error('Async: Could not copy text: ', err);
            }
        );
    };

    const copyRawToClipboard = () => {
        navigator.clipboard.writeText(rawCurrentText).then(
            function() {
                console.log('Async: Copying raw response to clipboard was successful!');
                setMessageDisplayedRaw(true);
                hideMessageRaw();
            },
            function(err) {
                console.error('Async: Could not copy raw response: ', err);
            }
        );
    };
  
    const hideMessage = () => {
        setTimeout(() => setMessageDisplayed(false), 3000);
    };

    const hideMessageRaw = () => {
        setTimeout(() => setMessageDisplayedRaw(false), 3000);
    };




    return (
        <div className="container mx-auto text-gray-300 py-5">
            <div className="grid grid-cols-3 gap-2">
                <div className="grid justify-items-stretch grid-cols-1 lg:grid-cols-2 gap-2">
                    <div>
                        <IsEnabledCard
                            onRawResponse={setRawCurrentText}
                            onResponse={setResponse}
                            onWaiting={setWaiterState}
                        />
                    </div>
                    <div>
                        <GetBalanceCard
                            api={api}
                            wasm={wasm}
                            onRawResponse={setRawCurrentText}
                            onResponse={setResponse}
                            onWaiting={setWaiterState}
                        />
                    </div>
                    <div>
                        <GetUnusedAddressesCard
                            api={api}
                            wasm={wasm}
                            onRawResponse={setRawCurrentText}
                            onResponse={setResponse}
                            onWaiting={setWaiterState}
                        />
                    </div>
                    <div>
                        <GetUsedAddresses
                            api={api}
                            wasm={wasm}
                            onRawResponse={setRawCurrentText}
                            onResponse={setResponse}
                            onWaiting={setWaiterState}
                        />
                    </div>
                    <div>
                        <GetChangeAddressCard
                            api={api}
                            wasm={wasm}
                            onRawResponse={setRawCurrentText}
                            onResponse={setResponse}
                            onWaiting={setWaiterState}    
                        />
                    </div>
                    <div>
                        <GetRewardAddressesCard
                            api={api}
                            wasm={wasm}
                            onRawResponse={setRawCurrentText}
                            onResponse={setResponse}
                            onWaiting={setWaiterState}
                        />
                    </div>
                    <div>
                        <GetUtxosCard
                            api={api}
                            wasm={wasm}
                            onRawResponse={setRawCurrentText}
                            onResponse={setResponse}
                            onWaiting={setWaiterState}
                        />
                    </div>
                    <div>
                        <GetCollateralUtxosCard
                            api={api}
                            wasm={wasm}
                            onRawResponse={setRawCurrentText}
                            onResponse={setResponse}
                            onWaiting={setWaiterState}
                        />
                    </div>
                    <div>
                        <SignDataCard
                            api={api}
                            onRawResponse={setRawCurrentText}
                            onResponse={setResponse}
                            onWaiting={setWaiterState}
                        />
                    </div>
                    <div>
                        <BuildTransactionCard
                            api={api}
                            wasm={wasm}
                            onRawResponse={setRawCurrentText}
                            onResponse={setResponse}
                            onWaiting={setWaiterState}
                        />
                    </div>
                    <div>
                        <SignTransactionCard
                            api={api}
                            wasm={wasm}
                            onRawResponse={setRawCurrentText}
                            onResponse={setResponse}
                            onWaiting={setWaiterState}
                        />
                    </div>
                    <div>
                        <SubmitTransactionCard
                            api={api}
                            onRawResponse={setRawCurrentText}
                            onResponse={setResponse}
                            onWaiting={setWaiterState}
                        />
                    </div>
                </div>
                <div className="col-span-2 block p-5 min-w-full rounded-lg border shadow-md bg-gray-900 border-gray-700">
                    <div className="grid grid-rows-4 gap-2 h-full">
                        <div>
                            <div className="grid grid-rows-3 h-full">
                                <div className="grid grid-cols-3">
                                    <div className="grid justify-items-start content-end">
                                        <span className="text-l font-bold text-white">
                                            Raw response:
                                        </span>
                                    </div>
                                    <div className="grid justify-items-center content-end">
                                        <label className="text-white font-medium">
                                            {currentWaiterState ? "Waiting for the response..." : ""}
                                        </label>
                                        <label className="text-green-600 font-medium">
                                            {isMessageDisplayedRaw ? "Copied!" : ""}
                                        </label>
                                    </div>
                                    <div className="grid justify-items-end content-end">
                                        <button className="
                                            text-white
                                            font-medium
                                            rounded-lg
                                            text-sm
                                            px-5
                                            py-2.5
                                            text-center
                                            bg-orange-700
                                            hover:bg-orange-800
                                            focus:ring-orange-900
                                            active:ring-orange-600
                                            disabled:opacity-50
                                            "
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
                                <div className="grid grid-cols-3">
                                    <div className="grid justify-items-start content-end">
                                        <span className="text-l font-bold text-white">
                                            Stringified response:
                                        </span>
                                    </div>
                                    <div className="grid justify-items-center content-end">
                                        <label className="text-white font-medium">
                                            {currentWaiterState ? "Waiting for the response..." : ""}
                                        </label>
                                        <label className="text-green-600 font-medium">
                                            {isMessageDisplayed ? "Copied!" : ""}
                                        </label>
                                    </div>
                                    <div className="grid justify-items-end content-end">
                                        <button className="
                                            text-white
                                            font-medium
                                            rounded-lg
                                            text-sm
                                            px-5
                                            py-2.5
                                            text-center
                                            bg-orange-700
                                            hover:bg-orange-800
                                            focus:ring-orange-900
                                            active:ring-orange-600
                                            disabled:opacity-50
                                            "
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
            </div>
        </div>
    );
};

export default Cip30Tab;