import mongoose from 'mongoose';

const sourceSchema = new mongoose.Schema({
  pageNumber: Number,
  chunkText: String,
  filename: String,
  score: Number,
});

const chatHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    question: {
      type: String,
      required: true,
    },
    answer: {
      type: String,
      required: true,
    },
    sources: [sourceSchema],
  },
  {
    timestamps: true,
  }
);

const ChatHistory = mongoose.model('ChatHistory', chatHistorySchema);
export default ChatHistory;
