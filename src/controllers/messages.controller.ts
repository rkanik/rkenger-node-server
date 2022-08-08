import { Types } from "mongoose";
import { Conversations, Messages, Users } from "@models";
import { handleRequest, paginate, parseMongoError, selectify } from "@helpers";
import { IMessageDoc, IUserDoc, TId } from "@types";
import StatusCodes from "http-status-codes";

const { NOT_FOUND, UNPROCESSABLE_ENTITY, INTERNAL_SERVER_ERROR } = StatusCodes;

const findMessageById = async (_id: TId) => {
  return await Messages.findById(_id).populate("sender");
};

export const send = handleRequest(async (req, res) => {
  const user = req.user as IUserDoc;
  req.body.sender = user._id;

  const message = new Messages(req.body);

  const validationError = message.validateSync();
  if (validationError)
    return res
      .status(UNPROCESSABLE_ENTITY)
      .error(parseMongoError(validationError));

  try {
    const newMessage = (await message.save()) as TId & IMessageDoc;
    const conversation = await Conversations.findOne({
      $or: [
        { _id: req.params.id },
        {
          $and: [
            { "members.user": user._id },
            { "members.user": req.params.id },
            { members: { $size: 2 } },
          ],
        },
      ],
    });

    if (!conversation) {
      // If there is no user with the id
      const eUser = await Users.findById(req.params.id).select("_id");
      if (!eUser)
        return res.status(NOT_FOUND).error({ message: `User Not Found.` });

      // Creating new conversation
      const nConv = new Conversations({
        createdBy: user._id,
        count: { messages: 1, members: 2 },
        messages: [newMessage._id],
        members: [{ user: user._id }, { user: req.params.id }],
      });

      // If the user is my friend
      const eFriend = await Users.findOne(
        { _id: user._id, "friends.user": req.params.id },
        { "friends.$": 1 }
      );
      if (!eFriend) nConv.request = { user: Types.ObjectId(user._id) };

      // Saving conversation
      // @TODO: Make your it's saved
      await nConv.save();
      return res.success({
        _id: nConv._id,
        messages: [newMessage],
      });
    }

    let update = {
      $inc: { "count.messages": 1 },
      $push: { messages: newMessage._id },
    } as any;

    // If a request then accepting the request
    if (
      !conversation?.request?.acceptedAt &&
      conversation?.request?.user?.toString() === req.params.id
    ) {
      update.request = { ...conversation.request, acceptedAt: new Date() };
    }

    // Updating the conversation
    let uConvRes = await conversation.update(update);
    if (uConvRes.nModified) {
      return res.success({
        newMessage: await Messages.findById(newMessage._id).populate({
          path: "sender",
          select: "_id name username",
        }),
      });
    }

    // Deleting the message if failed to update conversation
    // @TODO: make sure message is deleted
    newMessage.delete();
    return res.status(INTERNAL_SERVER_ERROR).error({
      message: "Error while sending message.",
    });
  } catch (error: any) {
    return res.status(INTERNAL_SERVER_ERROR).error({ message: error?.message });
  }
});

export const find = handleRequest(async (req, res) => {
  const user = req.user as IUserDoc;
  const conditions = {
    $or: [
      {
        _id: req.params.id,
        "members.user": user._id,
      },
      {
        $and: [
          { "members.user": user._id },
          { "members.user": req.params.id },
          { members: { $size: 2 } },
        ],
      },
    ],
  };

  const select = selectify(req.query.select as string);
  const { limit, skip, page } = paginate(req.query);

  let conv = await Conversations.findOne(conditions)
    .select("messages count.messages")
    .populate({
      path: "messages",
      populate: { path: "sender" },
      options: {
        limit,
        skip,
        select,
        sort: {
          createdAt: -1,
        },
      },
    })
    .exec();
  if (!conv)
    return res.status(NOT_FOUND).error({
      message: `Invalid id '${req.params.id}'`,
    });

  return res.success({
    messages: {
      page,
      perPage: limit,
      data: conv.messages,
      total: conv.count.messages,
    },
  });
});

export const findById = handleRequest(async (req, res) => {
  return res.success({
    data: "find a message",
  });
});

export const updateById = handleRequest(async (req, res) => {
  return res.success({
    data: "update a message",
  });
});

export const deleteById = handleRequest(async (req, res) => {
  return res.success({
    data: "delete a message",
  });
});

export const unsentById = handleRequest(async (req, res) => {
  return res.success({
    data: "unsent a message",
  });
});
