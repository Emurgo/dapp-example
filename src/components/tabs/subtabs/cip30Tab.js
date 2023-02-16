import useYoroi from "../../../hooks/yoroiProvider";
import useWasm from "../../../hooks/useWasm";
import GetBalanceCard from "../../cards/getBalanceCard";
import GetChangeAddressCard from "../../cards/getChangeAddressCard";
import GetCollateralUtxosCard from "../../cards/getCollateralUtxosCard";
import GetRewardAddressesCard from "../../cards/getRewardAddressesCard";
import GetUnusedAddressesCard from "../../cards/getUnusedAddressCard";
import GetUsedAddresses from "../../cards/getUsedAddress";
import GetUtxosCard from "../../cards/getUtxosCard";
import SignTransactionCard from "../../cards/signTransactionCard";
import SubmitTransactionCard from "../../cards/submitTransactionCard";
import IsEnabledCard from "../../cards/isEnabledCard";

const Cip30Tab = () => {
    const { api } = useYoroi()
    const wasm = useWasm()
    return (
        <div className="container mx-auto text-gray-300 py-5">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                    <IsEnabledCard />
                </div>
                <div>
                    <GetBalanceCard api={api} wasm={wasm} />
                </div>
                <div>
                    <GetUnusedAddressesCard api={api} wasm={wasm} />
                </div>
                <div>
                    <GetUsedAddresses api={api} wasm={wasm} />
                </div>
                <div>
                    <GetChangeAddressCard api={api} wasm={wasm} />
                </div>
                <div>
                    <GetRewardAddressesCard api={api} wasm={wasm} />
                </div>
                <div>
                    <GetUtxosCard api={api} wasm={wasm} />
                </div>
                <div>
                    <GetCollateralUtxosCard api={api} wasm={wasm} />
                </div>
                <div>
                    <SignTransactionCard api={api} wasm={wasm} />
                </div>
                <div>
                    <SubmitTransactionCard api={api} />
                </div>
            </div>

        </div>
    );
};

export default Cip30Tab;