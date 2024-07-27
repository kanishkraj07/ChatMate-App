import zod from 'zod';

export const NEW_GROUP_REQUEST = zod.object({
    ownerId: zod.string(),
    name: zod.string(),
    members: zod.string().optional()
})