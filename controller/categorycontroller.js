
const Category = require("../model/categoryModel");
const Product = require('../model/poductModel')


const addcategory = async (req, res) => {
    try {
        res.render('addcategory')
    } catch (error) {
        console.log(error.message);
        res.render('error')
    }
}
const category = async (req, res) => {
    try {
        const categoryData = await Category.find({ isDeleted: false });



        if (categoryData.length > 0) {
            res.render("category", { data: categoryData, text: "" });
        } else {
            res.render("category", { data: categoryData, text: "No Category has been added!!!" });
        }

    } catch (error) {
        console.log(error.message)
        res.render('error')
    }
}
const categoryLoad = async (req, res) => {


    const categoryName = req.body.name;
    const image = req.file;
    const lowerCategoryName = categoryName.toUpperCase();
    try {
        const categoryExist = await Category.findOne({ category: lowerCategoryName });
        if (!categoryExist) {
            const newCategory = new Category({
                category: lowerCategoryName,
                Image: image.filename,
            });
            await newCategory.save().then((response) => {
                res.redirect("/admin/category");
            });
        } else {
            res.redirect("/admin/addcategory");
        }
    } catch (error) {
        console.error(error.message)
        res.render('error')
    }
};
const editcategory = async (req, res) => {
    try {
        const categoryId = req.params.id;
        const categoryData = await Category.findById({ _id: categoryId });

        res.render("editcategory", { data: categoryData, message: "" });
    } catch (error) {
        console.error(error.message)
        res.render('error')
    }
}
const updateCategory = async (req, res) => {
    try {



        const id = req.body.id;


        const existingCategory = await Category.findOne({
            name: req.body.name,
        });
        if (existingCategory) {
            return res.render("editcategory", {
                message: "Category is Already added",
            });
        }

        await Category.findByIdAndUpdate(
            { _id: req.body.id },
            {
                $set: { category: req.body.name },
            }
        );
        res.redirect("/admin/category");
    } catch (error) {
        console.error(error.message)
        res.render('error')
    }
}
const deletecategory = async (req, res) => {
    try {
        const id = req.params.id
        await Category.findByIdAndUpdate({ _id: id }, { $set: { isDeleted: true } });
        await Product.updateMany({ category: id }, { $set: { isDeleted: true } });

        const categoryData = await Category.find({ isDeleted: false });
        if (categoryData.length > 0) {
            res.render('category', { data: categoryData, text: "" })
        } else {
            res.render('category', { data: categoryData, text: "All categories have been deleted" })
        }

    } catch (error) {
        console.log(error.message);
        res.render('error')
    }
}


module.exports = {
    addcategory, categoryLoad, category, editcategory, updateCategory, deletecategory
}