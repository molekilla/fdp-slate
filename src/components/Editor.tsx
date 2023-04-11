import React, { useCallback, useMemo } from 'react';
import { createEditor } from 'slate';
import { Editable, Slate, withReact } from 'slate-react';
import type { RenderElementProps, RenderLeafProps } from 'slate-react';
import { withHistory } from 'slate-history';

import '../styles/Editor.css';
import Toolbar from './Toolbar';

const initialValue = [
    {
        type: 'paragraph',
        children: [{ text: '' }]
    }
];

function Editor(): React.ReactElement {
    const renderElement: (props: RenderElementProps) => JSX.Element =
        useCallback((props) => <Element {...props} />, []);
    const renderLeaf: (props: RenderLeafProps) => JSX.Element = useCallback(
        (props) => <Leaf {...props} />,
        []
    );
    const editor = useMemo(() => withHistory(withReact(createEditor())), []);

    return (
        <Slate editor={editor} value={initialValue}>
            <Toolbar />
            <Editable
                className="Editor"
                renderElement={renderElement}
                renderLeaf={renderLeaf}
                spellCheck
                autoFocus
            />
        </Slate>
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
