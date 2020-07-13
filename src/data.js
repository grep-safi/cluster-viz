const squeue = require('../data/formatted-squeue.json');
const scontrol = require('../data/formatted-scontrol.json');

export default (jobEntries, nodeEntries) => {
    let nList = [];

    // if (jobEntries) {
    // }

    // Get a list of nids that correspond to the entered search string in the jobs json file
    for (let entry = 0; jobEntries && entry < jobEntries.length; entry++) {
        const option = jobEntries[entry]['option'].replace(/\s+/g, '');
        const searchStr = jobEntries[entry]['input'];

        // If the user inputted empty space, just skip the search
        if (searchStr.replace(/\s+/g, '').length === 0) continue;
        for (let i = 0; i < squeue.length; i++) {
            if (squeue[i][option] === searchStr) {
                nList = nList.concat(squeue[i]['NODELIST']);
            }
        }
    }

    let jsonParseIndex = 0;

    let maxCabinet = 0;
    let maxChassis = 0;
    let maxBlade = 0;
    function generateNodeHierarchy(cabinets) {

        const numCabinets = 68;
        const numChassis = 3;
        const numBlades = 16;
        const numNodes = 4;

        let nodeNum = 0;
        for (let i = 0; i < numCabinets; i++) {
            const chassis = [];
            let cabinetVal = 0;

            for (let j = 0; j < numChassis; j++) {
                const blades = [];
                let chassisVal = 0;

                for (let k = 0; k < numBlades; k++) {
                    const nodes = [];
                    let bladeVal = 0;

                    for (let l = 0; l < numNodes; l++) {
                        let nodeActive = 0;

                        let txtVal = getStr(scontrol[jsonParseIndex]);
                        let node = scontrol[jsonParseIndex];
                        // If node is a compute node, add it to hierarchy tree, else it is an 'invisible' service node
                        // So add a dummy node to the tree
                        if (getNodeID(node['NodeName']) === nodeNum) {
                            // Check if the node is active
                            nodeActive = isActive(nList, node, nodeEntries, jobEntries) ? 1 : 0;

                            nodes.push({
                                "name": `Node ${l}`,
                                "value": nodeActive,
                                "NodeName": node ? node['NodeName'] : '',
                                "nodeData": txtVal
                            });

                            jsonParseIndex += 1;
                        } else {
                            nodes.push({
                                "name": "Service Node",
                                "value": 0,
                            });
                        }

                        nodeNum += 1;

                        bladeVal += nodeActive;
                        maxBlade = Math.max(bladeVal, maxBlade);
                    }

                    blades.push({
                        "name": `Blade ${k}`,
                        "children": nodes,
                        // "value": bladeVal
                    });
                    chassisVal += bladeVal;
                    maxChassis = Math.max(chassisVal, maxChassis);
                }

                chassis.push({
                    "name": `Chassis ${j}`,
                    "children": blades,
                    // "value": chassisVal
                });
                cabinetVal += chassisVal;
                maxCabinet = Math.max(cabinetVal, maxCabinet);
            }

            cabinets.push({
                "name": `Cabinet ${i}`,
                "children": chassis,
                // "value": cabinetVal
            });
        }
    }

    // checks the node to see if it should be labeled active
    function isActive(nList, node, nodeEntries, jobEntries) {
        // If there are no nodes and the node input is empty then they're not searching for anything
        if (nList.length === 0 && isEmptyInput(nodeEntries)) return false;

        // If the length of nList is 0 and jobEntries is an empty input,
        // then the user isn't looking for jobs, so set it to true
        const jobNode = nList.length === 0 && isEmptyInput(jobEntries) ? true : nList.includes(node['NodeName']);

        // if (!nodeEntries) return jobNode;

        let bool = true;
        for (let entry = 0; entry < nodeEntries.length; entry++) {
            // console.log(`im running for states`);
            const field = nodeEntries[entry]['option'].replace(/\s+/g, '');
            const nodeValue = node[field].toUpperCase();
            const userValue = nodeEntries[entry]['input'].toUpperCase();

            // If the user inputs whitespace or nothing, just skip
            if (userValue.replace(/\s+/g, '').length === 0) continue;

            bool = bool && nodeValue.includes(userValue);
        }

        return bool && jobNode;
    }

    // Check if the entries array has empty inputs
    function isEmptyInput(entries) {
        if (!entries) return false;
        if (entries.length === 1 && entries[0]['input'].replace(/\s+/g, '').length === 0) return true;

        return entries.length === 0;
    }

    // Returns an html string with all of the data in the node
    function getStr(dataLine) {
        if (!dataLine) return 'undefined';

        let txt = '';

        for (const property in dataLine) {
            if (dataLine.hasOwnProperty(property)) {
                txt = txt.concat(`${property}: ${dataLine[property]}<br />`);
            }
        }

        return txt;
    }

    // Returns the number of the Node ID
    function getNodeID(str) {
        return parseInt(str.substring(str.indexOf('d') + 1, str.length));
    }

    const cabinets = [];
    generateNodeHierarchy(cabinets); // Creates cabinets with randomly activated nodes

    return {
        "name": "Cori",
        "children": cabinets,
        "maxCabinet": maxCabinet,
        "maxChassis": maxChassis,
        "maxBlade": maxBlade,
    };
}
