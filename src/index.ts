import { createHash } from "crypto";
import * as express from "express";
import { DateTime, Int, NVarChar } from "mssql";
import log from "./log";
import { DBDriver } from "./sql";
import { EbayDeleteNotif } from "./types";

const app = express();
const port = parseInt(process.env.PORT) || 8080;
const verificationToken = process.env.VERIFICATION_TOKEN;
const endpointUrl = process.env.ENDPOINT_URL;

const db = new DBDriver({
    server: process.env.SQL_HOST,
    user: process.env.SQL_USER,
    password: process.env.SQL_PASS,
    database: process.env.SQL_DB,
    options: {
        trustServerCertificate: true
    }
});

app.use(express.urlencoded());
app.use(express.json());

//GET from / is the challenge
app.get("/", (req, res) => {
    let challenge = req.query["challenge_code"] as string;
    log.info("Got challenge: " + challenge);

    if (challenge === undefined) {
        console.error(`URL: ${req.originalUrl}`);
        console.error(`Body: ${JSON.stringify(req.body)}`);
        res.sendStatus(400);
        return;
    }

    //doing the thing ebay wants
    let hash = createHash("sha256");
    hash.update(challenge);
    hash.update(verificationToken);
    hash.update(endpointUrl);
    let responseHash: string;
    responseHash = Buffer.from(hash.digest("hex")).toString();
    
    //ebay wants json back
    res.send({
        "challengeResponse": responseHash
    });
});

//keeping track of deletions
let deletionCount: number = 0;

//POST from / is a notification
app.post("/", (req, res) => {
    if (req.body === undefined) {
        res.sendStatus(400);
        return;
    }

    let notification = (req.body as EbayDeleteNotif).notification;
    deletionCount++;
    console.log(`[${(new Date(notification.eventDate).getTime())}] - Got deletion notification. Total this session: ${deletionCount}`);

    //reply back to ebay before we start doing more things
    res.sendStatus(200);

    //now log this message into sql
    db.insert("notifications", [{
        name: "notificationId",
        value: notification.notificationId,
        type: NVarChar()
    }, {
        name: "eventDate",
        value: new Date(notification.eventDate),
        type: DateTime()
    }, {
        name: "publishDate",
        value: new Date(notification.publishDate),
        type: DateTime()
    }, {
        name: "eventDate_orig",
        value: notification.eventDate,
        type: NVarChar()
    }, {
        name: "publishDate_orig",
        value: notification.publishDate,
        type: NVarChar()
    }, {
        name: "publishAttemptCount",
        value: notification.publishAttemptCount,
        type: Int()
    }, {
        name: "username",
        value: notification.data.username,
        type: NVarChar()
    }, {
        name: "userId",
        value: notification.data.userId,
        type: NVarChar()
    }, {
        name: "eiasToken",
        value: notification.data.eiasToken,
        type: NVarChar()
    }]);
});

app.listen(port, () => {
    log.info(`Listening on port ${port}`);
});
