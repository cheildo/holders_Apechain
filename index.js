//const {web3, provider} = require('./utils/web3');
const {Web3}= require("web3");
const fs = require('fs');
const {
    BLOCK_NUMBER,
    TOP_HOLDERS_FILE,
	erc20ABI,
    tokenAddress,
    camelotAddress_old,
    camelotAddress,
} = require("./config/config")

const web3_2 = new Web3("https://apechain.calderachain.xyz/http");

const tokenContract = new web3_2.eth.Contract(erc20ABI, tokenAddress);

async function main() {

    console.log(`...........Program started............`);

    await fetchPastEvents()

    // provider.on('connect', async () => {
    //     console.log(`web3:  WebSocket connected`);
    //     //await listenToEvents();
    // });

    console.log(`...........Program completed............`);
}

async function fetchPastEvents() {
    const startBlock = BLOCK_NUMBER;
    const endBlock = 'latest';
    
    try {
        const topHolders = JSON.parse(fs.readFileSync(TOP_HOLDERS_FILE, 'utf-8'));
        const topHoldersSet = new Set(topHolders.map(holder => holder.address.toLowerCase()));

        fs.writeFileSync('./data/transferList.txt', '');

        const pastEvents = await tokenContract.getPastEvents('Transfer', {
            fromBlock: startBlock,
            toBlock: endBlock
        });
        console.log(`Fetching events from block ${startBlock} to latest block`);

        // Process each event
        pastEvents.forEach(async (event) => {
            let { from, to, value } = event.returnValues;
            const transactionHash = event.transactionHash;

            if (topHoldersSet.has(from.toLowerCase()) && to==camelotAddress || topHoldersSet.has(from.toLowerCase()) && to == camelotAddress_old) {
                console.log(`Past Transfer event detected from a top holder: ${from}`);
                console.log(`Transferred ${web3_2.utils.fromWei(value, 'ether')} OMEGA to address ${to}\n`);

                const data = `From: ${from} To: ${to}\nValue: ${web3_2.utils.fromWei(value, 'ether')} OMEGA\nTransaction Hash: ${transactionHash}\n\n`;
                fs.appendFileSync('./data/transferList.txt', data);
            }

        });
    } catch (error) {
        console.error('Error fetching past events:', error);
    }
}


// async function listenToEvents() {
    
//     try {
//         const topHolders = JSON.parse(fs.readFileSync(TOP_HOLDERS_FILE, 'utf-8'));
//         const topHoldersSet = new Set(topHolders.map(holder => holder.address.toLowerCase()));

//         tokenContract.events.Transfer({ fromBlock: 'latest' })
//         .on('data', async(event) => {

//             let { from, to, value } = event.returnValues

//             if (topHoldersSet.has(from.toLowerCase())) {
//                 console.log(`listenToEvents: Transfer event detected from a top holder ${from}`);
//                 console.log(`listenToEvents: Transfered ${z.utils.fromWei(value, 'ether')} OMEGA to address ${to}\n`);
//             }          
//         })
//     } catch (error) {
//         console.error(`error listening to events ${error}`);
//     }
//     console.log(`Event listeners started`);
// }


main()
    .catch(error => {
        console.error(error)
        process.exit(1);
    });