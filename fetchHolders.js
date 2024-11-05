const {web3} = require('./utils/web3');
const fs = require('fs');
const axios = require('axios');
const {apiURL} = require("./config/config")

async function fetchHolders() {
    let holders = [];
    let nextPageParams = null;
  
    try {
        do {
            const response = await axios.get(apiURL, {
                headers: { 'accept': 'application/json'},
                params: nextPageParams
            });

            holders = holders.concat(response.data.items);

            nextPageParams = response.data.next_page_params;

            if (nextPageParams) {
                console.log(` nextPageParams value ${nextPageParams.value}`);
            }

            console.log(`Fetched ${response.data.items.length} holders, total: ${holders.length}`);
        } while (nextPageParams);
  
        const topHolders = holders
        .map(holder => ({
            address: holder.address.hash,
            balance: holder.value
        }))
        .sort((a, b) => b.balance - a.balance)
        .slice(0, 101)
        .map(holder => ({
            address: holder.address,
            balance: web3.utils.fromWei(holder.balance, 'ether')
        }));

        const totalHolders = holders
        .map(holder => ({
            address: holder.address.hash,
            balance: web3.utils.fromWei(holder.value, 'ether')
        }))
    
        fs.writeFileSync('all_holders.json', JSON.stringify(totalHolders, null, 2));
        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(topHolders, null, 2));

        console.log(`Top 100 holders saved to ${OUTPUT_FILE}`);

    } catch (error) {
        console.error(`Error fetching data ${error}`);
    }
}

fetchHolders()
    .catch(error => {
        console.error(error)
        process.exit(1);
    });