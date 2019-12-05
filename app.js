import http from 'http';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
require('dotenv/config');
require('dotenv').config();

let connection = {
    "name": "local_fabric",
    "version": "1.0.0",
    "client": {
        "organization": "Org1",
        "connection": {
            "timeout": {
                "peer": {
                    "endorser": "300"
                },
                "orderer": "300"
            }
        }
    },
    "organizations": {
        "Org1": {
            "mspid": "Org1MSP",
            "peers": [
                "peer0.org1.example.com"
            ],
            "certificateAuthorities": [
                "ca.org1.example.com"
            ]
        }
    },
    "peers": {
        "peer0.org1.example.com": {
            "url": "grpc://localhost:17051"
        }
    },
    "certificateAuthorities": {
        "ca.org1.example.com": {
            "url": "http://localhost:17054",
            "caName": "ca.org1.example.com"
        }
    }
}
const { FileSystemWallet, Gateway, X509WalletMixin } = require('fabric-network');
const path = require('path');
const walletPath = path.join(process.cwd(), 'wallet');
const wallet = new FileSystemWallet(walletPath.toString());
const gateway = new Gateway();
let app = express();
app.server = http.createServer(app);

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post("/account/create", async function (req, res) {
    try{
        await gateway.connect(connection, { wallet, identity: "admin", discovery: { "enabled": true, "asLocalhost": true } });
        const network = await gateway.getNetwork('mychannel');
        const contract = await network.getContract(process.env.CONTRACT_NAMES || "tokencontract18");
        let body = req.body;
        let data = {
            username : body.username,
            password : body.password
        };
        let trx = await contract.submitTransaction("createAccount", JSON.stringify(data));
        let aa = Buffer.from(trx);
        await res.json({
            message : aa.toString(),
        })
    }catch (e) {
        res.status(500);
        await res.json({
            error: e.message
        })
    }

});

app.post("/transfer", async function (req, res) {
    try{
        await gateway.connect(connection, { wallet, identity: "admin", discovery: { "enabled": true, "asLocalhost": true } });
        const network = await gateway.getNetwork('mychannel');
        const contract = await network.getContract(process.env.CONTRACT_NAMES || "tokencontract18");
        let body = req.body;
        let data = {
            sender : body.from,
            recipient : body.to,
            password : body.password,
            amount : body.amount.toString()
        };
        let trx = await contract.submitTransaction("transfer", JSON.stringify(data));
        let aa = Buffer.from(trx);
        await res.json({
            message : aa.toString(),
        })
    }catch (e) {
        res.status(500);
        await res.json({
            error: e.message
        })
    }
   
});



app.get("/account/balance", async function (req, res) {
    try{
        await gateway.connect(connection, { wallet, identity: "admin", discovery: { "enabled": true, "asLocalhost": true } });
        const network = await gateway.getNetwork('mychannel');
        const contract = await network.getContract(process.env.CONTRACT_NAMES || "tokencontract18");
        let trx = await contract.evaluateTransaction("getBalance", req.body.username);
        let aa = Buffer.from(trx);
        await res.json({
            data: aa.toString(),
        })
    }catch (e) {
        res.status(500);
        await res.json({
            error: e.message
        })
    }

});

app.post("/init", async function (req, res) {
    try{
        await gateway.connect(connection, { wallet, identity: "admin", discovery: { "enabled": true, "asLocalhost": true } });
        const network = await gateway.getNetwork('mychannel');
        const contract = await network.getContract(process.env.CONTRACT_NAMES || "tokencontract18");
        console.log(req.body.password);
        let trx = await contract.submitTransaction("init", req.body.password);
        let aa = Buffer.from(trx);
        await res.json({
            message: aa.toString(),
        })
    }catch (e) {
        res.status(500);
        console.error(e);
        await res.json({
            error: e.endorsements
        })
    }

});

app.server.listen(process.env.PORT ? process.env.PORT * 1 : 8080, () => {
    console.log(`Started on port ${app.server.address().port}`);
});



