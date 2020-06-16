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
    }

    formattedDataArr.push(']');
    const formattedDataStr = formattedDataArr.join(' ');

    fs.writeFile('formattedSQueue.txt', formattedDataStr, function(err) {
        if (err) {
            return console.error(err);
        }

        console.log(`Data formatted successfully and stored in formattedSQueue.txt file!`);
    })
})
