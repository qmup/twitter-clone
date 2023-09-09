import { ObjectId } from 'mongodb';

interface ConversationConstructor {
  _id?: ObjectId;
  from_user_id: ObjectId;
  to_user_id: ObjectId;
  content: string;
  created_at?: Date;
  updated_at?: Date;
}

export default class Conversation {
  _id?: ObjectId;
  from_user_id: ObjectId;
  to_user_id: ObjectId;
  content: string;
  created_at?: Date;
  updated_at?: Date;

  constructor(conversation: ConversationConstructor) {
    const date = new Date();
    this._id = conversation._id;
    this.from_user_id = conversation.from_user_id;
    this.to_user_id = conversation.to_user_id;
    this.content = conversation.content;
    this.created_at = conversation.created_at || date;
    this.updated_at = conversation.updated_at || date;
  }
}
