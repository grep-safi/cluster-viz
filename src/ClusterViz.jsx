import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import SearchBar from './components/SearchBar';
import useForm from './components/useForm';
import hierarchyData from './data';
import createTreemap from './index';
import { nodeOptions, jobOptions, nodeDisplayAttributes } from "./utils/Options";

const ClusterViz = () => {
    const [jobSearch, handleJobChange] = useForm([{ input: "", option: "USER"}]);
    const [nodeSearch, handleNodeChange] = useForm([{ input: "", option: "State"}]);
    const [count, setCount] = useState(0);

    const initialDisplay = {};
    nodeDisplayAttributes.forEach(e => {
        // const display = ['NodeName', 'CPUAlloc', 'CPUTot', 'CPULoad', 'RealMemory', 'AllocMem', 'FreeMem',
        // 'State', 'Partitions', 'Job ID', 'Account', 'User'];
        const display = [];

        initialDisplay[e] = display.includes(e);
    });
    const [checkedItems, setCheckedItems] = useState(initialDisplay);

    const handleCheckboxChange = (event) => {
        setCheckedItems(
            {
                ...checkedItems,
                [event.target.name]: event.target.checked
            }
        );
    }

    useEffect(() => {
        if (count === 0) createTreemap(hierarchyData([], [{ input: "", option: "State"}]), checkedItems);
        else createTreemap(hierarchyData(jobSearch, nodeSearch), checkedItems);
    }, [count]);

    const jobArr = [];
    const nodeArr = [];
    const checkBoxes = [];

    // TODO Add better identifier keys for React as a field in each element
    // TODO Simplify the double for loops with a while loop and extract the React code into a function
    for (let i = 0; i < jobSearch.length; i++) {
        jobArr.push(
            <div>
                <SearchBar
                    searchField={jobSearch[i]}
                    handleChange={handleJobChange}
                    handleEnter={setCount}
                    options={jobOptions}
                    searchID={`job-search-${i}`}
                    optionsID={`job-options-${i}`}
                    index={i}
                />

                <button
                    name="remove job"
                    id="remove-job"
                    onClick={() => handleJobChange('USER', i, false, true, setCount)}
                >
                    X
                </button>
            </div>
        );
    }

    for (let i = 0; i < nodeSearch.length; i++) {
        nodeArr.push(
            <div>
                <SearchBar
                    searchField={nodeSearch}
                    handleChange={handleNodeChange}
                    handleEnter={setCount}
                    options={nodeOptions}
                    searchID={`node-search-${i}`}
                    optionsID={`node-options-${i}`}
                    index={i}
                />

                <button
                    name="remove node"
                    id="remove-node"
                    onClick={() => handleNodeChange('State', i, false, true, setCount)}
                >
                    X
                </button>
            </div>
        );
    }

    for (let i = 0; i < nodeDisplayAttributes.length; i++) {
        checkBoxes.push(
            <div>
                <input
                    type="checkbox"
                    id={`display-attr-${i}`}
                    className="checkbox"
                    name={nodeDisplayAttributes[i]}
                    checked={checkedItems[nodeDisplayAttributes[i]] || false}
                    onChange={handleCheckboxChange}
                />

                <label
                    htmlFor={`display-attr-${i}`}
                    className="checkbox-label"
                >
                    {nodeDisplayAttributes[i]}
                </label>
            </div>
        );
    }

    return (
        <>
            <h1 id="title">Cluster Visualization</h1>

            <div id="search-wrapper">
                <div id="job-search">
                    Job
                    { jobArr }

                    <button
                        name="add job"
                        id="add-job"
                        onClick={() => handleJobChange('USER', 1, true, false, setCount)}
                    >
                        Add job
                    </button>

                </div>

                <div id="node-search">
                    Node
                    { nodeArr }

                    <button
                        name="add node"
                        id="add-node"
                        onClick={() => handleNodeChange('State', 1, true, false, setCount)}
                    >
                        Add node
                    </button>

                </div>

            </div>


            <div className="apply-button-wrapper">
                <button
                    name="apply changes"
                    id="apply-changes"
                    onClick={() => setCount(c => c + 1)}
                >
                    Apply Changes
                </button>
            </div>

            <p id="currentPosition" />

            <div className="main-wrapper">
                <div className="checkboxes">
                    <p id="display-options-text">Display Options</p>
                    <div className="checkbox-wrapper">
                        { checkBoxes }
                    </div>
                </div>

                <div id="main-container">
                    <div id="data-viz" />
                </div>

            </div>
        </>
    );
}

const domContainer = document.querySelector('#root');
ReactDOM.render(<ClusterViz />, domContainer);
