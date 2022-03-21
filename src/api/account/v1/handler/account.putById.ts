import { Account } from 'api/account/account.entity';
import { NextFunction, Request, Response } from 'express';
import { getRepository } from 'typeorm';
import sendError from 'utils/error';
import bcrypt from 'bcryptjs';

interface AccountPutByIdParams {
  id: number;
}

interface AccountPutByIdBody {
  accountId: string;
  name: string;
  email: string;
  password: string;
  permissions: string;
}

export async function accountPutByIdHandler(req: Request, res: Response, next: NextFunction) {
  const params: AccountPutByIdParams = req.params as any;

  const user = await getRepository(Account).findOne({ id: params.id });
  if (!user) return sendError(404, 'account not found', next);

  const body: AccountPutByIdBody = req.body;

  const alreadyEmail = await getRepository(Account).findAndCount({ email: body.email });
  if (alreadyEmail[1] && alreadyEmail[1] > 1) return sendError(400, 'email already in use', next);

  const alreadyAccountId = await getRepository(Account).find({ accountId: body.accountId });
  if (alreadyAccountId && alreadyAccountId.length > 1) return sendError(400, 'accountId already in use', next);

  user.accountId = body.accountId;
  user.name = body.name;
  user.email = body.email;
  if (body.password.length !== 0) {
    user.password = await bcrypt.hash(body.password, 10);
  } else {
    user.password = user.password;
  }
  user.createdBy = req.user.id;
  user.permissions = body.permissions;
  await getRepository(Account).save(user);

  res.status(200).json({ id: user.id });
}
