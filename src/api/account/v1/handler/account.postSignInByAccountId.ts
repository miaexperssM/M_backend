import { Account } from 'api/account/account.entity';
import bcrypt from 'bcryptjs';
import { JWT_EXPIRE } from 'config/environments';
import { NextFunction, Request, Response } from 'express';
import { getRepository } from 'typeorm';
import sendError from 'utils/error';
import { getTokenByIdAction } from '../action/account.getTokenById';

interface PostSignInByAccountIdBody {
  accountId: string;
  password: string;
}

export async function postSignInByAccountIdHandler(req: Request, res: Response, next: NextFunction) {
  const body: PostSignInByAccountIdBody = req.body;
  const accountId = body.accountId;
  const password = body.password;

  const account = await getRepository(Account).findOne({ accountId });
  if (!account) return sendError(400, 'invalid accountId or password', next);

  const result = await bcrypt.compare(password, account.password);
  if (!result) return sendError(400, 'invalid accountId or password', next);

  const accessToken = await getTokenByIdAction(account.id);

  res.status(200).json({ access_token: accessToken, expires_in: JWT_EXPIRE });
}
