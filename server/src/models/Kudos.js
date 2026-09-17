const mongoose = require('mongoose');

const reactionSchema = new mongoose.Schema({
  emoji: {
    type: String,
    required: true,
    enum: ['+1', '👏', '🔥', '❤️', '🚀']
  },
  users: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, { _id: false });

const kudosSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Sender is required'],
    index: true
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Receiver is required'],
    index: true
  },
  points: {
    type: Number,
    required: [true, 'Points amount is required'],
    min: [1, 'Points must be at least 1'],
    validate: {
      validator: Number.isInteger,
      message: 'Points must be an integer'
    }
  },
  message: {
    type: String,
    required: [true, 'Recognition message is required'],
    trim: true,
    maxlength: [600, 'Message cannot exceed 600 characters']
  },
  companyValue: {
    type: String,
    required: [true, 'Company value tag is required'],
    enum: ['#Teamwork', '#CustomerObsession', '#Innovation', '#Leadership', '#BiasForAction']
  },
  reactions: {
    type: [reactionSchema],
    default: [
      { emoji: '+1', users: [] },
      { emoji: '👏', users: [] },
      { emoji: '🔥', users: [] },
      { emoji: '❤️', users: [] },
      { emoji: '🚀', users: [] }
    ]
  }
}, {
  timestamps: true
});

// Indexes for fast feed queries and leaderboards
kudosSchema.index({ createdAt: -1 });
kudosSchema.index({ receiver: 1, createdAt: -1 });
kudosSchema.index({ sender: 1, createdAt: -1 });

const Kudos = mongoose.model('Kudos', kudosSchema);
module.exports = Kudos;
