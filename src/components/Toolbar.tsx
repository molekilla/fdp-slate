import React from 'react';
import { useSlate } from 'slate-react';
import { Editor, Transforms, Element as SlateElement } from 'slate';
import type { BaseEditor } from 'slate';

import '../styles/Toolbar.css';
import { ReactComponent as NewDocumentIcon } from '../assets/newDocument.svg';
import { ReactComponent as OpenDocumentIcon } from '../assets/openFile.svg';
import { ReactComponent as SaveIcon } from '../assets/save.svg';
import { ReactComponent as BoldIcon } from '../assets/bold.svg';
import { ReactComponent as ItalicIcon } from '../assets/italic.svg';
import { ReactComponent as UnderlineIcon } from '../assets/underline.svg';
import { ReactComponent as NumberListIcon } from '../assets/numberList.svg';
import { ReactComponent as BulletListIcon } from '../assets/bulletList.svg';
import { ReactComponent as LeftAlignIcon } from '../assets/leftAlign.svg';
import { ReactComponent as CenterAlignIcon } from '../assets/centerAlign.svg';
import { ReactComponent as RightAlignIcon } from '../assets/rightAlign.svg';
import { ReactComponent as JustifyAlignIcon } from '../assets/justifyAlign.svg';

import ToolbarButton from './ToolbarButton';

const LIST_TYPES = ['numbered-list', 'bulleted-list'];
const TEXT_ALIGN_TYPES = ['left', 'center', 'right', 'justify'];

function Toolbar(): React.ReactElement {
    const editor = useSlate();
    return (
        <div className="Toolbar">
            <ToolbarButton Icon={NewDocumentIcon} text="New File" />
            <ToolbarButton Icon={OpenDocumentIcon} text="Open" />
            <ToolbarButton Icon={SaveIcon} text="Save" />
            <div className="Divider" />
            <ToolbarButton
                Icon={BoldIcon}
                isSecondaryButton
                isActive={isMarkActive(editor, 'bold')}
                onMouseDown={(event) => {
                    event.preventDefault();
                    toggleMark(editor, 'bold');
                }}
            />
            <ToolbarButton
                Icon={ItalicIcon}
                isSecondaryButton
                isActive={isMarkActive(editor, 'italic')}
                onMouseDown={(event) => {
                    event.preventDefault();
                    toggleMark(editor, 'italic');
                }}
            />
            <ToolbarButton
                Icon={UnderlineIcon}
                isSecondaryButton
                isActive={isMarkActive(editor, 'underline')}
                onMouseDown={(event) => {
                    event.preventDefault();
                    toggleMark(editor, 'underline');
                }}
            />
            <ToolbarButton
                Icon={LeftAlignIcon}
                isSecondaryButton
                isActive={isBlockActive(
                    editor,
                    'left',
                    TEXT_ALIGN_TYPES.includes('left') ? 'align' : 'type'
                )}
                onMouseDown={(event) => {
                    event.preventDefault();
                    toggleBlock(editor, 'left');
                }}
            />
            <ToolbarButton
                Icon={CenterAlignIcon}
                isSecondaryButton
                isActive={isBlockActive(
                    editor,
                    'center',
                    TEXT_ALIGN_TYPES.includes('center') ? 'align' : 'type'
                )}
                onMouseDown={(event) => {
                    event.preventDefault();
                    toggleBlock(editor, 'center');
                }}
            />
            <ToolbarButton
                Icon={RightAlignIcon}
                isSecondaryButton
                isActive={isBlockActive(
                    editor,
                    'right',
                    TEXT_ALIGN_TYPES.includes('right') ? 'align' : 'type'
                )}
                onMouseDown={(event) => {
                    event.preventDefault();
                    toggleBlock(editor, 'right');
                }}
            />
            <ToolbarButton
                Icon={JustifyAlignIcon}
                isSecondaryButton
                isActive={isBlockActive(
                    editor,
                    'justify',
                    TEXT_ALIGN_TYPES.includes('justify') ? 'align' : 'type'
                )}
                onMouseDown={(event) => {
                    event.preventDefault();
                    toggleBlock(editor, 'justify');
                }}
            />
            <ToolbarButton
                Icon={NumberListIcon}
                isSecondaryButton
                isActive={isBlockActive(
                    editor,
                    'numbered-list',
                    TEXT_ALIGN_TYPES.includes('numbered-list')
                        ? 'align'
                        : 'type'
                )}
                onMouseDown={(event) => {
                    event.preventDefault();
                    toggleBlock(editor, 'numbered-list');
                }}
            />
            <ToolbarButton
                Icon={BulletListIcon}
                isSecondaryButton
                isActive={isBlockActive(
                    editor,
                    'bulleted-list',
                    TEXT_ALIGN_TYPES.includes('bulleted-list')
                        ? 'align'
                        : 'type'
                )}
                onMouseDown={(event) => {
                    event.preventDefault();
                    toggleBlock(editor, 'bulleted-list');
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
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
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

    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    return !!match;
};

const isMarkActive: (editor: Editor, format: string) => boolean = (
    editor,
    format
) => {
    const marks: any = Editor.marks(editor);
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    return marks ? marks[format] === true : false;
};

export default React.memo(Toolbar);
