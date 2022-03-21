import { Account } from 'api/account/account.entity';
import { NextFunction, Request, Response } from 'express';
import { getConnection } from 'typeorm';

interface AccountGetAllQuery {
  offset: number;
  limit: number;
}

export async function getAllUsersHandler(req: Request, res: Response, next: NextFunction) {
  const query: AccountGetAllQuery = req.query;

  const usersList = await getConnection()
    .createQueryBuilder()
    .select('account')
    .from(Account, 'account')
    .orderBy('id', 'DESC')
    .skip(query.offset)
    .take(query.limit)
    .getMany();

  const notDeletedList = usersList.filter(user => !user.isDeleted);

  res.status(200).json(notDeletedList);
}
