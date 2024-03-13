const Message = require('../models/message.model');
const mongoose = require("mongoose");

exports.getMessages = (req, res) => {
    Message.find()
        .then(messages => res.status(201).json(messages))
        .catch(error => res.status(401).json({error}));
}

exports.getMessagesSortedOffsetValues = (req, res) => {
    Message.find()
        .sort({timestamp: -1})
        .skip(req.params.offset)
        .limit(req.params.values)
        .then(messages => res.status(201).json(messages))
        .catch(error => res.status(401).json({error}));
}

// récupérer les messages dans la conversation entre user1 et user2

exports.getMessagesSortedByUserIdsOffsetValues = (req, res, next) => {
    const user1 = new mongoose.Types.ObjectId(req.params.user1);
    const user2 = new mongoose.Types.ObjectId(req.params.user2);
    Message.find({
        $or: [
            {sender_id: user1, receiver_id: user2},
            {sender_id: user2, receiver_id: user1},
        ],
    })
        .sort({timestamp: -1})
        .skip(req.params.offset)
        .limit(req.params.values)
        .then((message) => res.status(200).json(message))
        .catch((error) => res.status(401).json({error}));
};

exports.addMessage = (req, res) => {
    Message.collection.dropIndex('content_1', function(err, result) {
        if (err) {
            console.log('Error in dropping index!', err);
        }
    });

    const sender_id = new mongoose.Types.ObjectId(req.body.sender_id);
    const receiver_id = new mongoose.Types.ObjectId(req.body.receiver_id);
    const message = new Message({
        sender_id: sender_id,
        receiver_id: receiver_id,
        content: req.body.content,
        timestamp: Date.now()
    });

    message.save()
        .then(() => res.status(201).json({message: "message_added"}))
        .catch(error => res.status(401).json({error}));
}

// GET CONV FROM USER ID

exports.getConversations = (req, res) => {
    const user_id = new mongoose.Types.ObjectId(req.body.user_id);
    Message.aggregate([
        {
            $match: {
                $or: [{ sender_id: user_id }, { receiver_id: user_id }],
            },
        },
        {
            $sort: { timestamp: -1 },
        },
        {
            $group: {
                _id: {
                    $cond: [
                        { $gt: ["$sender_id", "$receiver_id"] },
                        { sender_id: "$sender_id", receiver_id: "$receiver_id" },
                        { sender_id: "$receiver_id", receiver_id: "$sender_id" }
                    ]
                },
                message: { $first: "$$ROOT" }
            },
        },
    ])
        .then((latestMessages) => res.status(200).json(latestMessages.map(item => item.message)))
        .catch((error) => res.status(400).json(error));
};

exports.deleteAllMessages = (req, res) => {
    Message.deleteMany()
        .then(() => res.status(201).json({message: "all_messages_deleted"}))
        .catch(error => res.status(401).json({error}));
}