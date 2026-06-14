
import React, { FC, ReactElement, useEffect } from 'react'
// import ReactMarkdown from 'react-markdown'
// import remarkGfm from 'remark-gfm'
// import   '../homepage.css'

import { Close } from '@mui/icons-material'

import MarkdownDiv from './MarkdownDiv'
// material ui
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    IconButton,
} from '@mui/material'


type Props = {
    open: boolean
    onClose: () => any
    title: string
    body: string 
    inject ?: React.ReactElement
}

export const MarkdownDialog: FC<Props> = (props: Props): ReactElement => {

    return (
        (<Dialog open={props.open} maxWidth="sm" fullWidth
            onClose={props.onClose}
        >
            <DialogTitle>{props.title}</DialogTitle>
            <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
                <IconButton onClick={props.onClose} size="small">
                    <Close />
                </IconButton>
            </Box>
            <DialogContent className='likeTypography'>
                <MarkdownDiv 
                //  urlprefix={props.urlprefix}
                //  path={props.path}
                    body={props.body}
                />
                {/* <Typography> */}
                    {/* <ReactMarkdown children={theMarkdown}
                        remarkPlugins={[remarkGfm]}
                        linkTarget="_blank"
                    /> */}
                {/* </Typography> */}
            </DialogContent>
            <DialogActions>
                {/* not fond of this button <Button color="primary" variant="contained" onClick={props.onClose}>
                    Done
                </Button> */}
                {/* <Button color="secondary" variant="contained" onClick={props.onConfirm}>
                    Confirm
                </Button> */}
                {props.inject}
            </DialogActions>
        </Dialog>)
    );
};

export default MarkdownDialog;

// Copyright 2021-2022-2026 Alan Tracey Wootton
// See LICENSE
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.
