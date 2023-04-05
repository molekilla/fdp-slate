import React, { useState } from 'react';
import { createEditor } from 'slate';

import { Editable, Slate, withReact } from 'slate-react';

import '../styles/Editor.css';
import Toolbar from './Toolbar';

const initialValue = [
    {
        type: 'paragraph',
        children: [{ text: '' }]
    }
];

function Editor(): React.ReactElement {
    const [editor] = useState(() => withReact(createEditor()));
    return (
        <Slate editor={editor} value={initialValue}>
            <Toolbar />
            <Editable className="Editor" spellCheck autoFocus />
        </Slate>
    );
}

export default Editor;
