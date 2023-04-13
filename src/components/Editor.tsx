import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { createEditor } from 'slate';
import { Editable, Slate, withReact } from 'slate-react';
import type { RenderElementProps, RenderLeafProps } from 'slate-react';
import type { Descendant } from 'slate';
import { withHistory } from 'slate-history';
import { Box, Button, Modal, TextField } from '@mui/material';

import Toolbar from './Toolbar';
import { useFdpStorage } from '../context/fdp.context';
import type { FileListItem } from '../common/types';
import ModalFileList from './ModalFileList';

import { MAIN_FOLDER_PATH, POD_NAME } from '../constants/constants';

import '../styles/Editor.css';

const INITIAL_VALUE = [
    {
        type: 'paragraph',
        children: [{ text: '' }]
    }
];

const style = {
    position: 'absolute' as 'absolute',
    top: '25%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    height: 150,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
    display: 'flex',
    flexDirection: 'column',
    gap: 3
};

function Editor(): React.ReactElement {
    const { blossom } = useFdpStorage();
    const [fileName, setFileName] = useState<string>('');
    const [openModalName, setOpenModalName] = useState<boolean>(false);
    const [openModalFileList, setOpenModalFileList] = useState<boolean>(false);
    const [myFiles, setMyFiles] = useState<FileListItem[]>([]);

    const connectToFdpStorage: () => Promise<void> = async () => {
        try {
            const allowed =
                await blossom.fdpStorage.personalStorage.requestFullAccess();
            if (allowed) {
                console.log('dappid: ', blossom.dappId);
                const podIsCrated =
                    await blossom.fdpStorage.personalStorage.isDappPodCreated();
                const podList = await blossom.fdpStorage.personalStorage.list();
                if (
                    (podList.pods.find((x) => x.name === POD_NAME) === null ||
                        podList.pods.find((x) => x.name === POD_NAME) ===
                            undefined) &&
                    !podIsCrated
                ) {
                    await blossom.fdpStorage.personalStorage.create(
                        blossom.dappId ?? POD_NAME
                    );
                    await blossom.fdpStorage.directory.create(
                        POD_NAME,
                        MAIN_FOLDER_PATH
                    );
                }
            }
        } catch (error) {
            console.log('error connecting to fdp storage: ', error);
        }
    };

    useEffect(() => {
        connectToFdpStorage();

        return () => {
            blossom.closeConnection();
        };
    }, []);

    const renderElement: (props: RenderElementProps) => JSX.Element =
        useCallback((props) => <Element {...props} />, []);
    const renderLeaf: (props: RenderLeafProps) => JSX.Element = useCallback(
        (props) => <Leaf {...props} />,
        []
    );
    const editor = useMemo(() => withHistory(withReact(createEditor())), []);

    const openFiles: () => Promise<void> = async () => {
        try {
            const directories = await blossom.fdpStorage.directory.read(
                POD_NAME,
                MAIN_FOLDER_PATH
            );
            if (directories != null && directories.files.length > 0) {
                setMyFiles(
                    directories.files.map((fileItem) => ({
                        id: `${new Date().getTime()}`,
                        name: fileItem.name
                    }))
                );
                setOpenModalFileList(true);
            }
        } catch (error) {
            console.log('error loading files: ', error);
        }
    };

    const saveOpenFile: () => Promise<void> = async () => {
        try {
            await blossom.fdpStorage.file.delete(
                POD_NAME,
                `${MAIN_FOLDER_PATH}/${fileName}`
            );
            await blossom.fdpStorage.file.uploadData(
                POD_NAME,
                `${MAIN_FOLDER_PATH}/${fileName}`,
                localStorage.getItem('content') ?? ''
            );
        } catch (error) {
            console.log('error saving file: ', error);
        }
    };

    const onNewFile: React.MouseEventHandler<HTMLButtonElement> = () => {
        setFileName('');
        setMyFiles([]);
        editor.children = INITIAL_VALUE;
        localStorage.removeItem('content');
    };

    const onSaveFile: React.MouseEventHandler<HTMLButtonElement> = () => {
        if (fileName.trim() === '') {
            setOpenModalName(true);
        } else {
            saveOpenFile();
        }
    };

    const onSaveNewFile: React.MouseEventHandler<HTMLButtonElement> = () => {
        blossom.fdpStorage.file
            .uploadData(
                POD_NAME,
                `${MAIN_FOLDER_PATH}/${fileName}.txt`,
                localStorage.getItem('content') ?? ''
            )
            .then((_) => {
                setOpenModalName(false);
            })
            .catch((error) => {
                alert('Error saving the file');
                console.log('error saving new file: ', error);
            });
    };

    const onOpenFiles: React.MouseEventHandler<HTMLButtonElement> = () => {
        openFiles();
    };

    const onOpenFile: (selectedFileName: string) => Promise<void> = async (
        selectedFileName
    ) => {
        try {
            const content = await blossom.fdpStorage.file.downloadData(
                POD_NAME,
                `${MAIN_FOLDER_PATH}/${selectedFileName}`
            );
            if (content != null) {
                const text = new TextDecoder().decode(content);
                const parsed = JSON.parse(text);
                const contentFile =
                    parsed !== null || parsed !== undefined
                        ? (parsed as Descendant[])
                        : INITIAL_VALUE;
                setFileName(selectedFileName);
                editor.children = contentFile;
                localStorage.setItem('content', text);
                setMyFiles([]);
                setOpenModalFileList(false);
            }
        } catch (error) {
            console.log('error loading files: ', error);
        }
    };

    return (
        <>
            <Slate
                editor={editor}
                value={INITIAL_VALUE}
                onChange={(value) => {
                    const isAstChange = editor.operations.some(
                        (op) => op.type !== 'set_selection'
                    );
                    if (isAstChange) {
                        const content = JSON.stringify(value);
                        localStorage.setItem('content', content);
                    }
                }}>
                <Toolbar
                    onNewFile={onNewFile}
                    onOpenFiles={onOpenFiles}
                    onSave={onSaveFile}
                />
                <Editable
                    className="Editor"
                    renderElement={renderElement}
                    renderLeaf={renderLeaf}
                    spellCheck
                    autoFocus
                />
            </Slate>
            <Modal
                open={openModalName}
                onClose={() => {
                    setOpenModalName(false);
                }}
                aria-labelledby="modal-filename-title"
                aria-describedby="modal-filename-description">
                <Box sx={style}>
                    <TextField
                        id="file-name"
                        label="Name"
                        variant="standard"
                        onChange={(e) => {
                            setFileName(e.target.value);
                        }}
                    />
                    <Button variant="text" onClick={onSaveNewFile}>
                        Save
                    </Button>
                </Box>
            </Modal>
            <ModalFileList
                files={myFiles}
                open={openModalFileList}
                onClose={() => {
                    setMyFiles([]);
                    setOpenModalFileList(false);
                }}
                onOpenFile={onOpenFile}
            />
        </>
    );
}

const Element: (props: RenderElementProps) => JSX.Element = ({
    attributes,
    children,
    element
}: RenderElementProps) => {
    const style = {
        // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
        textAlign: (element as any).align ? (element as any).align : 'left'
    };
    switch ((element as any).type) {
        case 'block-quote':
            return (
                <blockquote style={style} {...attributes}>
                    {children}
                </blockquote>
            );
        case 'bulleted-list':
            return (
                <ul style={style} {...attributes}>
                    {children}
                </ul>
            );
        case 'heading-one':
            return (
                <h1 style={style} {...attributes}>
                    {children}
                </h1>
            );
        case 'heading-two':
            return (
                <h2 style={style} {...attributes}>
                    {children}
                </h2>
            );
        case 'list-item':
            return (
                <li style={style} {...attributes}>
                    {children}
                </li>
            );
        case 'numbered-list':
            return (
                <ol style={style} {...attributes}>
                    {children}
                </ol>
            );
        default:
            return (
                <p style={style} {...attributes}>
                    {children}
                </p>
            );
    }
};

const Leaf: (props: RenderLeafProps) => JSX.Element = ({
    attributes,
    children,
    leaf
}: RenderLeafProps) => {
    const leafCopy = leaf as any;
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    if (leafCopy.bold) {
        children = <strong>{children}</strong>;
    }

    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    if (leafCopy.code) {
        children = <code>{children}</code>;
    }

    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    if (leafCopy.italic) {
        children = <em>{children}</em>;
    }

    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    if (leafCopy.underline) {
        children = <u>{children}</u>;
    }

    return <span {...attributes}>{children}</span>;
};

export default Editor;
