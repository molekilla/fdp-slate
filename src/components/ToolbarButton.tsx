import React from 'react';

import '../styles/Toolbar.css';
import { isEmptyString } from '../common/utils';
import type { OverridableComponent } from '@mui/material/OverridableComponent';
import type { SvgIconTypeMap } from '@mui/material';

interface ToolbarButtonProps {
    Icon: OverridableComponent<SvgIconTypeMap<{}, 'svg'>> & {
        muiName: string;
    };
    text?: string;
    isActive?: boolean;
    isSecondaryButton?: boolean;
    onClick?: React.MouseEventHandler<HTMLButtonElement>;
    onMouseDown?: React.MouseEventHandler<HTMLButtonElement>;
}

function ToolbarButton({
    Icon,
    text,
    isActive = false,
    isSecondaryButton = false,
    onClick = undefined,
    onMouseDown = undefined
}: ToolbarButtonProps): React.ReactElement<ToolbarButtonProps> {
    return (
        <button
            className={`Toolbar_button${isActive ? ' active' : ''}${
                isSecondaryButton ? ' secondary' : ''
            }`}
            type="button"
            onClick={onClick}
            onMouseDown={onMouseDown}>
            <Icon />
            {!isEmptyString(text) && <span>{text}</span>}
        </button>
    );
}

export default ToolbarButton;
