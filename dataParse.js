const fs = require("fs");
console.log("Going to write into existing file");

const keys = [
    NodeName,
    Arch,
    CoresPerSocket,
    CPUAlloc,
    CPUTot,
    CPULoad,
    AvailableFeatures,
    ActiveFeatures,
    Gres,
NodeAddr,
NodeHostName,
Version,
OS,
RealMemory,
AllocMem,
FreeMem,
Sockets,
Boards,
State,
ThreadsPerCore,
TmpDisk,
Weight,
Owner,
MCS_label,
Partitions,
BootTime,
SlurmdStartTime,
CfgTRES,
AllocTRES,
    CapWatts,
CurrentWatts,
AveWatts,
ExtSensorsJoules,
ExtSensorsWatts,
ExtSensorsTemp,
];
fs.readFile('data.txt', function(err, data) {
    if (err) {
        return console.error(err);
    }

    const allData = data.toString();
    for (let i = 0; i < allData; i++) {

    }

    fs.writeFile('input.txt', 'whats popping', function(err) {
        if (err) {
            return console.error(err);
        }
    })
})
// fs.writeFile('input.txt', 'This will be where I write the data', function(err) {
//     if (err) {
//         return console.error(err);
//     }
//     console.log("Data written successfully!");
//     console.log("Let's read newly written data");
//     // Read the newly written file and print all of its content on the console
//     fs.readFile('input.txt', function (err, data) {
//         if (err) {
//             return console.error(err);
//         }
//         console.log("Asynchronous read: " + data.toString());
//     });
// });
