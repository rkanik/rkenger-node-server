import { model, Schema } from "mongoose";
import { _regex } from "../regexs";
import { EProviders, ERoles, IUser, IUserDoc } from "@types";
import { password } from "@helpers";

const friendSchema = {
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  acceptedAt: Date,
  blockedAt: Date,
};

const friendRequestSchema = new Schema({
  message: {
    type: String,
    required: true,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
});

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      match: _regex.name,
    },
    email: {
      type: String,
      match: _regex.email,
    },
    role: {
      type: String,
      default: ERoles.User,
    },
    username: {
      type: String,
      unique: true,
      required: true,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    provider: {
      type: String,
      default: EProviders.Local,
    },
    friends: [friendSchema],
    requests: [friendRequestSchema],
    image: {
      type: Schema.Types.ObjectId,
      ref: "Image",
      required: false,
    },
    externalId: String,
    password: {
      type: String,
      match: _regex.password,
    },
    phone: {
      type: String,
      match: _regex.phone,
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
    lastSeen: Date,
    dob: Date,
    gender: String,
  } as Record<keyof IUser, any>,
  {
    timestamps: true,
    autoIndex: true,
  }
);

userSchema.index({
  username: "text",
  name: "text",
  email: "text",
  phone: "text",
});

userSchema.pre("save", async function (next) {
  const user: IUserDoc = this as IUserDoc;
  if (user.password && user.isModified("password")) {
    const { hash, error } = await password(user.password).hash();
    if (!error) user.password = hash;
    else return next(error);
  }
  return next();
});

export const FriendRequest = model("FriendRequest", friendRequestSchema);
export const Users = model<IUserDoc>("User", userSchema);
