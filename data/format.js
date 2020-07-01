const str = 'NodeName=nid00040 Arch=x86_64 CoresPerSocket=16  CPUAlloc=0 CPUTot=64 CPULoad=0.00 AvailableFeatures=haswell ' +
    'ActiveFeatures=haswell Gres=craynetwork:4,preemptable:1 NodeAddr=nid00040 NodeHostName=nid00040 Version=19.05.6 i' +
    'OS=Linux 4.12.14-150.17_5.0.90-cray_ari_c #1 SMP Tue Apr 28 21:17:03 UTC 2020 (3e6e478)  RealMemory=120832 AllocMem=0 ' +
    'FreeMem=120750 Sockets=2 Boards=1 State=DOWN ThreadsPerCore=2 TmpDisk=0 Weight=1000 Owner=N/A MCS_label=N/A ' +
    'Partitions=system,resv,resv_shared,interactive  BootTime=2020-05-31T21:02:20 SlurmdStartTime=2020-05-31T21:22:37 ' +
    'CfgTRES=cpu=64,mem=118G,billing=64 AllocTRES= CapWatts=n/a CurrentWatts=125 AveWatts=0 ExtSensorsJoules=n/s ' +
    'ExtSensorsWatts=0 ExtSensorsTemp=n/s Reason=repair:cray:INC0155505 [root@2020-05-27T04:24:37]';

formatData(str, '');

function formatData(string, comma) {
    let modifiedStr = string.replace(/  /g, ' ');
    const originalStrArr = modifiedStr.split(' ');

    handleRepairField(originalStrArr);

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

    console.log(`start and end: ${startExclusion} and ${endExclusion}`);

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

    console.log(`modified str: ${modifiedStr}`);

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

function handleRepairField(arr) {
    let index = indexOfKey(arr, 'Reason');
    if (index !== -1) {
        console.log(`index: ${index} and length: ${arr.length}`);
        let reasonMessage = "";
        let len = arr.length;
        for (let i = index; i < len - 1; i++) {
            let str = arr.pop();
            console.log(`strr:: ${str}\n\n`);
            reasonMessage = reasonMessage.concat(` ${str}`);
        }
        console.log(`rsnmsg: ${reasonMessage} arr: ${arr.toString()}`);
        arr[index] = arr[index].concat(`${reasonMessage}`);
    }
}