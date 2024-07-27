import zod from "zod";

export const USER_REGISTER_INPUT_SCHEMA = zod.object({
    userName: zod.string().min(5).max(10),
    email: zod.string(),
    password: zod.string().min(5).max(15),
    firstName: zod.string(),
    lastName: zod.string()
});

export const USER_LOGIN_INPUT_SCHEMA = zod.object({
    email: zod.string(),
    password: zod.string().min(5).max(15),
});


export const FRIEND_REQUEST = zod.object({
    friendRequestId: zod.string().optional(),
    fromUserId: zod.string(),
    toUserId: zod.string(),
    status: zod.string()
})