import { data } from './jsonData';
import { scontrol } from './scontrol-data';
import { squeue } from './squeue-data';

// Three node states: down, allocated, idle

function hierarchyData(data) {
    let jsonParseIndex = 0;

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
                        if (data[jsonParseIndex]) {
                            nodeActive = data[jsonParseIndex]['State'] === 'ALLOCATED' ? 1 : 0;
                        }

                        nodes.push({
                            "name": `Node ${l}`,
                            "value": nodeActive,
                            "nodeData": txtVal
                        });
                        jsonParseIndex += 1;
                        bladeVal += nodeActive;
                    }

                    blades.push({
                        "name": `Blade ${k}`,
                        "children": nodes,
                        // "value": bladeVal
                    });
                    chassisVal += bladeVal;
                }

                chassis.push({
                    "name": `Chassis ${j}`,
                    "children": blades,
                    // "value": chassisVal
                });
                cabinetVal += chassisVal;
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

        // let txt = `NodeName: ${dataLine['NodeName']}<br />`;
        // txt = txt.concat(`State: ${dataLine['State']}<br />`);
        // txt = txt.concat(`CPULoad: ${dataLine['CPULoad']}<br />`);
        // txt = txt.concat(`FreeMem: ${dataLine['FreeMem']}<br />`);
        // if (dataLine['Reason']) txt = txt.concat(`Reason: ${dataLine['Reason']}<br />`);

        for (const property in dataLine) {
            txt = txt.concat(`${property}: ${dataLine[property]}<br />`);
        }

        // txt.concat(`${'NodeName'}: ${dataLine['NodeName']}<br />`);
        // txt.concat(`${'State'}: ${dataLine['State']}<br />`);
        // txt.concat(`${'Arch'}: ${dataLine['Arch']}<br />`);

        return txt;
    }

    const info = {
        "name": "Cori",
        "children": cabinets
    };

    return info;
}

let info = hierarchyData(data);

// export { info };
export { hierarchyData };
