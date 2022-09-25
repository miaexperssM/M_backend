import { SortPick } from 'api/sortPick/sortPick.entity';
import { JWT_EXPIRE } from 'config/environments';
import { NextFunction, Request, Response } from 'express';
import { getRepository } from 'typeorm';
import sendError from 'utils/error';

interface PostRuleBody {
  pickLevel: number;
  port: number;
  zoneId: number | undefined;
  comunaName: string | undefined;
}

export async function postRuleHandler(req: Request, res: Response, next: NextFunction) {
  const body: PostRuleBody = req.body;
  const createdBy = req.user.id;
  const updatedBy = req.user.id;

  if (body.pickLevel > 2) return sendError(400, 'Current Only Suppot Sort Leve 1 and 2', next);

  if (body.pickLevel == 1 && body.comunaName == undefined)
    return sendError(400, 'Comuna cannot be empty in Level 1', next);
  if (body.pickLevel == 2 && body.zoneId == undefined)
    return sendError(400, 'Zone ID cannot be empty in Level 2', next);

  const newRuleByLevel =
    body.pickLevel == 1
      ? {
          pickLevel: body.pickLevel,
          port: body.port,
          zoneId: -1,
          comunaName: body.comunaName,
          createdBy,
          updatedBy,
        }
      : {
          pickLevel: body.pickLevel,
          port: body.port,
          zoneId: body.zoneId,
          comunaName: '',
          createdBy,
          updatedBy,
        };

  const newRule = getRepository(SortPick).create(newRuleByLevel);

  const rule = await getRepository(SortPick).save(newRule);

  res.status(201).json(rule);
}
