import { SortPick } from 'api/sortPick/sortPick.entity';
import { NextFunction, Request, Response } from 'express';
import { getConnection } from 'typeorm';

interface SortPickRulesGetByLevelParams {
  level: number;
}

export async function getRulesByLevelHandler(req: Request, res: Response, next: NextFunction) {
  const params: SortPickRulesGetByLevelParams = req.params as any;

  const rulesList = await getConnection()
    .createQueryBuilder()
    .select('sortPick')
    .from(SortPick, 'sortPick')
    .orderBy('id', 'DESC')
    .getMany();

  const rulesByLevelList = rulesList.filter(rules => !rules.isDeleted && rules.pickLevel === params.level);

  res.status(200).json(rulesByLevelList);
}
