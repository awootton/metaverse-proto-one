import * as React from 'react'
import Dialog from '@mui/material/Dialog'


import { MetaverseProtoAbout } from './A_MetaAboutCompenent';

type Props = {
  open: boolean
  onClose: () => any
  title: string
  body: string
  inject?: React.ReactElement
}

export default function AboutGotohereDialog(props: Props) {
  return (
    <Dialog open={props.open} maxWidth="sm" fullWidth
      onClose={props.onClose}
    >
      {props.inject}

      <div style={{ padding: '20px', margin: '20px' }}>
        <MetaverseProtoAbout
          heroImageSrc="/images/xYcoV.jpg"
          onLaunchDemo={() => console.log('Demo launched!')}
        />

      </div>

    </Dialog>
  );
}

// Copyright 2026 Alan Tracey Wootton
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

