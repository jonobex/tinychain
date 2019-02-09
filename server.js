const express = require('express');
const bodyParser = require('body-parser');
const blockchain = require('.');

const app = express(),
    PORT = 3030;

//support parsing of application/x-www-form-urlencoded post data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/', express.static('static'));

blockchain.create(chain => {
    app.get('/chains/test', (request, response) => {
        response.send(JSON.stringify(chain, null, 4));
    });

    app.put("/chain/mine", (request, response) => {
        let data = request.body;
        let counter = 0;
        let blocks = chain.mine(data.address);

        while (counter < 1000 && blocks === null) {
            blocks = chain.mine(data.address);
            counter++;
        }
        if (blocks !== null) {
            chain.blocks = blocks;
            chain.save();
            response.send("Successfully mined a block and saved the chainfile!");
            return;
        }
        throw new Error("Failed to mine a block after 1000 attempts!");
    });

    app.get("/chain/download", (request, response) => {
        response.send(chain);
    });
    app.get("/chain.json", (request, response) => {
        response.send(chain);
    });

    app.get('/wallets', (request,response) => {
        response.send(chain.wallets);
    });
    app.get('/wallet/new', (request, response) => {
        response.send(blockchain.wallet.create());
    });
    app.post('/wallet/sign', (request, response) => {
        let data = request.body;
        let wallet = blockchain.wallet.load(data.source, data.key);
        response.send(JSON.stringify(wallet.transaction(data.destination, data.amount)));
    });
    app.get('wallet/:walletId', (request, response) => {
        console.log(chain.wallets[request.walletId]);
        response.send(chain.wallets[request.walletId]);
    });
    app.post('/transaction', (request, response) => {
        try {
            chain.addTransaction(request.body.data);
        } catch (err) {
            response.status(500).send(err.message);
        }
        response.send(chain);
    });
    app.listen(PORT, () => {
        console.log(`listening on port ${PORT}`);
    });
});