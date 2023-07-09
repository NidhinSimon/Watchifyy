const User = require('../model/userModel')
const Category = require("../model/categoryModel");
const bcrypt = require('bcrypt')
const Product = require('../model/poductModel')
const Order = require('../model/orderModel')
const cron = require('node-cron');
const { ObjectId } = require("mongodb");
const moment = require("moment");


const securePass = async (password) => {
  try {
    const passwordhash = await bcrypt.hash(password, 10)
    return passwordhash

  } catch (error) {
    console.log(error.message)
  }
}







const approvecancel = async (req, res) => {
  try {
    const id = req.params.id;
    const cancelRequest = await Order.findByIdAndUpdate(
      id,
      { $set: { status: "Approved" } },
      { new: true }
    );

    if (cancelRequest.status === "Approved" && cancelRequest.payment_method !== "1") {
      const userWallet = await User.findOne({ _id: cancelRequest.userId });

      if (userWallet) {
        await User.updateOne(
          { _id: cancelRequest.userId },
          { $inc: { wallet: cancelRequest.total } }
        );
      } else {
        // Handle the case when user wallet is not found
        // For example, display an error message or take appropriate action
      }



      res.redirect("/cancelrequests");
    } else {
      res.redirect("/cancelrequests");
    }
  } catch (error) {
    console.log(error.message);
    res.redirect("/cancelrequests");
  }
};

const rejectcancel = async (req, res) => {
  try {
    const id = req.params.id;

    const cancelRequest = await Order.findByIdAndUpdate(
      id,
      { $set: { status: "RJECTED BY ADMIN" } },
      { new: true }
    );

    // Perform any additional actions or notifications upon rejection

    res.redirect("/cancelrequests");
  } catch (error) {
    console.log(error.message);
    res.redirect("/cancelrequests");
    res.render('error')
  }
}

const dashboardData = async (req, res, next) => {
  try {
    const orders = await Order.find();

    const salesByDay = {};
    orders.forEach((order) => {
      const date = moment(order.date).format("YYYY-MM-DD");
      if (!salesByDay[date]) {
        salesByDay[date] = 0;
      }
      order.product.forEach((product) => {
        salesByDay[date] += product.price * product.quantity;
      });
    });
    const data = {
      labels: Object.keys(salesByDay),
      datasets: [
        {
          label: "Sales",
          data: Object.values(salesByDay),
          fill: false,
          borderColor: "rgb(75, 192, 192)",
          tension: 0.1,
        },
      ],
    };

    const Cancelorder = await Order.aggregate([
      {
        $match: {
          $or: [
            {
              status: "Returned",
            },
            {
              status: "Delivered",
            },
            {
              status: "Cancelled",
            },
          ],
        },
      },
      {
        $group: {
          _id: {
            status: "$status",
            date: {
              $month: "$date",
            },
          },
          sum: {
            $sum: 1,
          },
        },
      },
    ]);

    let months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    let Delivered = [];
    let delivered = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    let Returned = [];
    let returned = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    let Cancelled = [];
    let cancelled = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

    Cancelorder.forEach((item) => {
      if (item._id.status == "Delivered") Delivered.push(item);

      if (item._id.status == "Returned") Returned.push(item);

      if (item._id.status == "Cancelled") Cancelled.push(item);
    });

    for (let index = 0; index < 12; index++) {
      months.forEach((item) => {
        if (Delivered[index]) {
          if (item == Delivered[index]._id.date)
            delivered[item - 1] = Delivered[index].sum;
        }

        if (Returned[index]) {
          if (item == Returned[index]._id.date)
            returned[item - 1] = Returned[index].sum;
        }

        if (Cancelled[index]) {
          if (item == Cancelled[index]._id.date)
            cancelled[item - 1] = Cancelled[index].sum;
        }
      });
    }


    const monthlyOrders = await Order.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" },
          },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          year: "$_id.year",
          month: "$_id.month",
          count: 1,
        },
      },
    ]);

    const yearlyOrders = await Order.aggregate([
      {
        $group: {
          _id: { $year: "$date" },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          year: "$_id",
          count: 1,
        },
      },
    ]);


    res.json({
      chart: { delivered, cancelled, returned },
      data: data,
      monthlyOrders: monthlyOrders,
      yearlyOrders: yearlyOrders,
    });
  } catch (error) {
    console.error(error);
    next(error);
    res.status(500).send("Server error");
    res.render('error')
  }
};



const loadadmin = async (req, res) => {
  try {
    if (req.session.admin) {
      res.redirect('/adminHome')
    } else {
      res.render('adminLogin')
    }
  } catch (error) {
    console.log(error.message)
    res.render('error')
  }
}
const verifyadmin = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;

    const userData = await User.findOne({ email: email });
    let errorMessage = "Email and password are not correct.";

    if (userData) {
      const passwordMatch = await bcrypt.compare(password, userData.password);
      if (passwordMatch) {
        if (userData.is_admin === 0) {
          res.render('adminLogin', { message: errorMessage });
        } else {
          req.session.admin = userData._id;
          res.redirect('/admin/users');
        }
      } else {
        res.render('adminLogin', { message: errorMessage });
      }
    } else {
      res.render('adminLogin', { message: errorMessage });
    }
  } catch (error) {
    console.log(error.message);
    res.render('error')
  }
}



const cancelrequests = async (req, res) => {
  try {
    const cancelRequests = await Order.find({ status: "Pending" }).lean();
    res.render("cancelrequests", { cancelRequests });
  } catch (error) {
    console.log(error.message);
    res.render('error')
  }
}


const loadDashboard = async (req, res) => {
  try {
    const orderData = await Order.find({}).sort({
      _id: -1,
    });
    const details = await User.find()
    res.render('adminHome', { detail: details, order: orderData });

  } catch (error) {
    console.log(error.message)
    res.render('error')
  }
}

const salesreport = async (req, res) => {
  try {
    const startDate = new Date(req.query.startDate);
    const endDate = new Date(req.query.endDate);

    const orders = await Order.find({
      date: { $gte: startDate, $lte: endDate },
    }).lean();

    const orderData = [];
    const productData = [];

    orders.forEach((order) => {
      const { orderId, date, payment_method, status, subtotal } = order;

      orderData.push({ orderId, date, payment_method, status, subtotal });

      order.product.forEach((product) => {
        const { id, name, price, quantity } = product;

        productData.push({ orderId, id, name, price, quantity });
      });
    });


    res.json({ orders: orderData, products: productData });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to retrieve sales report data" });
    res.render('error')
  }
};

const loadUsers = async (req, res) => {
  try {
    const details = await User.find({ is_admin: 0 })
    res.render('users', { detail: details });
  } catch (error) {
    console.log(error.message)
    res.render('error')
  }
}


const products = async (req, res) => {
  try {
    const categoryData = await Category.find();
    const productData = await Product.aggregate([
      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "categoryData"
        }
      },
      { $unwind: "$categoryData" }
    ]);
    if (productData.length > 0) {
      await res.render("products", { data: productData, category: categoryData, text: "" });
    } else {
      await res.render("products", { data: productData, category: categoryData, text: "No products have been added" });
    }
  }
  catch (error) {
    console.log(error.message);
  }
}


const addproducts = async (req, res) => {
  try {
    const categoryData = await Category.find({ isDeleted: false });
    res.render('addproduct', { category: categoryData });
  } catch (error) {
    console.log(error.message)
    res.render('error')
  }
}

const addproductsLoad = async (req, res) => {
  const category = await Category.findOne({ category: req.body.category });
  const images = req.files.map((file) => {
    return file.filename;
  });


  const productData = new Product({
    productName: req.body.name,
    price: req.body.price,
    offerPrice: req.body.price,
    description: req.body.description,
    images: images,
    brand: req.body.brand,
    category: category._id,
    size: req.body.size,
    stock: req.body.stock,
    isDeleted: false,
  });
  await productData.save()
    .then((response) => {
      res.redirect("/admin/products");
    })
}
const editproduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const productData = await Product.findOne({
      $and: [
        { _id: productId },
        { isDeleted: false }
      ]
    });

    const categorydata = await Category.find({ isDeleted: false })
    if (productData)

      res.render("editproduct", { data: productData, category: categorydata, message: "" });
  } catch (error) {
    console.error(error.message)
  }
}
const updateProduct = async (req, res) => {
  try {
    const id = req.body.id;
    const newName = req.body.name;
    const categorydata = await Category.find({ isDeleted: false })
    const existingProduct = await Product.findOne({
      _id: { $ne: id },
      productName: newName
    });
    if (existingProduct) {
      res.render("editproduct", { data: productData, category: categorydata, message: "Category already exists." });
    }
    await Product.findByIdAndUpdate({ _id: id }, {
      $set: {
        productName: newName,
        price: req.body.price,
        description: req.body.description,
        brand: req.body.brand,
        stock: req.body.stock,
        size: req.body.size,
      }
    });
    res.redirect('/admin/products');
  } catch (error) {
    console.log(error.message);
    res.render('error')
  }
};
const deleteProduct = async (req, res) => {
  try {
    const id = req.params.id;
    await Product.findByIdAndUpdate(id, { isDeleted: true });
    res.redirect('/admin/products');
  } catch (error) {
    console.log(error.message);
    res.render('error')
  }
}

const listProduct = async (req, res) => {
  try {
    const id = req.params.id;
    await Product.findByIdAndUpdate(id, { isDeleted: false });
    res.redirect('/admin/products');
  } catch (error) {
    console.log(error.message);
    res.render('error')
  }
};


const blockUnblockUser = (req, res) => {
  const id = req.body.id;
  const type = req.body.type;
  User.findByIdAndUpdate({ _id: id }, { $set: { isblocked: type === 'Block' ? true : false } })
    .then((response) => {
      if (type === "block") {
        req.session.user = false;
      }
      res.json(response);
      res.redirect("/admin/users");
    })
    .catch((err) => {
      console.log(err.message);
      res.render('error')
    });

}

const loadorder = async (req, res) => {
  try {
    const orderData = await Order.find({}).sort({ _id: -1 });
    res.render("order", { order: orderData });
  } catch (error) {
    console.log(error.message);
  }
}
const loadviewproduct = async (req, res) => {
  try {
    const orderData = await Order.find({ _id: new ObjectId(req.query.id) });
    res.render("orderpage", { order: orderData });
  } catch (error) {
    console.log(error.message);
    res.render('error')
  }
};

const updateStatus = async (req, res) => {
  try {
    const selectedStatus = req.body.statusvalue;
    const orderId = new ObjectId(req.body.id);
    const filter = { _id: orderId };
    const update = { $set: { status: selectedStatus } };
    await Order.updateOne(filter, update);
    res.sendStatus(200);
  } catch (error) {
    console.log(error.message);
    res.sendStatus(500);

  }
};



module.exports = {
  loadadmin,
  verifyadmin,
  loadDashboard,
  loadUsers,
  products,
  addproducts,
  addproductsLoad,
  editproduct,
  updateProduct,
  deleteProduct,
  blockUnblockUser,
  loadorder,
  loadviewproduct,
  listProduct,
  updateStatus,
  dashboardData,
  salesreport,
  cancelrequests,
  approvecancel,
  rejectcancel,


}