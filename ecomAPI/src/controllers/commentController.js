import commentService from '../services/commentService'

let createNewCommentBlog = async (req, res) => {
    try {
        let data = await commentService.createNewCommentBlog(req.body);
        return res.status(200).json(data);
    } catch (error) {
        console.log(error)
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from server'
        })
    }
}

let getAllCommentByBlogId = async (req, res) => {
    try {
        let data = await commentService.getAllCommentByBlogId(req.query.id);
        return res.status(200).json(data);
    } catch (error) {
        console.log(error)
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from server'
        })
    }
}

let createNewReview = async (req, res) => {
    try {
        let data = await commentService.createNewReview(req.body);
        return res.status(200).json(data);
    } catch (error) {
        console.log(error)
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from server'
        })
    }
}
let getAllReviewByProductId = async (req, res) => {
    try {

        let data = await commentService.getAllReviewByProductId(req.query.id);
        return res.status(200).json(data);
    } catch (error) {
        console.log(error)
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from server'
        })
    }
}
let ReplyReview = async (req, res) => {
    try {

        let data = await commentService.ReplyReview(req.body);
        return res.status(200).json(data);
    } catch (error) {
        console.log(error)
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from server'
        })
    }
}
let deleteReview = async (req, res) => {
    try {

        let data = await commentService.deleteReview(req.body);
        return res.status(200).json(data);
    } catch (error) {
        console.log(error)
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from server'
        })
    }
}

module.exports = {
    createNewReview: createNewReview,
    getAllReviewByProductId: getAllReviewByProductId,
    ReplyReview: ReplyReview,
    deleteReview: deleteReview,
    createNewCommentBlog: createNewCommentBlog,
    getAllCommentByBlogId: getAllCommentByBlogId
}