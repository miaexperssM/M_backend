import { Account } from 'api/account/account.entity';
import bcrypt from 'bcryptjs';
import { JWT_EXPIRE } from 'config/environments';
import { NextFunction, Request, Response } from 'express';
import { getRepository } from 'typeorm';
import sendError from 'utils/error';
import { getTokenByIdAction } from '../action/account.getTokenById';

interface PostSignUpBody {
  name: string;
  email: string;
  password: string;
  permissions: string;
}

export async function postSignUpHandler(req: Request, res: Response, next: NextFunction) {
  const body: PostSignUpBody = req.body;
  const name = body.name;
  const email = body.email;
  const permissions = body.permissions;

  const oldAccount = await getRepository(Account).findOne({ email });
  if (oldAccount) return sendError(400, 'email already in use', next);

  const password = await bcrypt.hash(body.password, 10);

  const accountCount = await getRepository(Account).count();
  const createdBy = accountCount + 1;

  const newAccount = getRepository(Account).create({
    name,
    email,
    password,
    permissions,
    createdBy,
    accountId: createdBy.toString(),
  });

  const account = await getRepository(Account).save(newAccount);

  const accessToken = await getTokenByIdAction(account.id);

  res.status(201).json({ access_token: accessToken, expires_in: JWT_EXPIRE });
}
