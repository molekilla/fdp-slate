import React from 'react';

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

function Toolbar(): React.ReactElement {
    return (
        <div className="Toolbar">
            <ToolbarButton Icon={NewDocumentIcon} text="New File" />
            <ToolbarButton Icon={OpenDocumentIcon} text="Open" />
            <ToolbarButton Icon={SaveIcon} text="Save" />
            <div className="Divider" />
            <ToolbarButton Icon={BoldIcon} isSecondaryButton />
            <ToolbarButton Icon={ItalicIcon} isSecondaryButton />
            <ToolbarButton Icon={UnderlineIcon} isSecondaryButton />
            <ToolbarButton Icon={LeftAlignIcon} isSecondaryButton />
            <ToolbarButton Icon={CenterAlignIcon} isSecondaryButton />
            <ToolbarButton Icon={RightAlignIcon} isSecondaryButton />
            <ToolbarButton Icon={JustifyAlignIcon} isSecondaryButton />
            <ToolbarButton Icon={NumberListIcon} isSecondaryButton />
            <ToolbarButton Icon={BulletListIcon} isSecondaryButton />
        </div>
    );
}

export default React.memo(Toolbar);
