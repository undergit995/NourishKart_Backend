const mongoose = require('mongoose');

const companySchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: true,
      trim: true,
    },

    companyDescription: {
      type: String,
      required: true,
    },

    companyImage: {
      type: String,
      default: "",
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    phone: {
      type: String,
      required: true,
    },

    socialMedia: [ {
    platform: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
  }],

    certification: [String],

    licence: {
      type: String,
      default: "",
    },

    founder: {
      type: String,
      required: true,
    },
  customDetails: [
    {
      key: String,
      value: String,
    }
  ],

    customFields: {
      type:Object,
      default: {},
    },

   
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Company", companySchema);