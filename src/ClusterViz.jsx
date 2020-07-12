import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import SearchBar from './components/SearchBar';
import useForm from './components/useForm';
import hierarchyData from './data';
import createTreemap from './index';

const ClusterViz = () => {
    const [jobSearch, handleJobChange] = useForm({ input: "", option: "USER"});
    const [nodeSearch, handleNodeChange] = useForm({ input: "", option: "STATE"});
    const [count, setCount] = useState(0);

    const jobOptions = ['USER', 'ACCOUNT', 'JOB ID'];
    const nodeOptions = ['STATE', 'PARTITIONS', 'AVAILABLE FEATURES'];

    useEffect(() => {
        if (count === 0) createTreemap(hierarchyData());
        else createTreemap(hierarchyData(jobSearch['option'], jobSearch['input']));
    }, [count])

    return (
        <>
            <h1 id="title">Cluster Visualization</h1>

            <p>The current search: {jobSearch.input} and option: {jobSearch.option} and count: {count}</p>
            <p>The current search: {nodeSearch.input} and option: {nodeSearch.option} and count: {count}</p>
            <div>
                <SearchBar
                    searchField={jobSearch}
                    handleChange={handleJobChange}
                    handleEnter={setCount}
                    options={jobOptions}
                    searchID={"job-search"}
                    optionsID={"job-options"}
                />
            </div>
            <div>
                <SearchBar
                    searchField={nodeSearch}
                    handleChange={handleNodeChange}
                    handleEnter={setCount}
                    options={nodeOptions}
                    searchID={"node-search"}
                    optionsID={"node-options"}
                />
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
