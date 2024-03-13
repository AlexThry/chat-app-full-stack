const { createClient } = require("redis");
const hash = require("object-hash");

const redisConnectedUsersKey = "connected_users";
let redisClient = undefined;

// async function initializeRedisClient() {
//     let redisURL =  process.env.REDIS_URI || 'redis://localhost:6379';
//     if (redisURL) {
//         redisClient = createClient({ url: redisURL }).on("error", (e) => {
//             console.error(`Failed to create the Redis client with error:`);
//             console.error(e);
//         });
//
//         try {
//             await redisClient.connect();
//             console.log(`connection_successfull_redis`);
//         } catch (e) {
//             console.error(`Connection to Redis failed with error:`);
//             console.error(e);
//         }
//     }
// }

async function initializeRedisClient() {
    const redisConfig = {
        password: 'HwPhFge8HhRJhgC4IHZZp4TZw791YhND',
        socket: {
            host: 'redis-10574.c135.eu-central-1-1.ec2.cloud.redislabs.com',
            port: 10574
        }
    };

    redisClient = createClient(redisConfig).on("error", (e) => {
        console.error(`Failed to create the Redis client with error:`);
        console.error(e);
    });

    try {
        await redisClient.connect();
        console.log(`connection_successfull_redis`);
    } catch (e) {
        console.error(`Connection to Redis failed with error:`);
        console.error(e);
    }
}

function requestToKey(req) {
    const reqDataToHash = {
        query: req.query,
        body: req.body,
    };
    return `${req.path}@${hash.sha1(reqDataToHash)}`;
}

function isRedisWorking() {
    return !!redisClient?.isOpen;
}

async function addUserToConnectedUsers(userID) {
    if (isRedisWorking()) {
        try {
            await redisClient.sAdd(redisConnectedUsersKey, userID.toString());
            console.log(`User ${userID} added to connected users`)
        } catch (e) {
            console.error(`Failed to add user ${userID} to connected users`, e);
        }
    }
}

async function removeUserFromConnectedUsers(userId) {
    if (isRedisWorking()) {
        try {
            await redisClient.sRem(redisConnectedUsersKey, userId.toString());
            console.log(`User ${userId} removed from connected users`)
        } catch (e) {
            console.error(`Failed to remove user ${userId} from connected users`, e);
        }
    }
}

async function getConnectedUsers() {
    let connectedUsers = [];
    if (isRedisWorking()) {
        try {
            connectedUsers = await redisClient.sMembers(redisConnectedUsersKey);
        } catch (e) {
            console.error('Failed to get connected users', e);
        }
    }
    return connectedUsers;
}


module.exports = { initializeRedisClient, getConnectedUsers, removeUserFromConnectedUsers, addUserToConnectedUsers};