const fs = require('fs')

fs.readFile('data-files/squeue-output.txt', (err, data) => {
    if (err) throw err;

    const dataStr = data.toString().replace('  ', ' ');
    const dataArr = dataStr.split('\n');
    const formattedDataArr = [];
    formattedDataArr.push('[\n')

    // Get the keys which are on the first row
    const keys = dataArr[0].split(' ');

    for (let i = 1; i < dataArr.length - 1; i++) {
        const tempStrArr = [];
        const dataLine = dataArr[i].split(' ');

        for (let j = 0; j < keys.length; j++) {
            tempStrArr.push(`\"${keys[j]}\": \"${dataLine[j]}\"`)
        }

        const comma = i === dataArr.length - 2 ? '' : ',';
        formattedDataArr.push(`\t{ ${tempStrArr.join()} }${comma}\n`);
        // formattedDataArr.push(`\t{ ${tempStrArr.join()} },\n`);
        // formattedDataArr.push(`\t{ ${tempStrArr.join()} }${','}\n`);
    }

    formattedDataArr.push(']');
    const formattedDataStr = formattedDataArr.join(' ');
    const jsonFormat = JSON.parse(formattedDataStr);
    console.log(`${jsonFormat[34]['CPUS']}`);
})



// const str = "JOBID USER ACCOUNT NODELIST\n" +
//     "31689060 mjd majorana nid00592\n" +
//     "31689987 vjmeraz m3631 nid00010\n" +
//     "31689820 srinirag mp107 nid00232\n" +
//     "31689760 mmagana desi nid00013\n" +
//     "31689631 florianj m3272 nid00[251-254]";
// // formatData(str);
//
// const arr = str.split('\n');
// for (let i = 0; i < arr.length; i++) {
//     console.log(`arr stuff: ${arr[i]}`);
// }
//
//
// function formatData(string) {
//     let modifiedStr = string.replace(/  /g, ' ');
//     // Index 12-22 are not needed
//     const originalStrArr = modifiedStr.split(' ');
//
//     // Find the indices of the array which correspond to the undesirable field
//     // start position and end position
//     let startExclusion = indexOfKey(originalStrArr, 'OS=');
//     let endExclusion = indexOfKey(originalStrArr, 'RealMemory=');
//
//     const modifiedStringFields = [];
//     modifiedStringFields.push('{');
//
//     // If the last item in the string is just an empty space, then we
//     // don't want to apply any transformations to it so don't include it
//     const len = originalStrArr[originalStrArr.length - 1] === "" ? originalStrArr.length - 1 : originalStrArr.length;
//     for (let i = 0; i < len; i++) {
//         // We don't want to include the OS= field in our transformations
//         if (!(i >= startExclusion && i < endExclusion)) {
//             let entry = originalStrArr[i];
//             entry = entry.replace(/=/, "\": \"");
//             entry = entry.replace(entry, `\"${entry}`);
//
//             // If this is the last entry in the string, then don't add the comma at the end
//             let endStr = i === len - 1 ? `${entry}\"` : `${entry}\",`;
//             entry = entry.replace(entry, endStr);
//
//             modifiedStringFields.push(entry);
//         }
//     }
//
//     // Add ending curly brace
//     modifiedStringFields.push(' }');
//     // Join with space between each key-value pair
//     modifiedStr = modifiedStringFields.join(' ');
//     // Parse with json
//     let jsonStr = JSON.parse(modifiedStr);
// }
//
// function indexOfKey(arr, targetStr) {
//     for (let i = 0; i < arr.length; i++) {
//         const str = arr[i];
//         if (str.includes(targetStr)) {
//             return i;
//         }
//     }
//
//     return -1;
// }