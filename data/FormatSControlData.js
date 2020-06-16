const str = "NodeName=nid00009 Arch=x86_64 CoresPerSocket=16  CPUAlloc=0 CPUTot=64 CPULoad=0.59 AvailableFeatures=haswell ActiveFeatures=haswell Gres=craynetwork:4,preemptable:1 NodeAddr=nid00009 NodeHostName=nid00009 Version=19.05.6 OS=Linux 4.12.14-150.17_5.0.90-cray_ari_c #1 SMP Tue Apr 28 21:17:03 UTC 2020 (3e6e478)  RealMemory=120832 AllocMem=0 FreeMem=125914 Sockets=2 Boards=1 State=IDLE ThreadsPerCore=2 TmpDisk=0 Weight=1000 Owner=N/A MCS_label=N/A Partitions=system,resv,resv_shared,interactive  BootTime=2020-05-31T21:02:20 SlurmdStartTime=2020-05-31T21:22:37 CfgTRES=cpu=64,mem=118G,billing=64 AllocTRES= CapWatts=n/a CurrentWatts=128 AveWatts=0 ExtSensorsJoules=n/s ExtSensorsWatts=0 ExtSensorsTemp=n/s ";
formatData(str);

function formatData(string) {
    let modifiedStr = string.replace(/  /g, ' ');
    // Index 12-22 are not needed
    const originalStrArr = modifiedStr.split(' ');

    // Find the indices of the array which correspond to the undesirable field
    // start position and end position
    let startExclusion = indexOfKey(originalStrArr, 'OS=');
    let endExclusion = indexOfKey(originalStrArr, 'RealMemory=');

    const modifiedStringFields = [];
    modifiedStringFields.push('{');

    // If the last item in the string is just an empty space, then we
    // don't want to apply any transformations to it so don't include it
    const len = originalStrArr[originalStrArr.length - 1] === "" ? originalStrArr.length - 1 : originalStrArr.length;
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
    modifiedStringFields.push(' }');
    // Join with space between each key-value pair
    modifiedStr = modifiedStringFields.join(' ');
    // Parse with json
    let jsonStr = JSON.parse(modifiedStr);
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
