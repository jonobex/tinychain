const fs = require('fs');
const { bluzelle } = require('bluzelle');

// Load configuration file
const config = JSON.parse(fs.readFileSync('config/bluzelle.json'));


const bz = bluzelle({
    entry: 'ws://bernoulli.bluzelle.com:51010',
    // This UUID identifies your database and may be changed.
    uuid: config.uuid,
    // openssl ecparam -name secp256k1 -genkey -noout
    private_pem: config.key    
});

module.exports.load = async () => {
    const has = await bz.hasDB();
    if (!has) {
        await bz.createDB();
        console.log('created database');
    }
    if (!await bz.has('latest')) {
        console.log('block not found');
        return null;
    } 

    return await bz.read('latest');
    console.log('read key');
}

module.exports.save = async (data) => {
    const has = await bz.has('latest');
    if (!has) {
        await bz.create('latest', JSON.stringify(data))
    } else {
        return await bz.update('latest', JSON.stringify(data));
    }
}