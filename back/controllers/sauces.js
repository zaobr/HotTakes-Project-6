const Sauce = require('../models/sauces');
const fs = require('fs');

exports.createSauce = (req, res, next) => {
    const sauceObject = JSON.parse(req.body.sauce);
    delete sauceObject._id;
    const sauce = new Sauce({
        ...sauceObject,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
        likes: 0,
        dislikes: 0,
        usersLiked: [],
        usersDisliked: []
    });
    sauce.save()
        .then(() => res.status(201).json({message: 'Sauce créée'}))
        .catch(error => res.status(402).json({error}));
};

exports.getAllSauces = (req, res, next) => {
    Sauce.find()
        .then(sauces => res.status(200).json(sauces))
        .catch(error => res.status(404).json({error}));
};

exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({_id: req.params.id})
        .then(sauce => res.status(200).json(sauce))
        .catch(error => res.status(404).json({error}));
};

exports.modifySauce = (req, res, next) => {
    const sauceObject = req.file ?
      {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
      } : { ...req.body };
    Sauce.updateOne({_id: req.params.id}, {...sauceObject, _id: req.params.id}) 
        .then(() => res.status(200).json({message: 'Sauce modifiée'}))
        .catch(error => res.status(400).json({error}));
};

exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({_id: req.params.id})
        .then(sauce => {
            const filename = sauce.imageUrl.split('/images/')[1];
            fs.unlink(`images/${filename}`, () => {
                Sauce.deleteOne({ _id: req.params.id })
                  .then(() => res.status(200).json({ message: 'Sauce supprimée !'}))
                  .catch(error => res.status(400).json({ error }));
              });
        })
        .catch(error => res.status(500).json({error}))
};

exports.likeSauce = (req, res, next) => {
    const userId = req.body.userId;
    const like = req.body.like;
    Sauce.findOne({_id: req.params.id})
        .then(sauce => {
            if(like == 1 && sauce.usersLiked.find(user => user == userId) != userId){
                Sauce.updateOne({_id: req.params.id}, {$inc: {likes: +1}, $push: {usersLiked: userId}, $pull: {usersDisliked: userId}})
                    .then(() => res.status(201).json({message: "Sauce likée!"}))
                    .catch(error => res.status(400).json({error}))
            }
            if(like == -1 && sauce.usersDisliked.find(user => user == userId) != userId){
                Sauce.updateOne({_id: req.params.id}, {$inc: {dislikes: +1}, $push: {usersDisliked: userId}, $pull: {usersLiked: userId}})
                    .then(() => res.status(201).json({message: "Sauce dislikée!"}))
                    .catch(error => res.status(400).json({error}))
            }
            if(like == 0 && sauce.usersDisliked.find(user => user == userId) == userId){
                Sauce.updateOne({_id: req.params.id}, {$inc: {dislikes: -1}, $pull: {usersDisliked: userId}})
                    .then(() => res.status(201).json({message: "Retrait du dislike!"}))
                    .catch(error => res.status(400).json({error}))
            }
            if(like == 0 && sauce.usersLiked.find(user => user == userId) == userId){
                Sauce.updateOne({_id: req.params.id}, {$inc: {likes: -1}, $pull: {usersLiked: userId}})
                    .then(() => res.status(201).json({message: "Retrait du like!"}))
                    .catch(error => res.status(400).json({error}))
            }
        })
        .catch(error => res.status(404).json({error}))
}