const fs = require('fs')

const outputFilename = 'formatted-scontrol.json';

fs.readFile('raw-data-files/scontrol.txt', (err, data) => {
    if (err) throw err;

    const dataStr = data.toString();
    const dataArr = dataStr.split('\n');
    const formattedDataArr = [];
    formattedDataArr.push('[\n')

    for (let i = 0; i < dataArr.length - 1; i++) {
        const str = dataArr[i];
        const comma = i === dataArr.length - 2 ? '' : ',';

        const dataLine = formatData(str, comma);
        formattedDataArr.push(`\t${dataLine}\n`);
    }

    formattedDataArr.push(']');
    const formattedDataStr = formattedDataArr.join(' ');

    // If the following throws an error, then the formattedDataStr is not in JSON format
    JSON.parse(formattedDataStr);

    fs.writeFile(outputFilename, formattedDataStr, function(err) {
        if (err) {
            return console.error(err);
        }

        console.log(`Data formatted successfully and stored in formattedSControl.txt file!`);
    })
});

function formatData(string, comma) {
    let modifiedStr = string.replace(/  /g, ' ');
    const originalStrArr = modifiedStr.split(' ');

    handleReasonField(originalStrArr);

    const modifiedStringFields = [];
    modifiedStringFields.push('{');

    // If the last item in the string is just an empty space, then we
    // don't want to apply any transformations to it so don't include it
    const len = originalStrArr[originalStrArr.length - 1] === "" ? originalStrArr.length - 1 : originalStrArr.length;

    // Find the indices of the array which correspond to the undesirable field
    // start position and end position
    let startExclusion = indexOfKey(originalStrArr, 'OS=');
    let endExclusion = indexOfKey(originalStrArr, 'RealMemory=');

    if (startExclusion === -1) {
        startExclusion = len + 1;
        endExclusion = len + 1;
    }

    for (let i = 0; i < len; i++) {
        // We don't want to include the OS= field in our transformations
        if (!(i >= startExclusion && i < endExclusion)) {
            let entry = originalStrArr[i];
            entry = entry.replace(/=/, "\": \"");
            entry = entry.replace(entry, `\"${entry}`);

            // If this is the last entry in the string, then don't add the comma at the end
            let endStr = i === len - 1 ? `${entry}\"` : `${entry}\",`;
            entry = entry.replace(entry, endStr);

            modifiedStringFields.push(entry);
        }
    }

    // Add ending curly brace
    modifiedStringFields.push(` }${comma}`);
    // Join with space between each key-value pair
    modifiedStr = modifiedStringFields.join(' ');
    // Parse with json
    // let jsonStr = JSON.parse(modifiedStr);

    return modifiedStr;
}

function indexOfKey(arr, targetStr) {
    for (let i = 0; i < arr.length; i++) {
        const str = arr[i];
        if (str.includes(targetStr)) {
            return i;
        }
    }

    return -1;
}

function handleReasonField(arr) {
    let index = indexOfKey(arr, 'Reason');
    if (index !== -1) {
        let reasonMessage = "";
        let len = arr.length;
        for (let i = index; i < len - 1; i++) {
            let str = ` ${arr.pop()}`;
            reasonMessage = str.concat(`${reasonMessage}`);
        }

        arr[index] = arr[index].concat(`${reasonMessage}`);
    }
}
