import React from 'react';
import {
    Box,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    Modal
} from '@mui/material';

import type { FileListItem } from '../common/types';

interface ModalFileListProps {
    open: boolean;
    onClose: () => void;
    files: FileListItem[];
    onOpenFile: (fileName: string) => Promise<void>;
}

const style = {
    position: 'absolute' as 'absolute',
    top: '25%',
    left: '50%',
    transform: 'translate(-50%, -40%)',
    width: 400,
    minHeight: 250,
    maxHeight: 500,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    overflowY: 'auto'
};

function ModalFileList({
    files,
    open,
    onClose,
    onOpenFile
}: ModalFileListProps): JSX.Element {
    return (
        <Modal open={open} onClose={onClose}>
            <Box sx={style}>
                <List>
                    {files.map((fileItem) => (
                        <ListItem key={fileItem.id} disablePadding>
                            <ListItemButton
                                onClick={() => {
                                    onOpenFile(fileItem.name);
                                }}>
                                <ListItemText primary={fileItem.name} />
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>
            </Box>
        </Modal>
    );
}

export default ModalFileList;
