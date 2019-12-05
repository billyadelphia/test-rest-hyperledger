"use strict";

var _http = _interopRequireDefault(require("http"));

var _express = _interopRequireDefault(require("express"));

var _cors = _interopRequireDefault(require("cors"));

var _bodyParser = _interopRequireDefault(require("body-parser"));

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {default: obj};
}

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
            "peers": ["peer0.org1.example.com"],
            "certificateAuthorities": ["ca.org1.example.com"]
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
};

const {
    FileSystemWallet,
    Gateway,
    X509WalletMixin
} = require('fabric-network');

const path = require('path');

const walletPath = path.join(process.cwd(), 'wallet');
const wallet = new FileSystemWallet(walletPath.toString());
const gateway = new Gateway();
let app = (0, _express.default)();
app.server = _http.default.createServer(app);
app.use((0, _cors.default)());
app.use(_bodyParser.default.urlencoded({
    extended: false
}));
app.use(_bodyParser.default.json());
app.post("/account/create", async function (req, res) {
    try {
        await gateway.connect(connection, {
            wallet,
            identity: "admin",
            discovery: {
                "enabled": true,
                "asLocalhost": true
            }
        });
        const network = await gateway.getNetwork('mychannel');
        const contract = await network.getContract(process.env.CONTRACT_NAMES || "tokencontract19");
        let body = req.body;
        let data = {
            username: body.username,
            password: body.password
        };
        let trx = await contract.submitTransaction("createAccount", JSON.stringify(data));
        let aa = Buffer.from(trx);
        await res.json({
            message: aa.toString()
        });
    } catch (e) {
        res.status(500);
        console.error(e)
        let errMessage = e.message;
        if (e.endorsements && e.endorsements.length) {
            errMessage = e.endorsements[0].message;
        }
        await res.json({
            error: errMessage
        });
    }
});
app.post("/transfer", async function (req, res) {
    try {
        await gateway.connect(connection, {
            wallet,
            identity: "admin",
            discovery: {
                "enabled": true,
                "asLocalhost": true
            }
        });
        const network = await gateway.getNetwork('mychannel');
        const contract = await network.getContract(process.env.CONTRACT_NAMES || "tokencontract19");
        let body = req.body;
        let data = {
            sender: body.from,
            recipient: body.to,
            password: body.password,
            amount: body.amount.toString()
        };
        let trx = await contract.submitTransaction("transfer", JSON.stringify(data));
        let aa = Buffer.from(trx);
        await res.json({
            message: aa.toString()
        });
    } catch (e) {
        res.status(500);
        console.error(e)
        let errMessage = e.message;
        if (e.endorsements && e.endorsements.length) {
            errMessage = e.endorsements[0].message;
        }
        await res.json({
            error: errMessage
        });
    }
});
app.get("/account/balance", async function (req, res) {
    try {
        await gateway.connect(connection, {
            wallet,
            identity: "admin",
            discovery: {
                "enabled": true,
                "asLocalhost": true
            }
        });
        const network = await gateway.getNetwork('mychannel');
        const contract = await network.getContract(process.env.CONTRACT_NAMES || "tokencontract19");
        let trx = await contract.evaluateTransaction("getBalance", req.body.username);
        let aa = Buffer.from(trx);
        await res.json({
            data: aa.toString()
        });
    } catch (e) {
        res.status(500);
        console.error(e)
        let errMessage = e.message;
        if (e.endorsements && e.endorsements.length) {
            errMessage = e.endorsements[0].message;
        }
        await res.json({
            error: errMessage
        });
    }
});
app.post("/init", async function (req, res) {
    try {
        await gateway.connect(connection, {
            wallet,
            identity: "admin",
            discovery: {
                "enabled": true,
                "asLocalhost": true
            }
        });
        const network = await gateway.getNetwork('mychannel');
        const contract = await network.getContract(process.env.CONTRACT_NAMES || "tokencontract19");
        console.log(req.body.password);
        let trx = await contract.submitTransaction("init", req.body.password);
        let aa = Buffer.from(trx);
        await res.json({
            message: aa.toString()
        });
    } catch (e) {
        res.status(500);
        console.error(e)
        let errMessage = e.message;
        if (e.endorsements && e.endorsements.length) {
            errMessage = e.endorsements[0].message;
        }
        await res.json({
            error: errMessage
        });
    }
});
app.server.listen(process.env.PORT ? process.env.PORT * 1 : 8080, () => {
    console.log(`Started on port ${app.server.address().port}`);
});