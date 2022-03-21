import { Account } from 'api/account/account.entity';
import bcrypt from 'bcryptjs';
import { JWT_EXPIRE } from 'config/environments';
import { NextFunction, Request, Response } from 'express';
import { getRepository } from 'typeorm';
import sendError from 'utils/error';
import { getTokenByIdAction } from '../action/account.getTokenById';

interface PostNewUserBody {
  accountId: string;
  name: string;
  email: string;
  password: string;
  permissions: string;
}

export async function addNewUserHandler(req: Request, res: Response, next: NextFunction) {
  const body: PostNewUserBody = req.body;
  const accountId = body.accountId;
  const name = body.name;
  const email = body.email;
  const createdBy = req.user.id;
  const permissions = body.permissions;

  const alreadyEmail = await getRepository(Account).findOne({ email });
  if (alreadyEmail) return sendError(400, 'email already in use', next);

  const alreadyAccountId = await getRepository(Account).findOne({ accountId });
  if (alreadyAccountId) return sendError(400, 'accountId already in use', next);

  const password = await bcrypt.hash(body.password, 10);

  const newAccount = getRepository(Account).create({ accountId, name, email, password, permissions, createdBy });

  const account = await getRepository(Account).save(newAccount);

  const accessToken = await getTokenByIdAction(account.id);

  res.status(201).json({ access_token: accessToken, expires_in: JWT_EXPIRE });
}
