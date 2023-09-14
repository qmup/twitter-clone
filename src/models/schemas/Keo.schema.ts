import { ObjectId } from 'mongodb';

/**
 * @openapi
 * components:
 *   schemas:
 *     GetKeoSuccess:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           format: MongoId
 *         home:
 *           type: string
 *         away:
 *           type: string
 *         time:
 *           type: string
 *         prediction:
 *           type: string
 *         win_rate:
 *           type: string
 *         description:
 *           type: string
 */

interface KeoConstructor {
  _id?: ObjectId;
  home: string;
  away: string;
  time: Date;
  prediction: string;
  win_rate: number;
  description: string;
  created_at?: Date;
}

export default class Keo {
  _id?: ObjectId;
  home: string;
  away: string;
  time: Date;
  prediction: string;
  win_rate: number;
  description: string;
  created_at: Date;

  constructor(keo: KeoConstructor) {
    const date = new Date();
    this._id = keo._id || new ObjectId();
    this.home = keo.home;
    this.away = keo.away;
    this.time = keo.time;
    this.prediction = keo.prediction;
    this.win_rate = keo.win_rate;
    this.description = keo.description;
    this.created_at = keo.created_at || date;
  }
}
