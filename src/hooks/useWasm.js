import { useEffect, useState } from 'react';

const useWasm = () => {
    const [CardanoWasm, setCardanoWasm] = useState(null)

    useEffect(() => {
        const getWasm = async () => {
            try {
                setCardanoWasm(await import("@emurgo/cardano-serialization-lib-browser"))
            } catch (e) {
                console.error(e)
            }
        }
        getWasm()
    }, [])
    return CardanoWasm
}

export default useWasm