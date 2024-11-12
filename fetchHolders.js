const {web3} = require('./utils/web3');
const fs = require('fs');
const axios = require('axios');
const {
    apiURL,
    numberOfWallet,
    BLOCK_NUMBER,
    pairAddress,
    tokenAddress,
    erc20ABI,
    TOP_HOLDERS_FILE,
    ALL_HOLDERS_FILE,
    CURRENT_TOP_HOLDERS_FILE
} = require("./config/config")

const tokenContract = new web3.eth.Contract(erc20ABI, tokenAddress);

// Fetch the holders of OMEGA token
async function fetchHolders() {
    let holders = [];
    let nextPageParams = null;
  
    try {
        do {
            const response = await axios.get(apiURL, {
                headers: { 'accept': 'application/json'},
                params: nextPageParams
            });

            holders = holders.concat(response.data.items.filter(
            holder => holder.address.hash.toLowerCase() !== pairAddress
        ));

            nextPageParams = response.data.next_page_params;

            if (nextPageParams) {
                console.log(` nextPageParams value ${nextPageParams.value}`);
            }

            console.log(`Fetched ${response.data.items.length} holders, total: ${holders.length}`);
        } while (nextPageParams);

        const holdersWithBalances = await Promise.all(
            holders
            .map(async (holder) => {
                const apeBalance = await web3.eth.getBalance(holder.address.hash, BLOCK_NUMBER);
                const tokenBalance = await tokenContract.methods.balanceOf(holder.address.hash).call({}, BLOCK_NUMBER);
                return {
                    address: holder.address.hash,
                    Balance_APE: web3.utils.fromWei(apeBalance, 'ether'),
                    Balance_OMEGA: web3.utils.fromWei(tokenBalance, 'ether'),
                };
            })

        );
        const topHolders = holdersWithBalances
        .sort((a, b) => b.Balance_OMEGA - a.Balance_OMEGA)
        .slice(0, numberOfWallet);

        const allHolders = await Promise.all(
            holders.map(async (holder) => {
                const apeBalance = await web3.eth.getBalance(holder.address.hash, BLOCK_NUMBER);
                const tokenBalance = await tokenContract.methods.balanceOf(holder.address.hash).call({}, BLOCK_NUMBER);
                return {
                    address: holder.address.hash,
                    Balance_APE: web3.utils.fromWei(apeBalance, 'ether'),
                    Balance_OMEGA: web3.utils.fromWei(tokenBalance, 'ether'),
                };
            })
        );

        const current_topHolders = await Promise.all(
            holders
            .sort((a, b) => b.value - a.value)
            .slice(0, numberOfWallet)
            .map(async (holder) => {
                const apeBalance = await web3.eth.getBalance(holder.address.hash);
                return {
                    address: holder.address.hash,
                    Balance_APE: web3.utils.fromWei(apeBalance, 'ether'),
                    Balance_OMEGA: web3.utils.fromWei(holder.value, 'ether'),
                };
            })
        );
        
        fs.writeFileSync(TOP_HOLDERS_FILE, JSON.stringify(topHolders, null, 2));
        fs.writeFileSync(ALL_HOLDERS_FILE, JSON.stringify(allHolders, null, 2));
        fs.writeFileSync(CURRENT_TOP_HOLDERS_FILE, JSON.stringify(current_topHolders, null, 2));
        
        console.log(`Top ${numberOfWallet} holders saved to ${TOP_HOLDERS_FILE}`);
        console.log(`All holders saved to ${ALL_HOLDERS_FILE}`);

    } catch (error) {
        console.error(`Error fetching data ${error}`);
    }
}

fetchHolders()
    .catch(error => {
        console.error(error)
        process.exit(1);
    });