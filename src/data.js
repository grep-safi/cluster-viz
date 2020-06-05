function createRandomActiveNodes(cabinets) {
    const numCabinets = 4;
    const numChassis = 3;
    const numBlades = 4;
    const numNodes = 4;

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
                    let nodeActive = Math.random() > 0.5 ? 1 : 0;

                    nodes.push({
                        "name": `n${l}`,
                        "value": nodeActive
                    });
                    bladeVal += nodeActive;
                }

                blades.push({
                    "name": `b${k}`,
                    "children": nodes,
                    // "value": bladeVal
                });
                chassisVal += bladeVal;
            }

            chassis.push({
                "name": `ch${j}`,
                "children": blades,
                // "value": chassisVal
            });
            cabinetVal += chassisVal;
        }

        cabinets.push({
            "name": `ca${i}`,
            "children": chassis,
            // "value": cabinetVal
        });
    }
}

const cabinets = [];
createRandomActiveNodes(cabinets); // Creates cabinets with randomly activated nodes

const info = {
    "name": "Cori",
    "children": cabinets
};

export { info };