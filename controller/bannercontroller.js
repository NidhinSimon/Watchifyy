const Banner = require('../model/bannerModel')


const createBanner = async (req, res) => {
    try {
        res.render('bannercreate')
    } catch (error) {
        console.log(error.message)
        res.render('error')
    }


}
const loadbanner = async (req, res) => {
    try {
        const bannerData = await Banner.find();
        if (bannerData.length > 0) {
            res.render("banner", { data: bannerData, text: "" });
        } else {
            res.render("banner", { data: bannerData, text: "No banners have been added!!!" });
        }
    } catch (error) {
        console.log(error);
        res.render('error')
    }
}

const addnewbanner = async (req, res) => {
    const bannerTitle = req.body.title;
    const bannerDescription = req.body.description;
    const image = req.file;
    const lowerbannerTitle = bannerTitle.toUpperCase();
    try {
        const bannerExist = await Banner.findOne({ mainHeading: lowerbannerTitle });
        if (!bannerExist) {
            const newBanner = new Banner({
                mainHeading: lowerbannerTitle,
                description: bannerDescription,
                bannerImage: image.filename,
            });
            await newBanner.save().then((response) => {
                res.redirect("/banner");
            })
        } else {
            res.redirect("/addbanner");
        }
    } catch (error) {
        console.log(error.message)
        res.render('error')
    }
}

const deleteBanner = async (req, res) => {
    try {
        await Banner.deleteOne({ _id: req.params.id });
        const bannerData = await Banner.find();
        if (bannerData.length > 0) {
            res.render("banner", { data: bannerData, text: "" });
        } else {
            res.render("banner", { data: bannerData, text: "All banners have been deleted!!!" });
        }

    } catch (error) {
        console.log(error.message);
        res.render('error')
    }
};

module.exports = {
    createBanner,
    addnewbanner,
    loadbanner,
    deleteBanner
}