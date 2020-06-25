import { data } from './jsonData';
import { squeue } from './parseNodelists';
import { scontrol } from './scontrol-data';
// import { squeue } from './squeue-data';

// Three node states: down, allocated, idle
let option = 'USER';
// let option = 'ACCOUNT';
// let option = 'JOBID';

const locator = "slrath";
let nList = [];

for (let i = 0; i < squeue.length; i++) {
    if (squeue[i][option] === locator) {
        nList = nList.concat(squeue[i].NODELIST);
    }
}

console.log(`locator: ${locator} and nList: ${nList}`);

function hierarchyData(data) {
    let jsonParseIndex = 0;

    let maxCabinet = 0;
    let maxChassis = 0;
    let maxBlade = 0;
    let maxNode = 0;

    function createRandomActiveNodes(cabinets) {
        const numCabinets = 68;// actual = 68
        const numChassis = 3; // actual = 3
        const numBlades = 16;  // actual = 16
        const numNodes = 4;   // actual = 4



        for (let i = 0; i < numCabinets; i++) {                         // First for loop creates cabinets with cabinet vals
            const chassis = [];
            let cabinetVal = 0;

            for (let j = 0; j < numChassis; j++) {                      // Second for loop creates chassis with chassis vals
                const blades = [];
                let chassisVal = 0;

                for (let k = 0; k < numBlades; k++) {                   // Third for loop creates blades with blade vals
                    const nodes = [];
                    let bladeVal = 0;

                    for (let l = 0; l < numNodes; l++) {                // Fourth for loop creates nodes with node vals (random)

                        // let probabilityOfActiveNode = 0.50; // 50% chance a given node will be active
                        let nodeActive = 0;

                        let txtVal = getStr(data[jsonParseIndex]);
                        let node = data[jsonParseIndex];
                        if (node) {
                            // nodeActive = node['State'] === 'ALLOCATED' ? 1 : 0;
                            nodeActive = 0;

                            if (nList.indexOf(node['NodeName']) !== -1) {
                            }
                            if (node['State'] === 'ALLOCATED' && (nList.indexOf(node['NodeName']) !== -1)) {
                                console.log(`nodenaes: ${node['NodeName']} and state: ${node['State']}`);
                                nodeActive = 1;
                            }
                        }

                        nodes.push({
                            "name": `Node ${l}`,
                            "value": nodeActive,
                            "NodeName": node ? node['NodeName'] : '',
                            "nodeData": txtVal
                        });
                        jsonParseIndex += 1;

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

    const cabinets = [];
    createRandomActiveNodes(cabinets); // Creates cabinets with randomly activated nodes

    function getStr(dataLine) {
        if (!dataLine) return 'undefined';

        let txt = '';

        for (const property in dataLine) {
            txt = txt.concat(`${property}: ${dataLine[property]}<br />`);
        }

        return txt;
    }

    const info = {
        "name": "Cori",
        "children": cabinets,
        "maxCabinet": maxCabinet,
        "maxChassis": maxChassis,
        "maxBlade": maxBlade,
    };

    return info;
}

// let info = hierarchyData(data);

// let arr = getNodeAddr('nid00064');
// getNodeAddr('nid00597');

// let i = arr[0];
// let j = arr[1];
// let k = arr[2];
// let l = arr[3];

// let i = 0
// let j = 0
// let k = 0
// let l = 0

// console.log(`indices: i: ${i} j: ${j} k: ${k} l: ${l}`);
// console.log(`nodename: ${info.children[i].children[j].children[k].children[l].NodeName}`);

// 68 cabinets, 3 chassis, 16 blades, 4 nodes
function getNodeAddr(nid) {
    let firstNum = 9;
    const numCabinets = 68;// actual = 68
    const numChassis = 3; // actual = 3
    const numBlades = 16;  // actual = 16
    const numNodes = 4;   // actual = 4

    let id = parseInt(nid.substring(nid.indexOf('d') + 1, nid.length));
    id -= firstNum;

    let node = id % numNodes;
    let blade = Math.floor(id / numNodes);
    let chassis = Math.floor(blade / numBlades);
    let cabinet = Math.floor(chassis / numChassis);

    blade = blade % numBlades;
    chassis = chassis % numChassis;
    cabinet = cabinet % numCabinets;

    return [cabinet,chassis,blade,node];
}
// export { info };
export { hierarchyData };
