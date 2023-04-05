import React from 'react';
import './App.css';
import Editor from './components/Editor';

function App(): React.ReactElement {
    return (
        <div className="App">
            <div className="Container">
                <Editor />
            </div>
        </div>
    );
}

export default App;
