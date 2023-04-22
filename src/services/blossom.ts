import { Blossom } from '@fairdatasociety/blossom';

import { MAIN_FOLDER_PATH } from '../constants/constants';
import type { FileListItem } from '../common/types';

interface BlossomReturn {
    connectToFdpStorage: () => Promise<void>;
    readFiles: () => Promise<FileListItem[]>;
    createFile: (fileName: string, content: string) => Promise<void>;
    updateFile: (fileName: string, content: string) => Promise<void>;
    openFile: (fileName: string) => Promise<Uint8Array>;
}

function BlossomService(): BlossomReturn {
    const blossom = new Blossom();
    const dappId = blossom.dappId ?? '';

    const connectToFdpStorage: () => Promise<void> = async () => {
        await blossom.echo<string>('test');
        try {
            const podIsCrated =
                await blossom.fdpStorage.personalStorage.isDappPodCreated();
            if (!podIsCrated) {
                await blossom.fdpStorage.personalStorage.create(dappId);
                await blossom.fdpStorage.directory.create(
                    dappId,
                    MAIN_FOLDER_PATH
                );
            }
        } catch (error) {
            console.log('error connecting to fdp storage: ', error);
        }
    };

    const readFiles: () => Promise<FileListItem[]> = async () => {
        try {
            const directories = await blossom.fdpStorage.directory.read(
                dappId,
                MAIN_FOLDER_PATH
            );
            if (directories != null && directories.files.length > 0) {
                return directories.files.map((fileItem) => ({
                    id: `${new Date().getTime()}`,
                    name: fileItem.name
                }));
            }

            return [];
        } catch (error: any) {
            throw new Error(error);
        }
    };

    const createFile: (
        fileName: string,
        content: string
    ) => Promise<void> = async (fileName, content) => {
        try {
            await blossom.fdpStorage.file.uploadData(
                dappId,
                `${MAIN_FOLDER_PATH}/${fileName}.txt`,
                content ?? ''
            );
        } catch (error: any) {
            throw new Error(error);
        }
    };

    const updateFile: (
        fileName: string,
        content: string
    ) => Promise<void> = async (fileName, content) => {
        try {
            await blossom.fdpStorage.file.delete(
                dappId,
                `${MAIN_FOLDER_PATH}/${fileName}`
            );
            await blossom.fdpStorage.file.uploadData(
                dappId,
                `${MAIN_FOLDER_PATH}/${fileName}`,
                content
            );
        } catch (error: any) {
            throw new Error(error);
        }
    };

    const openFile: (fileName: string) => Promise<Uint8Array> = async (
        fileName
    ) => {
        try {
            const content = await blossom.fdpStorage.file.downloadData(
                dappId,
                `${MAIN_FOLDER_PATH}/${fileName}`
            );

            return content;
        } catch (error: any) {
            throw new Error(error);
        }
    };

    return { connectToFdpStorage, readFiles, createFile, updateFile, openFile };
}

export default BlossomService;
