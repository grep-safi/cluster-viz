const squeue = require('../data/formatted-squeue.json');
const scontrol = require('../data/formatted-scontrol.json');

function hierarchyData(selectedOption, selectedLocator) {
    let option, locator;
    let locateSqueue, locateNode;
    let nList = [];

    // If the user actually selects an option
    if (selectedOption) {
        option = selectedOption.replace(/\s+/g, '');
        locator = selectedLocator;
        if (!option) option = '';
        if (!locator) locator = -1;

        const optionsArr = ['USER', 'ACCOUNT', 'JOBID'];

        locateSqueue = optionsArr.includes(option.toUpperCase());
        locateNode = option === 'node';

        for (let i = 0; i < squeue.length; i++) {
            if (squeue[i][option] === locator) {
                nList = nList.concat(squeue[i].NODELIST);
            }
        }
    }

    console.log(`optoin: ${option} locator: ${locator} and nList: ${nList}`);

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
                            nodeActive = isActive(node, nodeNum, locateSqueue, nList, locateNode, locator) ? 1 : 0;

                            nodes.push({
                                "name": `Node ${l}`,
                                "value": nodeActive,
                                "NodeName": node ? node['NodeName'] : '',
                                "nodeData": txtVal
                            });

                            jsonParseIndex += 1;
                        } else {
                            nodes.push({
                                "name": "service node",
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
                "name": `cabinet ${i}`,
                "children": chassis,
                // "value": cabinetVal
            });
        }
    }

    // Does the checks on the node to see if it should be labeled active
    function isActive(n, nNum, locateJob, nList, locateNode, nodeAttrs) {
        if (locateJob) {
            return nList.includes(n['NodeName']);
        }

        if (locateNode) {
            let bool = true;
            let attrList = nodeAttrs.split(' ');
            for (let i = 0; i < attrList.length; i++) {
                let args = attrList[i].split(',');
                bool = bool && n[args[0]] === args[1];
            }

            return bool ? 1 : 0;
        }

        return n['State'] === 'ALLOCATED' && (n['AvailableFeatures'] === 'haswell');
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

export { hierarchyData };
