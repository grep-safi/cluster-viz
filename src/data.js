const squeue = require('../data/formatted-squeue.json');
const scontrol = require('../data/formatted-scontrol.json');

export default (jobEntries, nodeEntries) => {
    let nList = [];

    // Get a list of nids that correspond to the entered search string in the jobs json file
    for (let entry = 0; entry < jobEntries.length; entry++) {
        const option = jobEntries[entry]['option'].replace(/\s+/g, '');
        const searchStr = jobEntries[entry]['input'];

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
                            nodeActive = isActive(nList, node, nodeEntries) ? 1 : 0;

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
    function isActive(nList, node, nodeEntries) {
        // If the length of nList is 0, then the user isn't looking for jobs, so set it to true
        const jobNode = nList.length === 0 ? true : nList.includes(node['NodeName']);

        let bool = true;
        for (let entry = 0; entry < nodeEntries.length; entry++) {
            const nodeValue = node[nodeEntries[entry]['option']].toUpperCase();
            const userValue = nodeEntries[entry]['input'].toUpperCase();

            bool = bool && nodeValue.includes(userValue);
        }

        return bool && jobNode;
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
