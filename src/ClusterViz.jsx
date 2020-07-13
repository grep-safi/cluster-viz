import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import SearchBar from './components/SearchBar';
import useForm from './components/useForm';
import hierarchyData from './data';
import createTreemap from './index';

const ClusterViz = () => {
    const [jobSearch, handleJobChange] = useForm([{ input: "", option: "USER"}]);
    const [nodeSearch, handleNodeChange] = useForm([{ input: "", option: "State"}]);
    const [count, setCount] = useState(0);

    const jobOptions = ['USER', 'ACCOUNT', 'JOB ID'];
    const nodeOptions = ['State', 'Partitions', 'Available Features'];

    useEffect(() => {
        if (count === 0) createTreemap(hierarchyData([], [{ input: "", option: "State"}]));
        else createTreemap(hierarchyData(jobSearch, nodeSearch));
    }, [count]);

    let jobArr = [];
    let nodeArr = [];

    // TODO Add better identifier keys for React as a field in each element
    // TODO Simplify the double for loops with a while loop and extract the React code into a function
    for (let i = 0; i < jobSearch.length; i++) {
        jobArr.push(
            <>
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
                    name="remove node"
                    id="addnode"
                    onClick={() => handleJobChange('STATE', 1, false, true)}
                >
                    X
                </button>
            </>
        );
    }

    for (let i = 0; i < nodeSearch.length; i++) {
        nodeArr.push(
            <>
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
                    id="addnode"
                    onClick={() => handleJobChange('STATE', 1, false, true)}
                >
                    X
                </button>
            </>
        );
    }

    return (
        <>
            <h1 id="title">Cluster Visualization</h1>

            <div>
                { jobArr }
            </div>

            <div>
                { nodeArr }
            </div>

            <button
                name="enter"
                id="enter-button"
                onClick={() => setCount(c => c + 1)}
            >
                Enter
            </button>

            <p id="currentPosition"> hello </p>

            <div id="container">
                <div id="data-viz" />
                <div id="div_template" />
            </div>
        </>
    );
}

const domContainer = document.querySelector('#root');
ReactDOM.render(<ClusterViz />, domContainer);
