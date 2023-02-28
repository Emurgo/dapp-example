import React, {useState} from "react";
import useYoroi from "../../../hooks/yoroiProvider";
import useWasm from "../../../hooks/useWasm";
import ExperimentalPart from "./experimentalPart";
import ResponsesPart from "./responsesPart";
import OfficialPart from "./officialPart";
import { CONNECTED } from "../../../utils/connectionStates";

const Cip30Tab = () => {
    const { api, connectionState } = useYoroi();
    const wasm = useWasm();
    const [currentText, setCurrentText] = useState('');
    const [rawCurrentText, setRawCurrentText] = useState('');
    const [currentWaiterState, setWaiterState] = useState(false);

    const setResponse = (response, stringifyIt = true) => {
        setCurrentText(stringifyIt
            ? JSON.stringify(response, undefined, 2)
            : response
            );
    };

    return (
        <div className="container mx-auto text-gray-300 py-5">
            { connectionState === CONNECTED ?
            <>
                <div className="grid grid-cols-3 gap-2">
                    <OfficialPart
                        api={api}
                        wasm={wasm}
                        setRawCurrentText={setRawCurrentText}
                        setResponse={setResponse}
                        setWaiterState={setWaiterState}
                    />
                    <ResponsesPart
                        rawCurrentText={rawCurrentText}
                        currentText={currentText}
                        currentWaiterState={currentWaiterState}
                    />
                </div>
                <div>
                    <ExperimentalPart
                        api={api}
                        wasm={wasm}
                        onRawResponse={setRawCurrentText}
                        onResponse={setResponse}
                        onWaiting={setWaiterState}
                    />
                </div>
            </>
            :
                <div></div>
            }
        </div>
    );
};

export default Cip30Tab;