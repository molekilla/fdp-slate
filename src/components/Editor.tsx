import React, { useEffect, useMemo, useState } from 'react';
import {
    createEditor,
    Text,
    Editor as SlateEditor,
    Element as SlateElement,
    Node as SlateNode,
    Point,
    Range,
    Transforms
} from 'slate';
import { Editable, Slate, withReact, ReactEditor } from 'slate-react';
import type { RenderElementProps, RenderLeafProps } from 'slate-react';
import type { Descendant, BaseRange } from 'slate';
import { withHistory } from 'slate-history';
import { Box, Button, Modal, TextField, Typography } from '@mui/material';
import Prism from 'prismjs';
import 'prismjs/components/prism-markdown';

import BlossomService from '../services/blossom';

import Toolbar from './Toolbar';
import type { FileListItem } from '../common/types';
import ModalFileList from './ModalFileList';

import '../styles/Editor.css';

const INITIAL_VALUE = [
    {
        type: 'paragraph',
        children: [{ text: '' }]
    }
];

export const MODE_TEXT = {
    richText: 'richText',
    markdown: 'markdown',
    plainText: 'plainText'
};

const SHORTCUTS: any = {
    '**': 'bold',
    '*': 'list-item',
    '-': 'list-item',
    '+': 'list-item',
    '>': 'block-quote',
    '######': 'heading-six',
    '#####': 'heading-five',
    '####': 'heading-four',
    '###': 'heading-three',
    '##': 'heading-two',
    '#': 'heading-one'
};

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
    const [fileName, setFileName] = useState<string>('');
    const [openModalName, setOpenModalName] = useState<boolean>(false);
    const [openModalFileList, setOpenModalFileList] = useState<boolean>(false);
    const [myFiles, setMyFiles] = useState<FileListItem[]>([]);
    const [editorValue, setEditorValue] = useState<Descendant[]>([]);
    const [selectedMode, setSelectedMode] = useState<string>(
        MODE_TEXT.markdown
    );
    const blossomService = useMemo(() => BlossomService(), []);

    const editor = useMemo(
        () => withShortcuts(withHistory(withReact(createEditor()))),
        []
    );

    useEffect(() => {
        blossomService.connectToFdpStorage();
    }, []);

    const renderElement: (props: RenderElementProps) => JSX.Element = (
        props
    ) => {
        if (selectedMode === MODE_TEXT.markdown) {
            return <ElementMarkdown {...props} />;
        }
        return <Element {...props} />;
    };

    const renderLeaf: (props: RenderLeafProps) => JSX.Element = (props) => (
        <Leaf {...props} />
    );

    const decorate = ([node, path]: any): BaseRange[] => {
        const ranges: any[] = [];

        if (!Text.isText(node)) {
            return ranges;
        }

        const getLength = (token: any) => {
            if (typeof token === 'string') {
                return token.length;
            } else if (typeof token.content === 'string') {
                return token.content.length;
            } else {
                return token.content.reduce(
                    (l: any, t: any) => l + getLength(t),
                    0
                );
            }
        };

        const tokens = Prism.tokenize(node.text, Prism.languages.markdown);
        let start = 0;

        for (const token of tokens) {
            const length = getLength(token);
            const end = start + length;

            if (typeof token !== 'string') {
                ranges.push({
                    [token.type]: true,
                    anchor: { path, offset: start },
                    focus: { path, offset: end }
                });
            }

            start = end;
        }

        return ranges;
    };

    const handleDOMBeforeInput = (e: InputEvent): void => {
        queueMicrotask(() => {
            const pendingDiffs = ReactEditor.androidPendingDiffs(editor);

            const scheduleFlush = pendingDiffs?.some(({ diff, path }) => {
                if (!diff.text.endsWith(' ')) {
                    return false;
                }

                const { text } = SlateNode.leaf(editor, path);
                const beforeText =
                    text.slice(0, diff.start) + diff.text.slice(0, -1);
                if (!(beforeText in SHORTCUTS)) {
                    // eslint-disable-next-line array-callback-return
                    return;
                }

                const blockEntry = SlateEditor.above(editor, {
                    at: path,
                    match: (n) =>
                        SlateElement.isElement(n) &&
                        SlateEditor.isBlock(editor, n)
                });
                if (!blockEntry) {
                    return false;
                }

                const [, blockPath] = blockEntry;
                return SlateEditor.isStart(
                    editor,
                    SlateEditor.start(editor, path),
                    blockPath
                );
            });

            if (scheduleFlush) {
                ReactEditor.androidScheduleFlush(editor);
            }
        });
    };

    const openFiles: () => Promise<void> = async () => {
        try {
            const files = await blossomService.readFiles();

            if (files.length > 0) {
                setMyFiles(files);
                setOpenModalFileList(true);
            }
        } catch (error: any) {
            alert(`loading files: ${error.message}`);
        }
    };

    const saveNewFile: () => Promise<void> = async () => {
        try {
            const content = JSON.stringify(
                editorValue.map((child) => ({ ...child, mode: selectedMode }))
            );
            await blossomService.createFile(fileName, content);
            setOpenModalName(false);
        } catch (error: any) {
            alert(`saving new file: ${error.message}`);
        }
    };

    const saveOpenFile: () => Promise<void> = async () => {
        try {
            const content = JSON.stringify(
                editorValue.map((child) => ({ ...child, mode: selectedMode }))
            );
            await blossomService.updateFile(fileName, content);
        } catch (error: any) {
            alert(`saving file: ${error.message}`);
        }
    };

    const onNewFile: React.MouseEventHandler<HTMLButtonElement> = () => {
        setFileName('');
        setMyFiles([]);
        editor.children = INITIAL_VALUE;
        setEditorValue([]);
    };

    const onSaveFile: React.MouseEventHandler<HTMLButtonElement> = () => {
        if (fileName.trim() === '') {
            setOpenModalName(true);
        } else {
            saveOpenFile();
        }
    };

    const onSaveNewFile: React.MouseEventHandler<HTMLButtonElement> = () => {
        saveNewFile();
    };

    const onOpenFiles: React.MouseEventHandler<HTMLButtonElement> = () => {
        openFiles();
    };

    const onOpenFile: (selectedFileName: string) => Promise<void> = async (
        selectedFileName
    ) => {
        try {
            const content = await blossomService.openFile(selectedFileName);
            const text = new TextDecoder().decode(content);
            const parsed = JSON.parse(text);
            const contentFile =
                parsed !== null || parsed !== undefined
                    ? (parsed as Descendant[])
                    : INITIAL_VALUE;
            setFileName(selectedFileName);
            editor.children = contentFile;
            setSelectedMode((contentFile[0] as any).mode);
            setMyFiles([]);
            setOpenModalFileList(false);
        } catch (error: any) {
            alert(`opening the file ${selectedFileName}: ${error.message}`);
        }
    };

    return (
        <>
            <Slate
                editor={editor}
                value={INITIAL_VALUE}
                onChange={(value) => {
                    const isAstChange = editor.operations.some(
                        (op: any) => op.type !== 'set_selection'
                    );

                    if (isAstChange) {
                        setEditorValue(value);
                    }
                }}>
                <Toolbar
                    selectedMode={selectedMode}
                    setSelectedMode={setSelectedMode}
                    onNewFile={onNewFile}
                    onOpenFiles={onOpenFiles}
                    onSave={onSaveFile}
                />
                <Editable
                    onDOMBeforeInput={
                        selectedMode === MODE_TEXT.markdown
                            ? handleDOMBeforeInput
                            : undefined
                    }
                    decorate={
                        selectedMode === MODE_TEXT.markdown
                            ? decorate
                            : undefined
                    }
                    className="Editor"
                    renderElement={renderElement}
                    renderLeaf={
                        selectedMode === MODE_TEXT.markdown
                            ? undefined
                            : renderLeaf
                    }
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
                    <Typography
                        id="modal-modal-title"
                        variant="h6"
                        component="h2">
                        Save content to fdp-storage
                    </Typography>
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

    if (leafCopy.bold) {
        children = <strong>{children}</strong>;
    }

    if (leafCopy.code) {
        children = <code>{children}</code>;
    }

    if (leafCopy.italic) {
        children = <em>{children}</em>;
    }

    if (leafCopy.underline) {
        children = <u>{children}</u>;
    }

    return <span {...attributes}>{children}</span>;
};

const ElementMarkdown: (props: RenderElementProps) => JSX.Element = ({
    attributes,
    children,
    element
}: RenderElementProps) => {
    const style = {
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
        case 'heading-three':
            return (
                <h3 style={style} {...attributes}>
                    {children}
                </h3>
            );
        case 'heading-four':
            return (
                <h4 style={style} {...attributes}>
                    {children}
                </h4>
            );
        case 'heading-five':
            return (
                <h5 style={style} {...attributes}>
                    {children}
                </h5>
            );
        case 'heading-six':
            return (
                <h6 style={style} {...attributes}>
                    {children}
                </h6>
            );
        case 'list-item':
            return (
                <li style={style} {...attributes}>
                    {children}
                </li>
            );
        default:
            return (
                <p style={style} {...attributes}>
                    {children}
                </p>
            );
    }
};

const withShortcuts = (editor: any) => {
    const { deleteBackward, insertText } = editor;

    editor.insertText = (text: any) => {
        const { selection } = editor;

        if (text.endsWith(' ') && selection && Range.isCollapsed(selection)) {
            const { anchor } = selection;
            const block = SlateEditor.above(editor, {
                match: (n) =>
                    SlateElement.isElement(n) && SlateEditor.isBlock(editor, n)
            });

            const path = block ? block[1] : [];
            const start = SlateEditor.start(editor, path);
            const range = { anchor, focus: start };
            const beforeText =
                SlateEditor.string(editor, range) + text.slice(0, -1);
            const foundKey =
                Object.keys(SHORTCUTS).find((x) => beforeText.startsWith(x)) ??
                '';
            const type = SHORTCUTS[foundKey];

            if (type && type !== 'bold') {
                Transforms.select(editor, range);

                if (!Range.isCollapsed(range)) {
                    Transforms.delete(editor);
                }

                const newProperties: Partial<any> = {
                    type
                };
                Transforms.setNodes<SlateElement>(editor, newProperties, {
                    match: (n) =>
                        SlateElement.isElement(n) &&
                        SlateEditor.isBlock(editor, n)
                });

                if (type === 'list-item') {
                    const list = {
                        type: 'bulleted-list',
                        children: []
                    };
                    Transforms.wrapNodes(editor, list, {
                        match: (n) =>
                            !SlateEditor.isEditor(n) &&
                            SlateElement.isElement(n) &&
                            (n as any).type === 'list-item'
                    });
                }

                return;
            }
        }

        insertText(text);
    };

    editor.deleteBackward = (...args: any) => {
        const { selection } = editor;

        if (selection && Range.isCollapsed(selection)) {
            const match = SlateEditor.above(editor, {
                match: (n) =>
                    SlateElement.isElement(n) && SlateEditor.isBlock(editor, n)
            });

            if (match) {
                const [block, path] = match;
                const start = SlateEditor.start(editor, path);

                if (
                    !SlateEditor.isEditor(block) &&
                    SlateElement.isElement(block) &&
                    (block as any).type !== 'paragraph' &&
                    Point.equals(selection.anchor, start)
                ) {
                    const newProperties: Partial<any> = {
                        type: 'paragraph'
                    };
                    Transforms.setNodes(editor, newProperties);

                    if ((block as any).type === 'list-item') {
                        Transforms.unwrapNodes(editor, {
                            match: (n) =>
                                !SlateEditor.isEditor(n) &&
                                SlateElement.isElement(n) &&
                                (n as any).type === 'bulleted-list',
                            split: true
                        });
                    }

                    return;
                }
            }

            deleteBackward(...args);
        }
    };

    return editor;
};

export default Editor;
