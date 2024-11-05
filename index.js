const {web3, provider} = require('./utils/web3');
const fs = require('fs');
const {
    tokenAddress,
	erc20ABI,
    camelotAddress,
} = require("./config/config")

const OUTPUT_FILE = 'top_holders.json';

//const tokenContract = new web3.eth.Contract(erc20ABI, tokenAddress);
const camelotContract = new web3.eth.Contract(erc20ABI, camelotAddress);

async function main() {

    console.log(`...........Program started............`);

    await fetchHolders()
    
    const topHolders = JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf-8'));

    const topHoldersSet = new Set(topHolders.map(holder => holder.address.toLowerCase()));

    provider.on('connect', async () => {
        console.log(`web3:  WebSocket connected`);
        await listenToEvents();
    });
    
    // let wallets;
    // try {
    //     const fileContent = fs.readFileSync("./holders_list.json", 'utf8');
    //     wallets = JSON.parse(fileContent);
    // } catch (error) {
    //     console.error('Error reading wallets.json:', error);
    //     process.exit(1);
    // }

}

async function listenToEvents(walletAddress) {
    try {
        camelotContract.events.Transfer({ fromBlock: 'latest' })
        .on('data', async(event) => {
            console.log(`listenToEvents: Event returned values ${event.returnValues}`);

            let { from, to, value } = event.returnValues
            console.log(`from=${from};  to=${to}; value=${value}`)


        if (topHoldersSet.has(from.toLowerCase())) {
            console.log("listenToEvents: Transfer event detected from a top holder!");
            console.log(`listenToEvents: From address ${from}`);
            console.log(`listenToEvents: To address ${to}`);
            console.log(`listenToEvents: Value ${web3.utils.fromWei(value, 'ether')} OMEGA`);
        }
            
    })
    } catch (error) {
        console.error(`error listening to events ${error}`);
    }
    console.log(`Event listeners started`);
}


main()
    .catch(error => {
        console.error(error)
        process.exit(1);
    });