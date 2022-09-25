import { Account } from 'api/account/account.entity';
import { SortPick } from 'api/sortPick/sortPick.entity';
import { NextFunction, Request, Response } from 'express';
import { getRepository } from 'typeorm';
import sendError from 'utils/error';

interface DeleteRuleByIdParams {
  id: number;
}

export async function deleteRuleByIdHandler(req: Request, res: Response, next: NextFunction) {
  const params: DeleteRuleByIdParams = req.params as any;

  const rule = await getRepository(SortPick).findOne({ id: params.id });
  if (!rule) return sendError(404, 'delete id not found', next);
  rule.isDeleted = true
  await getRepository(SortPick).save(rule);

  res.status(200).end();
}
