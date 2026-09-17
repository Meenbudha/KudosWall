const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['KUDOS_GIFT', 'MONTHLY_ALLOWANCE_RESET', 'ADMIN_ADJUSTMENT'],
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  points: {
    type: Number,
    required: true
  },
  kudosId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Kudos'
  },
  notes: {
    type: String
  }
}, {
  timestamps: true
});

transactionSchema.index({ createdAt: -1 });

const Transaction = mongoose.model('Transaction', transactionSchema);
module.exports = Transaction;
