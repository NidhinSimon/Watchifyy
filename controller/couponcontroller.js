const Coupon = require("../model/couponModel");
const { ObjectId } = require("mongodb");


const ITEMS_PER_PAGE = 10;

const loadcoupon = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const totalCoupons = await Coupon.countDocuments();
    const totalPages = Math.ceil(totalCoupons / ITEMS_PER_PAGE);

    const coupons = await Coupon.find().sort({ _id: -1 })
      .skip((page - 1) * ITEMS_PER_PAGE)
      .limit(ITEMS_PER_PAGE);

    res.render("coupon", {
      coupon: coupons,
      currentPage: page,
      totalPages: totalPages
    });
  } catch (error) {
    console.log(error);
  }
};

const addcoupon = async (req, res) => {
  try {
    res.render("addcoupon");
  } catch (error) {
    console.log(error);
    res.render('error')
  }
};
const insertCoupon = async (req, res) => {
  try {
    const coupon = new Coupon({
      code: req.body.code,
      date: req.body.date,
      percentage: req.body.percent,
    });

    // Check if the coupon already exists.
    const existingCoupon = await Coupon.findOne({ code: coupon.code });
    if (existingCoupon) {
      req.flash("error", "Coupon already exists. Please enter a different coupon name.");
      res.redirect("/addcoupon");
      return;
    }

    await coupon.save();
    req.flash("success", "Coupon added successfully!");
    res.redirect("/coupons");
  } catch (error) {
    console.log(error);
    req.flash("error", "An error occurred while adding the coupon.");
    res.redirect("/addcoupon");
    res.render('error')
  }
};



const updateCouponStatus = async (req, res) => {
  try {
    const { statusvalue, id } = req.body;
    const couponId = new ObjectId(id);

    const filter = { _id: couponId };
    const update = { $set: { status: statusvalue } };
    await Coupon.updateOne(filter, update);
    res.sendStatus(200);
  } catch (error) {
    console.log(error.message);
    res.sendStatus(500);
    res.render('error')
  }
};


module.exports = {
  loadcoupon,
  addcoupon,
  insertCoupon,
  updateCouponStatus
};
