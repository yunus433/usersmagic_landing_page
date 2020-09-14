const async = require('async');
const mongoose = require('mongoose');

const User = require('../../../models/user/User');
const Campaign = require('../../../models/campaign/Campaign');

module.exports = (req, res) => {
  User.findById(mongoose.Types.ObjectId(req.session.user._id), (err, user) => {
    if (err || !user) return res.redirect('/campaigns/user');

    async.times(
      user.campaigns.length,
      (time, next) => {
        Campaign.findById(mongoose.Types.ObjectId(user.campaigns[time]), (err, campaign) => {
          if (err || !campaign) return res.redirect('/');

          return next(null, {
            _id: campaign._id,
            name: campaign.name,
            photo: campaign.photo,
            description: campaign.description,
            information: campaign.information,
            price: campaign.price,
            version: user.campaign_versions[campaign._id.toString()],
            error: user.campaign_errors[campaign._id.toString()] || null,
            status: user.campaign_status[campaign._id.toString()],
            last_question: user.campaign_last_question[campaign._id.toString()]
          });
        });
      },
      (err, campaigns) => {
        if (err) return res.redirect('/');

        return res.render('history/user/index', {
          page: 'history/user/index',
          title: res.__('Kampanya Geçmişi'),
          includes: {
            external: ['css', 'js', 'fontawesome']
          },
          campaigns,
          code: user._id.toString(),
          currency: user.country == "tr" ? "₺" : (user.country == "us" ? "$" : "€"),
          current_page: "history"
        });
      }
    );
  });
}