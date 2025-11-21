import { Prisma } from "@prisma/client";

export type User = Prisma.UserGetPayload<{}>;
export type Item = Prisma.ItemGetPayload<{
  include: { user: true };
}>;
export type ItemWithUser = Prisma.ItemGetPayload<{
  include: { user: { select: { name: true; email: true } } };
}>;
