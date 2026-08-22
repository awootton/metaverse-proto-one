
import React, { FC, ReactElement, useEffect } from 'react'
import Typography from '@mui/material/Typography';

import { Check, Copy } from 'lucide-react';

import * as utils from '../knotfree-ts-lib/3d/utils'

// material ui
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    IconButton,
} from '@mui/material';

import { Close } from '@mui/icons-material';

import TextField from '@mui/material/TextField';
import { Tooltip } from 'react-tooltip';
import { MyInputDialog } from '../knotfree-ts-lib/components/MyInputDialog';
import { localAndInWindows } from '../knotfree-ts-lib/3d/DnsTypes';

const ToolTipStyle = {
    backgroundColor: '#333',
    color: '#fff',
    fontSize: '12px',
    borderRadius: '4px',
    padding: '4px 4px',
    fontFamily: 'Arial, sans-serif' /* Sans-serif font */
}

type Props = {
    open: boolean
    onClose: () => any
    title: string
    body: string
    onConfirm: (str: string) => any
    label: string // the label of the text field
    // nope default: string // default text in the input
}

// localStorage keys used
function getKeyForPassphrase(): string {
    return "knotfree-identity-passphrase"
}
function setStoredUserPassphrase(value: string): void {
    localStorage.setItem(getKeyForPassphrase(), value)
}
function getStoredUserPassphrase(): string {
    return localStorage.getItem(getKeyForPassphrase()) || ""
}
// there will g\be keys for the whole freaking thing too.

function getKeyForGotohereIdentity(): string {
    return "knotfree-identity-all-data"
}
function setStoredIdentityData(value: string): void {
    localStorage.setItem(getKeyForGotohereIdentity(), value)
}
function getStoredIdentityData(): string {
    return localStorage.getItem(getKeyForGotohereIdentity()) || ""
}


export const IdentityDialog: FC<Props> = (props: Props): ReactElement => {

    const passInputRef = React.useRef<HTMLInputElement>(null);

    let passTemp = getStoredUserPassphrase()

    const [privateKey, setPrivateKey] = React.useState<string>('');
    const [publicKey, setPublicKey] = React.useState<string>('');
    const [isPubkCopied, setIsPubkCopied] = React.useState(false);
    const [isPhasePhraseLocked, SetPhasePhraseLocked] = React.useState(passTemp.length > 28 ? passTemp : "");
    const [reloadEverything, setReloadEverything] = React.useState(false); // a dialog

    // and we ignore the props? There are no props. "default" is for something else

    // passTemp = getStoredUserPassphrase()
    if (passTemp.length > 28) {
        // it's good. We can use it to BE the key
        // this should not be possible. We control the input.
        // thePassTextTyped = passTemp
        // and the passInputRef.current.value = thePassTextTyped
        if (passInputRef.current) {
            passInputRef.current.value = passTemp
        }
    } else {
        passTemp = ""
    }

    if (isPhasePhraseLocked.length <= 0) {
        setTimeout(() => {
            refetchPassphrase()
        }, 100)
    }

    function refetchPassphrase() {

        if (isPhasePhraseLocked != "") {
            if (passInputRef.current) {
                passInputRef.current.value = isPhasePhraseLocked
                console.log("refetchPassphrase is locked")
            }
            return; // do not refetch if the passphrase is locked
        }

        // clear everythign.
        setPublicKey('')
        setPrivateKey('')
        if (passInputRef.current) {
            passInputRef.current.value = isPhasePhraseLocked
            console.log("refetchPassphrase updated input value to: locked")
        }

        let url = 'https://knotfree.net/api1/getGiantPassword'
        // if we're local, and knotfree.net is sick, use the local server instead. 8/18/26 knotfree.net is very sick right now. Docker won't build.
        if (localAndInWindows) {
            url = 'http://localhost:8085/api1/getGiantPassword'
        }

        fetch(url)
            .then(response => response.text())
            .then(data => {
                passTemp = data || ''
                if (passInputRef.current) {
                    passInputRef.current.value = passTemp
                    console.log("refetchPassphrase updated input value to:")
                }
            })
            .catch(error => console.error('Error fetching passphrase:', error))
    }
    console.log("IdentityDialog: passTemp: ", passTemp)

    function commitPassPhrase() {
        if (passInputRef.current) {
            passTemp = passInputRef.current.value
            console.log("commitPassPhrase updated input value to:", passTemp)
            SetPhasePhraseLocked(passTemp)
            // force a re-render to update the keys
            setPublicKey('')
            setPrivateKey('')
            calcTheKeys()
        }
    }

    // useEffect(() => {
    //     // populate the pass text on init/
    //     refetchPassphrase()
    // }, [])

    // editing passInputRef.current.value
    function textPassClicked(e: React.ChangeEvent<HTMLInputElement>) {
        if (isPhasePhraseLocked != "") {
            return; // do not allow changes if the passphrase is locked
        }
        // What? Set ourselves to ourselves?
        // const str = e.currentTarget.value
        // // console.log("textPassClicked", str)
        // passTemp = str
        // if (passInputRef.current) {
        //     passInputRef.current.value = thePassTextTyped
        //     console.log("textPassClicked updated input value to:", passTemp  )
        // }
    }
    // function confirmMe() {
    //     props.onConfirm(thePassTextTyped) // who is this
    // }

    function pStyle() {
        return {
            margin: '2px 4px',
            fontSize: '16px',
            fontFamily: 'Inter, sans-serif'
        }
    }

    function btnGroupStyle() {
        return {
            display: 'flex',
            //    flexDirection: 'column',
            justifyContent: 'flex-end', /* Centers buttons on the right? */
            gap: '10px',          /* Adds space between them */
        }
    }

    return (

        <Dialog open={props.open} maxWidth="sm" fullWidth
            onClose={props.onClose}
        >
            <DialogTitle>{props.title}</DialogTitle>
            <Box sx={{ position: 'absolute', top: 0, right: 0 }} >
                <IconButton onClick={props.onClose} size="large">
                    <Close />
                </IconButton>
            </Box>
            <DialogContent>

                <Button color="secondary" variant="outlined" size="small" onClick={() => console.log("Reload clicked")}
                    sx={{ py: 0.25, px: 1, textTransform: 'none', fontSize: '0.75rem', minWidth: 'auto', marginRight: '10px' }}
                    data-tooltip-id="clear-identity">
                    Clear
                </Button>

                <Button color="secondary" variant="outlined" size="small" onClick={() => console.log("commit clicked")}
                    sx={{ py: 0.25, px: 1, textTransform: 'none', fontSize: '0.75rem', minWidth: 'auto', marginRight: '10px' }}
                    data-tooltip-id="commit-identity">
                    Commit
                </Button>

                <Button color="secondary" variant="outlined" size="small" onClick={() => console.log("reload clicked")}
                    sx={{ py: 0.25, px: 1, textTransform: 'none', fontSize: '0.75rem', minWidth: 'auto', marginRight: '10px' }}
                    data-tooltip-id="reload-identity">
                    Reload
                </Button>

                <Button color="secondary" variant="outlined" size="small" onClick={() => console.log("copy clicked")}
                    sx={{ py: 0.25, px: 1, textTransform: 'none', fontSize: '0.75rem', minWidth: 'auto', marginRight: '10px' }}
                    data-tooltip-id="copy-identity">
                    Copy To Clipboard
                </Button>

                <Button color="secondary" variant="outlined" size="small" onClick={() => console.log("download clicked")}
                    sx={{ py: 0.25, px: 1, textTransform: 'none', fontSize: '0.75rem', minWidth: 'auto', marginRight: '10px' }}
                    data-tooltip-id="down-identity">
                    Download
                </Button>


                <Tooltip id="clear-identity" place="bottom" style={ToolTipStyle}>
                    {"Wipe everything on this screen and clean the browser cache. Start fresh."}
                </Tooltip>
                <Tooltip id="commit-identity" place="bottom" style={ToolTipStyle}>
                    {"We save this to the browser cache. (is this is your secure personal device?)"}
                </Tooltip>
                <Tooltip id="reload-identity" place="bottom" style={ToolTipStyle}>
                    {"If you saved it in a file (great idea!!!) you can reload it here."}
                </Tooltip>
                <Tooltip id="copy-identity" place="bottom" style={ToolTipStyle}>
                    {"Copy all this to the clipboard. I won't let you use this permanently until you either copy or download:"}
                </Tooltip>
                <Tooltip id="down-identity" place="bottom" style={ToolTipStyle}>
                    {"Download the identity to a file. You can use this to restore your identity later."}
                </Tooltip>

                <Typography>
                    <p>
                        I'm in the business of creating The Metaverse. I don't need your email address. 
                        I'm sure it's profitable to collect them,
                        but it's also way off topic for us. 
                        What matters is who has control of what and how do we cancel people who are just ruining things for everyone.
                    </p>
                    <p> A passphrase is required, and you must keep it secret. It is used to generate your private key, 
                        which is used to sign your possibly FAKE identity.
                        If you lose it, you lose your identity. 
                        If you share it, you give away your identity. 
                        I'll make that post, and start that discussion, when this becomes live.
                    </p>
                    <p>Please note that as the ownership of spaces and Avatars becomes more formal (like a web page) the powers that be are going to require that you establish a verified identity. </p>
                </Typography>


                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
                    <TextField id="passphrase-input"
                        autoFocus
                        inputRef={passInputRef}
                        onChange={textPassClicked}
                        // id="outlined-helperText"
                        // label={props.label}
                        defaultValue={"dummy, what is this"}
                        helperText=""
                        size="small"

                        multiline
                        rows={3}

                        style={{ ...pStyle(), width: '75%' }}
                    />

                    <div className="btn-group" style={{ ...btnGroupStyle(), flexDirection: 'column' }} >
                        <Button color="secondary" variant="outlined" size="small" onClick={() => {
                            refetchPassphrase()
                        }}
                            sx={{ py: 0.25, px: 1, textTransform: 'none', fontSize: '0.75rem', minWidth: 'auto' }} >
                            Reload
                        </Button>
                        <Button color="secondary" variant="outlined" size="small" onClick={commitPassPhrase}
                            sx={{ py: 0.25, px: 1, textTransform: 'none', fontSize: '0.75rem', minWidth: 'auto' }} >
                            Commit
                        </Button>
                    </div>
                </div>

                {havePubKeyContent()}

                {getToken()}

                {getIdentity()}

                {ListOfEntitites()}


                {/* <Typography>{props.body}</Typography> */}
                {/* <div className="likeTypography" style={pStyle()}>{props.body}</div>
                <br />
                <TextField
                    autoFocus
                    onChange={textClicked}
                    // id="outlined-helperText"
                   // label={props.label}
                    defaultValue={props.default}
                    helperText=""
                    fullWidth
                /> */}
            </DialogContent>
            {/* <DialogActions>
                <Button color="primary" variant="contained" onClick={props.onClose}>
                    Cancel
                </Button>
                <Button color="secondary" variant="contained" onClick={confirmMe}>
                    Confirm
                </Button>
                {props.inject}
            </DialogActions> */}

            <MyInputDialog
                open={reloadEverything}
                onClose={() => setReloadEverything(false)}
                title="Add new Identity content."
                body="This will wipe the current passphrase and keys and reload the new passphrase and keys of this whold dialog."
                onConfirm={(str: string) => {

                    console.log("MyInputDialog onConfirm: updated input value to:", str)

                    // if (passInputRef.current) {
                    //     // const pass = passInputRef.current.value;
                    //     // Call your function to reload the passphrase and keys here
                    //     passInputRef.current.value = str
                    //     console.log("MyInputDialog onConfirm: updated input value to:", str)

                    //     // setPrivateKey('')
                    //     // setPublicKey('')
                    //     // setIsPubkCopied(false)
                    // }
                }}
                label=""
                default=""
            />
        </Dialog>
    );

    // still in the function.

    function havePubKeyContent() {
        // we have a passphrase so we can have the keys.
        // if we have the keys then we can show the next part of the form.
        const passPhrase = passInputRef.current
        if (!passPhrase || !passPhrase.value) {
            console.log("havePubKeyContent: no passphrase found")
            return null
        }

        if (publicKey && publicKey.length > 0) {

            // now we have a pub key so we can keep going.

            return (
                <div style={{ marginTop: '10px' }}>
                    <Typography>
                        <p>Public Key: {publicKey}</p>
                    </Typography>

                    <button
                        onClick={handleCopy}
                        style={{ ...styles.button, ...(isPubkCopied ? styles.buttonSuccess : {}) }}
                        title="Copy to clipboard"
                    >
                        {isPubkCopied ? (
                            <>
                                <Check size={16} color="#22c55e" />
                                <span style={styles.labelSuccess}>Copied!</span>
                            </>
                        ) : (
                            <>
                                <Copy size={16} />
                                <span style={styles.label}>Copy</span>
                            </>
                        )}
                    </button>
                </div>
            )
        }
    }

    function getToken() {

        // if we are not elegible for a token then return

        // if don't have one, make it. Show it here

        // do we have a token? are
        return (
            <div style={{ marginTop: '10px' }}>
                <Typography>
                    <p>..token? .</p>
                </Typography>
            </div>
        )
    }

    function getIdentity() {
        return (
            <div style={{ marginTop: '10px' }}>
                <Typography>
                    <p> </p>
                    <p> </p>
                </Typography>
            </div>
        )
    }


    function calcTheKeys() {

        const passPhrase = passInputRef.current
        if (!passPhrase || !passPhrase.value) {
            console.log("calcTheKeys: no passphrase found")
            return
        }

        const pass = passPhrase.value

        const keypair = utils.getBoxKeyPairFromPassphrase(pass)

        const keyPairBase64 = utils.KeypairToBase64(keypair)
        const pubk = keyPairBase64[0]
        const priv = keyPairBase64[1]
        // console.log("pubk", pubk)
        // console.log("priv", priv)
        if (pubk != publicKey || priv != privateKey) { // or else it will keep re-rendering and never stop.
            setPublicKey(pubk)
            setPrivateKey(priv)
        }
    }


    function handleCopy() {
        return (async () => {
            try {
                // Writes text directly to the user's clipboard
                const textToCopy = publicKey; // Replace with the text you want to copy
                await navigator.clipboard.writeText(textToCopy);
                setIsPubkCopied(true);

                // Revert button text back after 2 seconds
                setTimeout(() => setIsPubkCopied(false), 2000);
            } catch (err) {
                console.error('Failed to copy text: ', err);
            }
        })();
    }

    function ListOfEntitites() {

        //
        return (
            <div style={{ marginTop: '10px' }}>
                <Typography>
                    <p>..list of stuff bots, spaces, etc. and other stuff you own.</p>
                </Typography>
            </div>
        )
    }
};




type id_schema = {
    personal: {

        name: string, // required, the name of the person or entity. can be fake.
        passphrase: string, // required, a passphrase that is used to generate the private key.
        publicKey: string, // required, Hidden. the public key that is generated from the passphrase. This is what is used to verify the identity.
        privateKey: string, // required, Never shown. 
        accessToken: string, // Permissions from knotfree. It rations number of spaces you can own. 

        // these are all optional, but hidden. 
        email: string, // optional, the email address of the person or entity. Must not be fake. secret
        phone: string, // optional, the phone number of the person or entity. Must not be fake. secret
        address: string, // optional, the address of the person or entity. Must not be fake. secret

        responsibleOtherPartyEmail: string, // optional, like a wife. secret
        responsibleOtherPartyPhone: string, // optional, like a wife. secret
        responsibleOtherPartyAddress: string, // optional, like a wife. secret
    }
    // How are bots and Avatars different? Unless you can prove you're a person...
    // these all look the same except for the name of the space. 
    spaces: {
        passphrase: string, // required, a passphrase that is used to generate the private key. secret
        publicKey: string, // required, PUBLIC. the public key that is generated from the passphrase. This is what is used to verify the identity.
        privateKey: string, // required, Never shown.}
        owner: string, // required, PUBLIC the public key of the person or entity that owns the space. This is YOUR pubk.
        webAddress: string, // optional, PUBLIC the web address of the space. Either .vr name or an .xyz name.
    },
    avatars: {
        passphrase: string, // required, a passphrase that is used to generate the private key.
        publicKey: string, // required, PUBLIC. the public key that is generated from the passphrase. This is what is used to verify the identity.
        privateKey: string, // required, Never shown.}
        owner: string, // required, PUBLIC the public key of the person or entity that owns the space. This is YOUR pubk.
        webAddress: string, // required, PUBLIC the web address of the space. Any valid domain or subdomain name.
    },
    bots: {
        passphrase: string, // required, a passphrase that is used to generate the private key.
        publicKey: string, // required, PUBLIC. the public key that is generated from the passphrase. This is what is used to verify the identity.
        privateKey: string, // required, Never shown.}
        owner: string, // required, PUBLIC the public key of the person or entity that owns the space. This is YOUR pubk.
        webAddress: string, // required, PUBLIC the web address of the space. Any valid domain or subdomain name.

    }
}

// Basic inline styles for quick preview
const styles = {
    container: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '12px',
        padding: '8px 12px',
        backgroundColor: '#f3f4f6',
        borderRadius: '6px',
        fontFamily: 'sans-serif',
        border: '1px solid #e5e7eb'
    },
    textPreview: {
        fontSize: '14px',
        color: '#374151',
    },
    button: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        backgroundColor: '#ffffff',
        border: '1px solid #d1d5db',
        borderRadius: '4px',
        padding: '6px 10px',
        cursor: 'pointer',
        fontSize: '13px',
        fontWeight: '500',
        color: '#4b5563',
        transition: 'all 0.2s ease',
    },
    buttonSuccess: {
        borderColor: '#bbf7d0',
        backgroundColor: '#f0fdf4',
    },
    label: {
        color: '#4b5563',
    },
    labelSuccess: {
        color: '#16a34a',
    }
};

// Copyright 2021-2022,2026 Alan Tracey Wootton
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
