const { exec } = require("child_process");
require('dotenv').config();


const executeSmartContract = async (contractAddress, senderAddress, functionName, args) => {
  return new Promise((resolve, reject) => {
    const configPath = process.env.CONFIG_PATH;
    console.log(configPath)
    const command = `rescontract execute \
      --config ${configPath} \
      --sender ${senderAddress} \
      --contract ${contractAddress} \
      --function-name "${functionName}" \
      --arguments "${args}"`;

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error("Smart contract execution error:", error.message);
        return reject(new Error("Smart contract execution failed"));
      }
      if (stderr) {
        console.error("Smart contract stderr:", stderr);
      }
      console.log("Smart contract execution stdout:", stdout);
      resolve(stdout.trim());
    });
  });
};

module.exports = { executeSmartContract };