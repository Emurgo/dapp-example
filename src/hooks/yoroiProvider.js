import React, { useState, useEffect } from 'react';
import { NOT_CONNECTED, IN_PROGRESS, CONNECTED } from '../utils/connectionStates';

const YoroiContext = React.createContext(null);

export const YoroiProvider = ({children}) => {
    console.log('[dApp][YoroiProvider] is called');
    const [api, setApi] = useState(null);
    const [authEnabled, setAuthEnabled] = useState(false);
    const [connectionState, setConnectionState] = useState(NOT_CONNECTED);

    useEffect(() => {
        if (!window.cardano) {
            console.warn("There are no cardano wallets are installed");
            return;
        }
        if (!window.cardano.yoroi) {
            alert("Yoroi wallet not found! Please install it");
            return;
        }
        setConnectionState(IN_PROGRESS);

        window.cardano.yoroi.isEnabled()
            .then((response) => {
                console.log(`[dApp] Connection is enabled: ${response}`);
                if (response){
                    tryConnectSilent().then();
                } else {
                    setConnectionState(NOT_CONNECTED);
                    return;
                }
            })
            .catch((err) => {
                setConnectionState(NOT_CONNECTED);
                console.error(err);
            });
    }, [])

    const tryConnectSilent = async() => {
        let connectResult = null;
        console.log(`[dApp][tryConnectSilent] is called`);
        try {
            console.log(`[dApp][tryConnectSilent] trying {true, true}`);
            connectResult = await connect(true, true);
            if (connectResult != null){
                console.log('[dApp][tryConnectSilent] RE-CONNECTED!');
                setConnectionState(CONNECTED);
                return;
            }
        } catch (error) {
            console.warn(`[dApp][tryConnectSilent]: failed {true, true}`);
            if (String(error).includes("onlySilent:fail")) {
                console.warn("[dApp][tryConnectSilent] no silent re-connection is available");
                try {
                    console.log(`[dApp][tryConnectSilent] trying {false, true}`);
                    connectResult = await connect(false, true);
                    if (connectResult != null){
                        console.log('[dApp][tryConnectSilent] RE-CONNECTED!');
                        setConnectionState(CONNECTED);
                        return;
                    }
                } catch (error) {
                    setConnectionState(NOT_CONNECTED);
                    throw new Error(error);
                }
            } else {
                setConnectionState(NOT_CONNECTED);
                throw new Error(error);
            }
        }
    }

    const connect = async (requestId, silent) => {
        console.log(`[dApp][connect] is called`);
        if (!window.cardano) {
            console.warn("There are no cardano wallets are installed");
            return;
        }
        if (!window.cardano.yoroi) {
            alert("Yoroi wallet not found! Please install it");
            return;
        }
        console.log(`[dApp][connect] connecting a wallet`);
        console.log(`[dApp][connect] {requestIdentification: ${requestId}, onlySilent: ${silent}}`);
        const connectedApi  = await window
            .cardano
            .yoroi
            .enable(
                {
                    requestIdentification: requestId,
                    onlySilent: silent
                }
            );
        console.log(`[dApp][connect] wallet API object is received`);
        setApi(connectedApi);
        if ( requestId && connectedApi.experimental && connectedApi.experimental.auth) {
            const auth = connectedApi.experimental.auth();
            setAuthEnabled(auth && auth.isEnabled());
            setConnectionState(CONNECTED);
        }
        return connectedApi;
    }

    const values = {
        api,
        connect,
        authEnabled,
        connectionState,
    };
    
    return <YoroiContext.Provider value={values}>{children}</YoroiContext.Provider>
}

const useYoroi = () => {
    const context = React.useContext(YoroiContext)

    if (context === undefined) {
        throw new Error("Install Yoroi")
    }
    
    return context;
}

export default useYoroi;