const Photo = require("../models/Photo")
const mongoose = require("mongoose")
const User = require("../models/User")

//insert a photo, with an user related to it
const insertPhoto = async (req, res) => {
    const { title } = req.body
    const image = req.file.filename
    const reqUser = req.user
    const user = await User.findById(reqUser._id)

    //create a phot
    const newPhoto = await Photo.create({
        image,
        title,
        userId: user._id,
        userName: user.name,
    })

    //if photo was created successfully, return data
    if (!newPhoto) {
        res.status(422).json({
            errors: ["Houve um problema"]
        })
        return
    }

    res.status(201).json(newPhoto)
    return
   
}

//remove a photo from db
const deletePhoto = async (req, res) => {
    const { id } = req.params
    const reqUser = req.user
    try {
        const photo = await Photo.findById(mongoose.Types.ObjectId(id))

        if (!photo) {
            res.status(404).json({ errors: ["Foto não encontrada"] })
            return
        }

        //check if photo belongs to user
        if (!photo.userId.equals(reqUser._id)) {
            res.status(422).json({ errors: ["Ocorreu um erro"] })
            return
        }

        await Photo.findByIdAndDelete(photo._id)
        res.status(200).json({ id: photo._id, message: "Foto excluída com sucesso" })
        return
    } catch (error) {
        res.status(404).json({ errors: ["Foto não encontrada"] })
        return
    }
}

//get all photos
const getAllPhotos = async (req, res) => {
    const photos = await Photo.find({}).sort([["createdAt", -1]]).exec()
    return res.status(200).json(photos)
}

//get user photos
const getUserPhotos = async (req, res) => {
    const { id } = req.params
    const photos = await Photo.find({ userId: id })
        .sort([["createdAt", -1]]).exec()

    return res.status(200).json(photos)
}

//get photo by id
const getPhotoById = async (req, res) => {
    const { id } = req.params

    try{
        const photo = await Photo.findById(mongoose.Types.ObjectId(id))

    if (!photo) {
        res.status(404).json({ errors: ["Foto não encontrada"] })
        return
    }

     res.status(200).json(photo);
     return
    }catch(err){
        res.status(404).json({ errors: ["Foto não encontrada"] })
        return
    }
    
}

//update a photo
const updatePhoto = async(req,res) =>{
    const {id} = req.params
    const {title} = req.body

    const reqUser = req.user;
    const photo = await Photo.findById(id)

    if(!photo){
        return res.status(404).json({errors:["Foto não encontrada"]})        
    }

    if(!photo.userId.equals(reqUser._id)){
        res.status(422).json({errors:["Ocorreu um erro"]})
        return
    }

    if(title){
        photo.title = title;
    }

    await photo.save()
    res.status(200).json({photo, message:"Foto atualizada com sucesso"})
    return
}

//like functionality
const likePhoto = async(req,res) =>{
    const {id} = req.params
    const reqUser = req.user;
    const photo = await Photo.findById(id)

    if(!photo){
        return res.status(404).json({errors:["Foto não encontrada"]})        
    }
    if(photo.likes.includes(reqUser._id)){
        res.status(422).json({errors:["Você já curtiu"]})
        return
    }

    photo.likes.push(reqUser._id)
    await photo.save()
    return res.status(200).json({photoId:id, userId:reqUser._id, message:"A ft foi curtida"})
}

//comment funcionality

const commentPhoto = async(req,res) =>{
    const {id} = req.params
    const {comment} = req.body
    const reqUser = req.user;
    const user = await User.findById(reqUser._id)
    const photo = await Photo.findById(id)

    if(!photo){
        return res.status(404).json({errors:["Foto não encontrada"]})        
    }
   const userComment = {
    comment,
    userName:user.name,
    userImage: user.profileImage,
    userId:user._id
   }
    photo.comments.push(userComment)
    await photo.save()
    return res.status(200).json({
        comment:userComment, message:"Comentário inserido"});
}

//search photos by title
const searchPhotos = async(req,res) =>{
    const {q} = req.query
    const photos = await Photo.find({title: new RegExp(q,"i")}).exec()
    return res.status(200).json(photos)
}

module.exports = {
    insertPhoto,
    deletePhoto,
    getAllPhotos,
    getUserPhotos,
    updatePhoto,
    getPhotoById,
    likePhoto,
    commentPhoto,
    searchPhotos
}