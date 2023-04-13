/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable react/react-in-jsx-scope */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { createContext, type ReactNode, useContext } from 'react';
import { FdpStorage } from '@fairdatasociety/fdp-storage';
import { getEnsConfig } from '../utils/ens.utils';
import { GLOBAL_POSTAGE_BATCH_ID } from '../constants/constants';
import { Blossom } from '@fairdatasociety/blossom';

const fdpClient = new FdpStorage(
    process.env.REACT_APP_BEE_URL as string,
    (process.env.REACT_APP_BATCH_ID || GLOBAL_POSTAGE_BATCH_ID) as any,
    getEnsConfig()
);

const blossom = new Blossom();

interface FdpStorageContextProps {
    children: ReactNode;
}

interface FdpStorageContextI {
    fdpClient: FdpStorage;
    blossom: Blossom;
}

const FdpStorageContext = createContext<FdpStorageContextI>({
    fdpClient,
    blossom
});

export function FdpStorageProvider(props: FdpStorageContextProps) {
    const { children } = props;

    return (
        <FdpStorageContext.Provider value={{ fdpClient, blossom }}>
            {children}
        </FdpStorageContext.Provider>
    );
}

export function useFdpStorage() {
    return useContext(FdpStorageContext);
}

export default FdpStorageContext;
