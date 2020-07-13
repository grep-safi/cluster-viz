import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import SearchBar from './components/SearchBar';
import useForm from './components/useForm';
import hierarchyData from './data';
import createTreemap from './index';
import { nodeOptions, jobOptions } from "./utils/Options";

const ClusterViz = () => {
    const [jobSearch, handleJobChange] = useForm([{ input: "", option: "USER"}]);
    const [nodeSearch, handleNodeChange] = useForm([{ input: "", option: "State"}]);
    const [count, setCount] = useState(0);

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
                    name="remove node"
                    id="addnode"
                    onClick={() => handleJobChange('STATE', 1, false, true)}
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
                    id="addnode"
                    onClick={() => handleNodeChange('STATE', 1, false, true)}
                >
                    X
                </button>
            </div>
        );
    }

    return (
        <>
            <h1 id="title">Cluster Visualization</h1>

            <div id="search-wrapper">
                <div id="job-search">
                    { jobArr }

                    <button
                        name="add job"
                        id="add-job"
                        onClick={() => handleJobChange('USER', 1, true, false)}
                    >
                        Add job
                    </button>

                </div>

                <div id="node-search">
                    { nodeArr }

                    <button
                        name="add node"
                        id="add-node"
                        onClick={() => handleNodeChange('STATE', 1, true, false)}
                    >
                        Add node
                    </button>

                </div>
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
