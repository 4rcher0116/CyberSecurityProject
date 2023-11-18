const fileInfo = (req, res, next) => {
    if(!req.files) return res.status(400).json({ status: "error", message: "No files uploaded to be submitted"})

    next();
}

module.exports = fileInfo