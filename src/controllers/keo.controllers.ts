import dayjs from 'dayjs';
import { Request, Response } from 'express';
import { PostKeoRequestBody } from '~/models/requests/Keo.requests';
import keoService from '~/services/keo.services';

export const getKeoController = async (req: Request, res: Response) => {
  const keos = await keoService.getKeo();
  const result = keos.map((keo) => ({
    ...keo,
    time: dayjs(keo.time).format('HH:mm ngày DD/MM'),
    win_rate: `${keo.win_rate}%`,
    prediction: keo.prediction.toUpperCase()
  }));
  return res.json({ message: 'Get keo success', result });
};

export const postKeoController = async (
  req: Request<any, any, PostKeoRequestBody>,
  res: Response
) => {
  const body = req.body;
  const result = keoService.postKeo(body);
  return res.json({ message: 'Post keo success', result });
};