import { ObjectId } from 'mongodb';
import { UserVerifyStatus } from '~/constants/enums';

/**
 * @openapi
 * components:
 *   schemas:
 *     LoginBody:
 *       type: object
 *       properties:
 *         email:
 *           type: string
 *           example: q.1st.ace@gmail.com
 *         password:
 *           type: string
 *           example: Qmup1309@
 *     SuccessAuthentication:
 *       type: object
 *       properties:
 *         access_token:
 *           type: string
 *           example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNjRmYTdmMzMwZWQxZTI5OWI4ZDEzZDdjIiwidmVyaWZ5IjoxLCJ0b2tlbl90eXBlIjowLCJpYXQiOjE2OTQ1MDQ5NjksImV4cCI6MTY5NTEwOTc2OX0.PrJjEMVwFSsRVRpN1uIR_1TzglshduVfmLxSSGiq26Q
 *         refresh_token:
 *           type: string
 *           example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNjRmYTdmMzMwZWQxZTI5OWI4ZDEzZDdjIiwidG9rZW5fdHlwZSI6MSwidmVyaWZ5IjoxLCJpYXQiOjE2OTQ1MDQ5NjksImV4cCI6MTcwMzE0NDk2OX0.IqyaZKiaOs07Zp6JbsbxGQ4NopQsW1JiYftbGJHNySo
 *     User:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           format: MongoId
 *           example: 64fa7f330ed1e299b8d13d7c
 *         name:
 *           type: string
 *           example: Quân Nguyễn Minh
 *         email:
 *           type: string
 *           example: q.1st.ace@gmail.com
 *         date_of_birth:
 *           type: string
 *           format: ISO8601
 *           example: '2023-09-08T01:56:03.759Z'
 *         created_at:
 *           type: string
 *           format: ISO8601
 *           example: '2023-09-08T01:56:03.778Z'
 *         updated_at:
 *           type: string
 *           example: '2023-09-09T05:12:25.062Z'
 *         verify:
 *           $ref: '#/components/schemas/UserVerifiedStatus'
 *         bio:
 *           type: string
 *           example: ''
 *         location:
 *           type: string
 *           example: ''
 *         website:
 *           type: string
 *           example: ''
 *         username:
 *           type: string
 *           example: user64fa7f330ed1e299b8d13d7c
 *         avatar:
 *           type: string
 *           example: ''
 *         cover_photo:
 *           type: string
 *           example: ''
 *         twitter_circle:
 *           type: array
 *           items:
 *             format: MongoId
 *             type: string
 *             example: ['64fa7f330ed1e299b8d13d7c', '64fa7f330ed1e299b8d13d7d']
 *     UserVerifiedStatus:
 *       type: number
 *       example: 1
 *       enum:
 *         - Verified
 *         - Unverified
 *         - Banned
 */

type UserType = {
  _id?: ObjectId;
  name?: string;
  email: string;
  date_of_birth?: Date;
  password: string;
  created_at?: Date;
  updated_at?: Date;
  email_verify_token?: string;
  forgot_password_token?: string;
  verify?: UserVerifyStatus;
  bio?: string;
  location?: string;
  website?: string;
  username?: string;
  avatar?: string;
  cover_photo?: string;
  twitter_circle?: ObjectId[];
};

export class User {
  _id?: ObjectId;
  name: string;
  email: string;
  date_of_birth: Date;
  password: string;
  created_at: Date;
  updated_at: Date;
  email_verify_token: string;
  forgot_password_token: string;
  verify: UserVerifyStatus;
  bio: string;
  location: string;
  website: string;
  username: string;
  avatar: string;
  cover_photo: string;
  twitter_circle: ObjectId[];

  constructor(user: UserType) {
    const date = new Date();
    this._id = user._id;
    this.name = user.name || '';
    this.email = user.email;
    this.date_of_birth = user.date_of_birth || date;
    this.password = user.password || '';
    this.created_at = user.created_at || date;
    this.updated_at = user.updated_at || date;
    this.email_verify_token = user.email_verify_token || '';
    this.forgot_password_token = user.forgot_password_token || '';
    this.verify = user.verify || UserVerifyStatus.Unverified;
    this.bio = user.bio || '';
    this.location = user.location || '';
    this.website = user.website || '';
    this.username = user.username || '';
    this.avatar = user.avatar || '';
    this.cover_photo = user.cover_photo || '';
    this.twitter_circle = user.twitter_circle || [];
  }
}
