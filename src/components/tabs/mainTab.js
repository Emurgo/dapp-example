import Cip30Tab from "./subtabs/cip30Tab";
// import ContractTab from "./subtabs/contractTab";
import NFTTab from "./subtabs/NFTTab";
// import SubmitTxsTab from "./subtabs/submitTxsTab";
import {
    Routes,
    Route,
    Link,
    useLocation
} from "react-router-dom";
import useYoroi from "../../hooks/yoroiProvider";
import { CONNECTED } from "../../utils/connectionStates";


const MainTab = () => {
    const { pathname } = useLocation();
    const { connectionState } = useYoroi();
    console.log(`[dApp][MainTab] wallet connection state is ${connectionState}`);

    const ACTIVE_COLOURS = "text-blue-600 active bg-gray-800 text-blue-500";
    const INACTIVE_COLOURS = "hover:bg-gray-800 hover:text-gray-300";

    return (
        <>
            <div className="bg-gray-900 grid justify-items-center pt-5">
                {connectionState !== CONNECTED ?
                    <div className="text-xl font-bold tracking-tight text-white">
                        <label>
                            Wallet is not connected
                        </label>
                    </div>
                    :
                    <ul className="flex flex-wrap text-sm font-medium text-center border-b border-gray-700 text-gray-400">
                        <li className="mr-2">
                            <Link to="CIP-30">
                                <button className={"inline-block p-4 rounded-t-lg " + (pathname === "/CIP-30" ? ACTIVE_COLOURS : INACTIVE_COLOURS)}>CIP-30</button>
                            </Link>
                        </li>
                        {/* <li className="mr-2">
                            <button className={"inline-block p-4 rounded-t-lg cursor-not-allowed " + (pathname === "/Contracts" ? ACTIVE_COLOURS : INACTIVE_COLOURS)}>Contracts</button>
                        </li> */}
                        <li className="mr-2">
                            <Link to="NFTs">
                                <button className={"inline-block p-4 rounded-t-lg " + (pathname === "/NFTs" ? ACTIVE_COLOURS : INACTIVE_COLOURS)}>NFTs</button>
                            </Link>
                        </li>
                        {/* <li className="mr-2">
                            <Link to="Submit-Txs">
                                <button className={"inline-block p-4 rounded-t-lg " + (pathname === "/Submit-Txs" ? ACTIVE_COLOURS : INACTIVE_COLOURS)}>Submit-Txs</button>
                            </Link>
                        </li> */}
                    </ul>
                }
            </div>
            <Routes>
                <Route path="/CIP-30" element={<Cip30Tab />} />
                {/* <Route path="/Contracts" element={<ContractTab />} /> */}
                <Route path="/NFTs" element={<NFTTab />} />
                {/* <Route path="/Submit-Txs" element={<SubmitTxsTab />} /> */}
            </Routes>
        </>
    );
}

export default MainTab;