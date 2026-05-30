import { createRoot } from 'react-dom/client'
import * as React from 'react'
import './styles.css'
import App from './App'

// createRoot(document.getElementById('root')).render(<App />)
const rootElement = document.getElementById('root')
if (rootElement != null) {
    const root = createRoot(rootElement);
    if (root !== null) {
        root.render(
            <React.StrictMode>
                <App/>
            </React.StrictMode>
        );
    } else {
        throw new Error('Could not create root element')
    }
} else {
    throw new Error('Could not find root element')
}

