import { SortPick } from 'api/sortPick/sortPick.entity';
import { JWT_EXPIRE } from 'config/environments';
import { NextFunction, Request, Response } from 'express';
import { getRepository } from 'typeorm';
import sendError from 'utils/error';

interface PutRuleParams {
  id: number;
}

interface PutRuleBody {
  pickLevel: number;
  port: number;
  zoneId: number | undefined;
  comunaName: string | undefined;
}

export async function putRuleByIdHandler(req: Request, res: Response, next: NextFunction) {
  const body: PutRuleBody = req.body;
  const params: PutRuleParams = req.params as any;
  const updatedBy = req.user.id;

  const ruleList = await getRepository(SortPick).find({ id: params.id, isDeleted: false });
  if (ruleList == undefined || ruleList.length == 0) return sendError(400, 'Not found rule', next);

  if (body.pickLevel > 2) return sendError(400, 'Current Only Suppot Sort Leve 1 and 2', next);

  if (body.pickLevel == 1 && body.comunaName == undefined)
    return sendError(400, 'Comuna cannot be empty in Level 1', next);
  if (body.pickLevel == 2 && body.zoneId == undefined)
    return sendError(400, 'Zone ID cannot be empty in Level 2', next);

  const modifiedRule = await getRepository(SortPick).findOne({ id: params.id, isDeleted: false });
  if (body.pickLevel == 1) {
    modifiedRule.port = body.port;
    modifiedRule.comunaName = body.comunaName;
    modifiedRule.updatedBy = updatedBy;
  } else {
    modifiedRule.port = body.port;
    modifiedRule.zoneId = body.zoneId;
    modifiedRule.updatedBy = updatedBy;
  }

  const rule = await getRepository(SortPick).save(modifiedRule);

  res.status(201).json(rule);
}
