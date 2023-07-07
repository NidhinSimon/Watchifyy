const adminController = require('../controller/admincontroller')
const categoryController = require('../controller/categorycontroller')
const couponController = require('../controller/couponcontroller')
const bannercontroller = require('../controller/bannercontroller')
const Offercontroller = require('../controller/offerController')
const express = require('express')

const Upload = require('../helper/multer');
const auth = require("../middleware/adminauth")

const admin_route = express()


admin_route.use(express.json());
admin_route.use(express.urlencoded({ extended: false }))

admin_route.set('view engine', 'ejs');
admin_route.set('views', './views/admin');


admin_route.get('/admin', adminController.loadadmin)
admin_route.post('/admin', adminController.verifyadmin)
admin_route.get('/adminHome', adminController.loadDashboard)
admin_route.get('/admin/users', adminController.loadUsers)
admin_route.post('/admin/blockUnblockUser', adminController.blockUnblockUser)

admin_route.get('/admin/category', categoryController.category)
admin_route.get('/admin/addcategory', categoryController.addcategory)
admin_route.post('/admin/category', Upload.single('image',), categoryController.categoryLoad);
admin_route.get('/admin/category/deletecategory/:id', categoryController.deletecategory)

admin_route.get('/admin/products', adminController.products)
admin_route.get('/admin/addproducts', adminController.addproducts)
admin_route.post('/admin/addproducts', Upload.array('image', 3), adminController.addproductsLoad);


admin_route.get('/orders', adminController.loadorder)
admin_route.get('/view-product', adminController.loadviewproduct);

admin_route.get('/admin/category/edit/:id', categoryController.editcategory)
admin_route.post('/admin/editcategory', Upload.single('image'), categoryController.updateCategory)

admin_route.get('/admin/editproduct/:id', adminController.editproduct)
admin_route.post('/admin/editproduct', Upload.array('image', 3), adminController.updateProduct)
admin_route.get('/admin/product/deleteproduct/:id', adminController.deleteProduct)
admin_route.get('/productList/:id', adminController.listProduct);

admin_route.get("/bannerDelete/:id", bannercontroller.deleteBanner);


admin_route.get('/coupons', couponController.loadcoupon)
admin_route.get('/addcoupon', couponController.addcoupon)
admin_route.post('/addcoupon', couponController.insertCoupon);

admin_route.post("/updateStatus", adminController.updateStatus)

admin_route.get("/admin-dash", adminController.dashboardData);

admin_route.get("/salesreport", adminController.salesreport)


admin_route.post('/updatecouponStatus', couponController.updateCouponStatus)

admin_route.get('/banner', bannercontroller.loadbanner)
admin_route.get('/addbanner', bannercontroller.createBanner)
admin_route.post('/addbanner', Upload.single('image'), bannercontroller.addnewbanner)

admin_route.get('/offer', Offercontroller.offerLoad)


admin_route.get("/productOfferCreate", Offercontroller.productoffercreate);
admin_route.post("/productOfferCreate", Offercontroller.addproductoffer);

admin_route.get('/categoryoffercreate', Offercontroller.categoryoffercreate)
admin_route.post('/categoryoffercreate', Offercontroller.addcategoryoffer)

admin_route.get('/handleexpiredoffers',Offercontroller.handleexpiredoffers)



admin_route.get("/productOfferDelete/:id",  Offercontroller.deleteProductOffer);
admin_route.get("/categoryOfferDelete/:id", Offercontroller.deleteCategoryOffer);


admin_route.get('/cancelrequests',adminController.cancelrequests)


admin_route.get('/approveCancel/:id',adminController.approvecancel)

admin_route.get('/rejectCancel/:id',adminController.rejectcancel)






module.exports = admin_route

