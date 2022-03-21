import { Account } from 'api/account/account.entity';
import { NextFunction, Request, Response } from 'express';
import { getRepository } from 'typeorm';
import sendError from 'utils/error';

interface AccountDelByIdParams {
  id: number;
}

export async function accountDelByIdHandler(req: Request, res: Response, next: NextFunction) {
  const params: AccountDelByIdParams = req.params as any;

  const user = await getRepository(Account).findOne({ id: params.id });
  if (!user) return sendError(404, 'post not found', next);
  user.isDeleted = true
  await getRepository(Account).save(user);

  res.status(200).end();
}
