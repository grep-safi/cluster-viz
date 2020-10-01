const fs = require('fs');

const outputFilename = 'formatted-squeue.json';
const outputNidToUserFile = 'nid-to-user.json';

fs.readFile('raw-data-files/oct12020squeue.txt', (err, data) => {
    if (err) throw err;

    const dataStr = data.toString().replace('  ', ' ');
    const dataArr = dataStr.split('\n');
    const formattedDataArr = [];
    const nidToUser = {};
    formattedDataArr.push('[\n')

    // Get the keys which are on the first row
    const keys = dataArr[0].split(' ');

    for (let i = 1; i < dataArr.length - 1; i++) {
        const tempStrArr = [];
        const dataLine = dataArr[i].split(' ');

        for (let j = 0; j < keys.length; j++) {
            let key = keys[j];
            let value = dataLine[j];

            if (key === 'NODELIST') {
                value = getNodeListArray(value);
                tempStrArr.push(`\"${key}\": ${value}`)
            } else {
                tempStrArr.push(`\"${key}\": \"${value}\"`)
            }
        }

        addNidsToObject(nidToUser, tempStrArr);

        const comma = i === dataArr.length - 2 ? '' : ',';
        formattedDataArr.push(`\t{ ${tempStrArr.join()} }${comma}\n`);
    }

    formattedDataArr.push(']');
    const formattedDataStr = formattedDataArr.join(' ');

    let n = JSON.stringify(nidToUser);

    fs.writeFile(outputFilename, formattedDataStr, function(err) {
        if (err) {
            return console.error(err);
        }

        console.log(`Data formatted successfully and stored in ${outputFilename} file!`);
    })

    fs.writeFile(outputNidToUserFile, n, function(err) {
        if (err) {
            return console.error(err);
        }

        console.log(`Data formatted successfully and stored in ${outputNidToUserFile} file!`);
    })
})

// Converts nodelist to an array of string node values
// E.g.  "nid[00139-00141]" becomes ["nid00139", "nid00140", "nid00141"]
function getNodeListArray(nodes) {
    let list = "";

    // Get indices of the starting and ending range of nids
    let startList = nodes.indexOf('[');
    let endList = nodes.indexOf(']');

    // If an opening bracket exists, then there must be multiple nids,
    // so this if block will parse them into an array of strings
    if (startList !== -1) {
        const nodeList = [];
        let startStr = nodes.substring(0, startList);
        list = nodes.substring(startList + 1, endList);
        const arr = list.split(',');

        // Iterate through all the nids, and push them into the array
        for (let i = 0; i < arr.length; i++) {
            let element = arr[i];
            // If there is a dash, that means the string is specifying a RANGE of
            // nids, so we must parse them in this if block
            if (element.indexOf('-') !== -1) {
                let range = element.split('-');
                // get trailing 0s
                let zeroStart = 0;
                let startingZeroes = "";
                while (parseInt(range[0].charAt(zeroStart)) === 0) {
                    zeroStart += 1;
                    startingZeroes += '0';
                }

                for (let start = range[0]; start <= range[1]; start++) {
                    const nid = startStr + startingZeroes + parseInt(start);
                    nodeList.push('\"' + nid + '\"');
                }
            }
            // Else if there was no dash, then the list wasn't specifying a range. It was specifying
            // A list of nids
            else
            {
                nodeList.push('\"' + startStr + element + '\"');
            }
        }

        return '[' + nodeList.toString() + ']';
    }
    return '[\"' + nodes + '\"]';
}

function addNidsToObject(nidObj, objectsStr) {
    let queueObjects = JSON.parse(`{${objectsStr.join()}}`);
    let nodeList = queueObjects['NODELIST'];

    // Iterate through the node list and add the other fields as an object to the
    // nidObj object
    for (let i = 0; i < nodeList.length; i++) {
        let {NODELIST, ...queueObjNoNodelist} = queueObjects;
        let node = nidObj[nodeList[i]];
        // If there's already an entry, it means more than one user is utiilzing
        // this node, so make an array of objects with the data
        if (node) {
            node.push(queueObjNoNodelist);
        } else {
            node = [queueObjNoNodelist];
        }
        nidObj[nodeList[i]] = node;
    }
}