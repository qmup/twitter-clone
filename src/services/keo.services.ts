import { PostKeoRequestBody } from '~/models/requests/Keo.requests';
import Keo from '~/models/schemas/Keo.schema';
import databaseService from './database.services';

class KeoService {
  async getKeo() {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    const result = await databaseService.keo
      .find(
        {
          time: { $gt: start, $lt: end }
        },
        { projection: { _id: 0, created_at: 0 } }
      )
      .sort({ time: 1 })
      .toArray();
    return result;
  }

  async postKeo(body: PostKeoRequestBody) {
    const result = await databaseService.keo.insertOne(
      new Keo({
        ...body,
        time: new Date(body.time)
      })
    );
    return databaseService.keo.findOne({
      _id: result.insertedId
    });
  }
}

const keoService = new KeoService();

export default keoService;
