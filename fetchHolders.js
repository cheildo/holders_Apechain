const {web3} = require('./utils/web3');
const fs = require('fs');
const axios = require('axios');
const {
    apiURL,
    pairAddress,
    TOP_HOLDERS_FILE,
    ALL_HOLDERS_FILE
} = require("./config/config")

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
  
        // const topHolders = holders
        // .map(holder => ({
        //     address: holder.address.hash,
        //     balance: holder.value
        // }))
        // .sort((a, b) => b.balance - a.balance)
        // .slice(0, 100)
        // .map(holder => ({
        //     address: holder.address,
        //     balance: web3.utils.fromWei(holder.balance, 'ether')
        // }));

        // const totalHolders = holders
        // .map(holder => ({
        //     address: holder.address.hash,
        //     balance: web3.utils.fromWei(holder.value, 'ether')
        // }))

        const topHolders = await Promise.all(
            holders
            .sort((a, b) => b.value - a.value)
            .slice(0, 100)
            .map(async (holder) => {
                const apeBalance = await web3.eth.getBalance(holder.address.hash);
                return {
                    address: holder.address.hash,
                    Balance_APE: web3.utils.fromWei(apeBalance, 'ether'),
                    Balance_OMEGA: web3.utils.fromWei(holder.value, 'ether'),
                };
            })
        );

        const allHolders = await Promise.all(
            holders.map(async (holder) => {
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
        
        console.log(`Top 100 holders saved to ${TOP_HOLDERS_FILE}`);
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