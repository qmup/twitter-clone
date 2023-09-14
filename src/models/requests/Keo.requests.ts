export interface PostKeoRequestBody {
  home: string;
  away: string;
  time: Date;
  prediction: string;
  win_rate: number;
  description: string;
}
