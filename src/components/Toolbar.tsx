import React from 'react';
import { useSlate } from 'slate-react';
import { Editor, Transforms, Element as SlateElement } from 'slate';
import type { BaseEditor } from 'slate';

import '../styles/Toolbar.css';
import NoteAddOutlinedIcon from '@mui/icons-material/NoteAddOutlined';
import FolderOpenOutlinedIcon from '@mui/icons-material/FolderOpenOutlined';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import FormatBoldOutlinedIcon from '@mui/icons-material/FormatBoldOutlined';
import FormatItalicOutlinedIcon from '@mui/icons-material/FormatItalicOutlined';
import FormatUnderlinedOutlinedIcon from '@mui/icons-material/FormatUnderlinedOutlined';
import FormatListNumberedOutlinedIcon from '@mui/icons-material/FormatListNumberedOutlined';
import FormatListBulletedOutlinedIcon from '@mui/icons-material/FormatListBulletedOutlined';
import FormatAlignLeftOutlinedIcon from '@mui/icons-material/FormatAlignLeftOutlined';
import FormatAlignCenterOutlinedIcon from '@mui/icons-material/FormatAlignCenterOutlined';
import FormatAlignRightOutlinedIcon from '@mui/icons-material/FormatAlignRightOutlined';
import FormatAlignJustifyOutlinedIcon from '@mui/icons-material/FormatAlignJustifyOutlined';
import TitleOutlinedIcon from '@mui/icons-material/TitleOutlined';
import FormatQuoteOutlinedIcon from '@mui/icons-material/FormatQuoteOutlined';
import LocalParkingOutlinedIcon from '@mui/icons-material/LocalParkingOutlined';

import ToolbarButton from './ToolbarButton';
import { MODE_TEXT } from './Editor';

const LIST_TYPES = ['numbered-list', 'bulleted-list'];
const TEXT_ALIGN_TYPES = ['left', 'center', 'right', 'justify'];

function Toolbar({
    selectedMode,
    setSelectedMode
}: {
    selectedMode: string;
    setSelectedMode: (value: string) => void;
}): React.ReactElement {
    const editor = useSlate();
    return (
        <div className="Toolbar">
            {selectedMode === MODE_TEXT.richText && (
                <>
                    <div className="Divider" />
                    <ToolbarButton
                        Icon={FormatBoldOutlinedIcon}
                        isSecondaryButton
                        isActive={isMarkActive(editor, 'bold')}
                        onClick={(event) => {
                            event.preventDefault();
                            toggleMark(editor, 'bold');
                        }}
                    />
                    <ToolbarButton
                        Icon={FormatItalicOutlinedIcon}
                        isSecondaryButton
                        isActive={isMarkActive(editor, 'italic')}
                        onClick={(event) => {
                            event.preventDefault();
                            toggleMark(editor, 'italic');
                        }}
                    />
                    <ToolbarButton
                        Icon={FormatUnderlinedOutlinedIcon}
                        isSecondaryButton
                        isActive={isMarkActive(editor, 'underline')}
                        onClick={(event) => {
                            event.preventDefault();
                            toggleMark(editor, 'underline');
                        }}
                    />
                    <ToolbarButton
                        Icon={FormatAlignLeftOutlinedIcon}
                        isSecondaryButton
                        isActive={isBlockActive(
                            editor,
                            'left',
                            TEXT_ALIGN_TYPES.includes('left') ? 'align' : 'type'
                        )}
                        onClick={(event) => {
                            event.preventDefault();
                            toggleBlock(editor, 'left');
                        }}
                    />
                    <ToolbarButton
                        Icon={FormatAlignCenterOutlinedIcon}
                        isSecondaryButton
                        isActive={isBlockActive(
                            editor,
                            'center',
                            TEXT_ALIGN_TYPES.includes('center')
                                ? 'align'
                                : 'type'
                        )}
                        onClick={(event) => {
                            event.preventDefault();
                            toggleBlock(editor, 'center');
                        }}
                    />
                    <ToolbarButton
                        Icon={FormatAlignRightOutlinedIcon}
                        isSecondaryButton
                        isActive={isBlockActive(
                            editor,
                            'right',
                            TEXT_ALIGN_TYPES.includes('right')
                                ? 'align'
                                : 'type'
                        )}
                        onClick={(event) => {
                            event.preventDefault();
                            toggleBlock(editor, 'right');
                        }}
                    />
                    <ToolbarButton
                        Icon={FormatAlignJustifyOutlinedIcon}
                        isSecondaryButton
                        isActive={isBlockActive(
                            editor,
                            'justify',
                            TEXT_ALIGN_TYPES.includes('justify')
                                ? 'align'
                                : 'type'
                        )}
                        onClick={(event) => {
                            event.preventDefault();
                            toggleBlock(editor, 'justify');
                        }}
                    />
                    <ToolbarButton
                        Icon={FormatListNumberedOutlinedIcon}
                        isSecondaryButton
                        isActive={isBlockActive(
                            editor,
                            'numbered-list',
                            TEXT_ALIGN_TYPES.includes('numbered-list')
                                ? 'align'
                                : 'type'
                        )}
                        onClick={(event) => {
                            event.preventDefault();
                            toggleBlock(editor, 'numbered-list');
                        }}
                    />
                    <ToolbarButton
                        Icon={FormatListBulletedOutlinedIcon}
                        isSecondaryButton
                        isActive={isBlockActive(
                            editor,
                            'bulleted-list',
                            TEXT_ALIGN_TYPES.includes('bulleted-list')
                                ? 'align'
                                : 'type'
                        )}
                        onClick={(event) => {
                            event.preventDefault();
                            toggleBlock(editor, 'bulleted-list');
                        }}
                    />
                </>
            )}
            <div className="Divider" />
            <ToolbarButton
                Icon={FormatQuoteOutlinedIcon}
                text="Markdown"
                isSecondaryButton
                isActive={selectedMode === MODE_TEXT.markdown}
                onClick={(event) => {
                    event.preventDefault();
                    setSelectedMode(MODE_TEXT.markdown);
                }}
            />
            <ToolbarButton
                Icon={TitleOutlinedIcon}
                text="Rich Text"
                isSecondaryButton
                isActive={selectedMode === MODE_TEXT.richText}
                onClick={(event) => {
                    event.preventDefault();
                    setSelectedMode(MODE_TEXT.richText);
                }}
            />
            <ToolbarButton
                Icon={LocalParkingOutlinedIcon}
                text="Plain text"
                isSecondaryButton
                isActive={selectedMode === MODE_TEXT.plainText}
                onClick={(event) => {
                    event.preventDefault();
                    setSelectedMode(MODE_TEXT.plainText);
                }}
            />
        </div>
    );
}

const toggleBlock: (editor: BaseEditor, format: string) => void = (
    editor,
    format
) => {
    const isActive = isBlockActive(
        editor,
        format,
        TEXT_ALIGN_TYPES.includes(format) ? 'align' : 'type'
    );
    const isList = LIST_TYPES.includes(format);

    Transforms.unwrapNodes(editor, {
        match: (n) =>
            !Editor.isEditor(n) &&
            SlateElement.isElement(n) &&
            LIST_TYPES.includes((n as any).type) &&
            !TEXT_ALIGN_TYPES.includes(format),
        split: true
    });
    let newProperties: Partial<any>;
    if (TEXT_ALIGN_TYPES.includes(format)) {
        newProperties = {
            align: isActive ? undefined : format
        };
    } else {
        newProperties = {
            type: isActive ? 'paragraph' : isList ? 'list-item' : format
        };
    }
    Transforms.setNodes<SlateElement>(editor, newProperties);

    if (!isActive && isList) {
        const block = { type: format, children: [] };
        Transforms.wrapNodes(editor, block);
    }
};

const toggleMark: (editor: BaseEditor, format: string) => void = (
    editor,
    format
) => {
    const isActive = isMarkActive(editor, format);

    if (isActive) {
        Editor.removeMark(editor, format);
    } else {
        Editor.addMark(editor, format, true);
    }
};

const isBlockActive: (
    editor: BaseEditor,
    format: string,
    blockType: string
) => boolean = (editor, format, blockType = 'type') => {
    const { selection } = editor;
    if (!selection) return false;

    const [match] = Array.from(
        Editor.nodes(editor, {
            at: Editor.unhangRange(editor, selection),
            match: (n) =>
                !Editor.isEditor(n) &&
                SlateElement.isElement(n) &&
                (n as any)[blockType] === format
        })
    );

    return !!match;
};

const isMarkActive: (editor: Editor, format: string) => boolean = (
    editor,
    format
) => {
    const marks: any = Editor.marks(editor);

    return marks ? marks[format] === true : false;
};

export default React.memo(Toolbar);
