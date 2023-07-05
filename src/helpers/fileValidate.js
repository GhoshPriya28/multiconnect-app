// const { exec } = require("child_process");
// const util = require('util');
// const test = require("../../cmd")

// const { exec } = require("child_process");
// const util = require('util');
// var fs = require('file-system');

// const eParsePath = "src/uploads/3d-requests/16181309/merges/EveryPointSession_2022_08_19_09_11_02.eparls";
// console.log("eParsePath", eParsePath)
// const cmdPath = "cmd/epars -v";
// console.log("cmdPath", cmdPath)

// const execution = exec(cmdPath + " " + eParsePath, (error, stdout, stderr) => {
//     if (error) {
//         console.log(`Error in file: ${error.message}`);
//         return;
//     }
//     if (stderr) {
//         console.log(`An error with file system: ${stderr}`);
//         return;
//     }
//     console.log(`Result of shell script execution: ${stdout}`);
// });




/* Extract Start */
// const exec = util.promisify(require('child_process').exec);
// async function lsWithGrep() {
//     try {
//         // const eParsePath = "./uploads/eparls/output/" + initiateId;
//         // if (!fs.existsSync(eParsePath)) {
//         //     fs.mkdirSync(eParsePath, { recursive: true });
//         // }
//         const { stdout, stderr } = await exec("../../cmd/epars -v /uploads/3d-requests/16181309/merges/EveryPointSession_2022_08_19_09_11_02.eparls");
//         console.log('stdout:', stdout)
//         console.log('stderr:', stderr)
//     }
//     catch (err) {
//         console.error(err)
//     }
// }
// lsWithGrep();

// module.exports = lsWithGrep


//previous changes
// cmd/epars
// src/uploads/3d-requests/16181309/merges/EveryPointSession_2022_08_19_09_11_02.eparls

// const util = require('util');
// var fs = require('file-system');

// const exec = util.promisify(require('child_process').exec);
// async function lsWithGrep() {
//     try {
//         const eParsePath = "./uploads/3d-requests/16181309/merges/EveryPointSession_2022_08_19_09_11_02.eparls";
// console.log("eParsePath", eParsePath)
//         if (fs.existsSync(eParsePath)) {
//             console.log('File Exists')
//         }
//         const { stdout, stderr } = await exec("./cmd/epars -v "+eParsePath);
//         console.log('stdout:', stdout)
//         console.log('stderr:', stderr)
//     }
//     catch (err) {
//         console.error(err)
//     }
// }
// lsWithGrep();

// module.exports = lsWithGrep


//latest changes
// const util = require('util');
// var fs = require('file-system');
// const path = require("path");
// const join = require('path').join;

// const exec = util.promisify(require('child_process').exec);
// async function lsWithGrep() {
//     try {
//        const eParsePath = "src/uploads/3d-requests/16181309/merges/EveryPointSession_2022_08_19_09_11_02.eparls";
// console.log("eParsePath", eParsePath)
// const cmdPath = "cmd/epars -v";
// console.log("cmdPath", cmdPath)
//         if (fs.existsSync(eParsePath)) {
//             console.log('File Exists')
//         }
//         //const { stdout, stderr } = await exec(cmdPath + " " + eParsePath);
//         console.log('stdout:', stdout)
//         console.log('stderr:', stderr)
//     }
//     catch (err) {
//         console.error(err)
//     }
// }
// lsWithGrep();

// module.exports = lsWithGrep








