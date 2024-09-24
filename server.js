const express = require('express');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const paypal = require('paypal-rest-sdk');
const nodemailer = require('nodemailer');



const app = express();
const encodeUrl = bodyParser.urlencoded({ extended: true });
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));
app.use(bodyParser.json());
app.use(express.text({ type: 'application/xhtml+xml' }));
app.use('/receipts', express.static(path.join(__dirname, 'receipts')));


app.use(session({
    secret: 'thisismysecretkey',
    saveUninitialized: true,
    cookie: { maxAge: 1000 * 60 * 60 * 24 },
    resave: false,
}));

//PAYPAL CONFIGURE

paypal.configure({
    mode: 'sandbox', 
    client_id: 'ASEC26BmPqR2kurf9-maTQLknJzy9EF4m-Sxo-A4lAx6x9ZZ8qyP_gwQynaqm3-cVT-EO0t4fImMLksk',
    client_secret: 'ECb997KQno5oWneatav32ZqByD9-4_sRRNgtFQH0-vkLBnr4oPmNCoCQWs_Ydgdf4qhBziNVoVKvPrTk',
  });

// DATABASES CONNECTIONS

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'myform',
});
const dbProducts = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'test',
  });

  
db.connect((err) => {
    if (err) {
        console.error('Error connecting to myform:', err);
        return;
    }
    console.log('Connected to myform');
});


dbProducts.connect((err) => {
    if (err) {
        console.error('Error connecting to the test:', err);
        throw err;
    }
    console.log('Connected to the test');
});

//EMAIL CONFIGURATION 

const transporter = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "3ca0fcd76313ba",
      pass: "4a0d5055fc2ef3"
    }
  });

  function localEmail(userData, receiptContent) {
    const mailOptions = {
        from: 'musika-eshop@gmail.com',  
        to: userData.email,        
        subject: 'Your Order Receipt',
        html: receiptContent
    };

    transporter.sendMail(mailOptions, function(error, info) {
        if (error) {
            console.error('Error sending email:', error);
        } else {
            console.log('Email sent:', info.response);
        }
    });
}

app.post('/send-receipt', (req, res) => {
    const { userData, receiptContent } = req.body;

    localEmail(userData, receiptContent);

    res.sendStatus(200);
});

//USER'S AUTHENTICATION

const authenticateUser = (req, res, next) => {
    if (req.session.user) {
        next();
    } else {
        res.status(401).redirect('Please log in.');
    }
};

app.get('/getUserId',authenticateUser, (req, res) => {
    const userId = req.session.user ? req.session.user.id : null;
    res.json({ userId });
});

//ADMIN SESSION

const admin = (req, res, next) => {
    const userId = req.session.user ? req.session.user.id : null;
    if (userId === 1) {
        next(); 
    } else {
        res.status(401).send('User is not the admin');
    }
};

app.get('/admin', admin, (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});



//CONTACT US

let messages = [];

app.post('/submit', (req, res) => {
    const { name, email, message } = req.body;

    console.log('Received message:', { name, email, message });

    messages.push({ name, email, message });

    res.status(200).send('Message received!');
});

app.get('/messages', (req, res) => {
    res.status(200).json(messages);
});

//USER'S PHOTO UPLOAD AND STORE

const storage = multer.memoryStorage(); 
const upload = multer({ storage });

app.post('/upload', upload.single('image'), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }
  

    if (!req.session.user || !req.session.user.id) {
      return res.status(401).json({ error: 'Unauthorized. Please log in.' });
    }
  
    const userId = req.session.user.id;
    const imageBuffer = req.file.buffer; 
  

    const query = 'UPDATE users SET image_data = ? WHERE id = ?';
  
 
    db.query(query, [imageBuffer, userId], (err, results) => {
      if (err) {
        console.error('Error updating image:', err);
        return res.status(500).json({ error: 'Internal Server Error', details: err.message });
      } else {
        console.log('Image updated in the users table.');
        res.status(200).json({ message: 'Image updated in the users table.' });
      }
    });
  });
  
  app.delete('/deleteUserPhoto', (req, res) => {
    if (!req.session.user) {
        return res.status(401).send('Unauthorized. Please log in.');
    }

    const userId = req.session.user.id;

    db.query('UPDATE users SET image_data = NULL WHERE id = ?', [userId], (err, results) => {
      
        res.status(200).send('User photo deleted successfully.');
    });
});

//UPDATE ACCOUNT DETAILS

app.post('/uploadDetails', authenticateUser, (req, res) => {
    const userId = req.session.user.id;
    const { Number, Address, PostalCode, State, Area } = req.body;

    let query = "UPDATE users SET";
    const updateFields = [];
    const params = [];

    if (Number) {
        updateFields.push("`Number` = ?");
        params.push(Number);
    }
    if (Address) {
        updateFields.push("`Address` = ?");
        params.push(Address);
    }
    if (PostalCode) {
        updateFields.push("`PostalCode` = ?");
        params.push(PostalCode);
    }
    if (State) {
        updateFields.push("`State` = ?");
        params.push(State);
    }
    if (Area) {
        updateFields.push("`Area` = ?");
        params.push(Area);
    }

    query += " " + updateFields.join(", ") + " WHERE id = ?";
    params.push(userId);

    db.query(query, params, (err, result) => {
        if (err) {
            console.error("Error updating details:", err);
            return res.status(500).send("Error Updating User Details");
        } else {
            console.log("Information Updated Successfully");
            return res.status(200).send("Details Updated");
        }
    });
});


//ADMIN'S PAGE UPDATE  


app.post('/uploadProduct', admin, upload.single('productImage'), (req, res) => {
    const { id, product_name, price, tag, specs, stock } = req.body;

    if (!req.file) {
        return res.status(400).send("No file uploaded.");
    }

    const productImageBuffer = req.file.buffer;

    const query = "INSERT INTO products (id, product_name, price, tag, specs, image, stock) VALUES (?, ?, ?, ?, ?, ?, ?)";

    dbProducts.query(query, [id, product_name, price, tag, specs, productImageBuffer, stock], (err, result) => {
        if (err) {
            console.error("Error adding product: ", err);
            return res.status(500).send("Error adding product to the database");
        } else {
            console.log("Product added successfully");
            return res.status(200).send("Product added successfully");
        }
    });
});

app.delete('/deleteProduct/:id', admin, (req, res) => {
    const productId = req.params.id;

    const query = "DELETE FROM products WHERE id = ?"; 

    dbProducts.query(query, [productId], (err, result) => {
        if (err) {
            console.error("Error deleting product: ", err);
            return res.status(500).send("Error deleting product from the database");
        } else {
            if (result.affectedRows === 0) {
                return res.status(404).send("Product not found");
            }
            console.log("Product deleted successfully");
            return res.status(200).send("Product deleted successfully");
        }
    });
});


app.post('/updateStock', admin, (req, res) => {
    const { productId, newStock } = req.body;

    if (!productId || newStock === undefined) {
        return res.status(400).json({ error: 'ProductId and newStock are required' });
    }

    const query = 'UPDATE products SET stock = ? WHERE id = ?';

    

    dbProducts.query(query, [newStock, productId], (err, result) => {
        if (newStock === 0) {
            return res.status(200).json({ message : 'Out Of Stock' });
        }
        if (err) {
            return res.status(500).send("Error updating product stock");
        } else {
            return res.status(200).send("Product stock updated successfully");
        }
    });
});

//DYNAMIC CALLS OF PRODUCTS INTO HTML

  app.get('/test/products', (req, res) => {
    const productId = req.query.id;
    const searchTerm = req.query.product_name;
    const tags = req.query.tags; 

    let query;

    if (productId) {
        query = `SELECT product_name, price, id, image, Specs FROM products WHERE id = '${productId}'`;
        executeQuery(query);
    } else if (searchTerm) {
        query = 'SELECT product_name, image FROM products WHERE product_name LIKE ?';
        executeQuery(query, [`%${searchTerm}%`]);
    } else if (tags) { 
        const tagsArray = tags.split(','); 
        const placeholders = tagsArray.map(() => '?').join(','); 
        
        query = `SELECT product_name, price, id, image, Specs FROM products WHERE tag IN (${placeholders})`;
        executeQuery(query, tagsArray);
    } else {
        const allProductsQuery = 'SELECT product_name, price, id, image, Specs, stock FROM products';
        executeQuery(allProductsQuery);
    }

    function executeQuery(query, params = []) {
        dbProducts.query(query, params, (err, results) => {
            if (err) {
                console.error('Error executing SQL query:', err);
                return res.status(500).json({ error: 'Internal Server Error' });
            }

            const productsWithBase64Images = results.map(product => {
                if (Buffer.isBuffer(product.image)) {
                    const base64Image = product.image.toString('base64');
                    return { ...product, image: base64Image };
                } else {
                    console.error('Invalid image data for product:', product);
                    return { ...product, image: null };
                }
            });

            res.json(productsWithBase64Images);
        });
    }
});

//ADD TO FAVORITE

app.get('/get_favorites', authenticateUser, (req, res) => {
    try {
        const userId = req.session.user ? req.session.user.id : null;

        db.query('SELECT favorites FROM users WHERE id = ?', [userId], (error, user) => {
            if (error) {
                console.error('Error retrieving user favorites:', error);
                return res.status(500).json({ error: 'Internal Server Error' });
            }

            const userFavorites = user[0].favorites ? JSON.parse(user[0].favorites) : [];

            if (userFavorites.length === 0) {
                return res.status(200).json({ favorites: [] });
            }

            const productIds = userFavorites.map(item => item.productId);

            if (productIds.length === 0) {
                return res.status(200).json({ favorites: [] });
            }

            dbProducts.query('SELECT product_name, id, image FROM products WHERE id IN (?)', [productIds], (error, products) => {
                if (error) {
                    console.error('Error retrieving product names and images:', error);
                    return res.status(500).json({ error: 'Internal Server Error' });
                }

                const productMap = {};
                products.forEach(product => {
                    const imageBase64 = product.image ? `data:image/jpeg;base64,${product.image.toString('base64')}` : null;
                    productMap[product.id] = {
                        productName: product.product_name,
                        image: imageBase64
                    };
                });

                const favoriteProducts = userFavorites.map(favorite => {
                    const productDetails = productMap[favorite.productId] || { productName: 'Product not found', image: null };
                    return {
                        productId: favorite.productId,
                        productName: productDetails.productName,
                        image: productDetails.image
                    };
                });

                return res.status(200).json({ favorites: favoriteProducts });
            });
        });
    } catch (error) {
        console.error('Error in get_favorites route:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});



app.post('/add_favorite', authenticateUser, (req, res) => {
    try {
        const userId = req.session.user ? req.session.user.id : null;
        const productId = req.body.productId;

        db.query('SELECT favorites FROM users WHERE id = ?', [userId], (error, user) => {
            if (error) {
                console.error('Error retrieving user favorites:', error);
                return res.status(500).json({ error: 'Internal Server Error' });
            }

            const userFavorites = user[0].favorites ? JSON.parse(user[0].favorites) : [];

            const existingFavoriteIndex = userFavorites.findIndex(item => item.productId === productId);

            if (existingFavoriteIndex !== -1) {
            } else {
                const newFavorite = {
                    productId: productId,
                };
                userFavorites.push(newFavorite);

                db.query('UPDATE users SET favorites = ? WHERE id = ?', [JSON.stringify(userFavorites), userId], (error) => {
                    if (error) {
                        console.error('Error updating user favorites:', error);
                        return res.status(500).json({ error: 'Internal Server Error' });
                    }

                    return res.status(200).json({ message: 'Product added to favorites successfully', favorites: userFavorites });
                });
            }
        });
    } catch (error) {
        console.error('Error in add_favorite route:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post('/remove_favorite', authenticateUser, (req, res) => {
    try {
        const userId = req.session.user ? req.session.user.id : null;
        const productId = req.body.productId;

        db.query('SELECT favorites FROM users WHERE id = ?', [userId], (error, user) => {
            if (error) {
                console.error('Error retrieving user favorites:', error);
                return res.status(500).json({ error: 'Internal Server Error' });
            }

            const userFavorites = user[0].favorites ? JSON.parse(user[0].favorites) : [];

            const existingFavoriteIndex = userFavorites.findIndex(item => item.productId === productId);

            if (existingFavoriteIndex !== -1) {
                
                userFavorites.splice(existingFavoriteIndex, 1);

          
                db.query('UPDATE users SET favorites = ? WHERE id = ?', [JSON.stringify(userFavorites), userId], (error) => {
                    if (error) {
                        console.error('Error updating user favorites:', error);
                        return res.status(500).json({ error: 'Internal Server Error' });
                    }

                    return res.status(200).json({ message: 'Product removed from favorites successfully', favorites: userFavorites });
                });
            } else {
                return res.status(404).json({ error: 'Product not found in favorites' });
            }
        });
    } catch (error) {
        console.error('Error in remove_favorite route:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});


//PRODUCT DETAILS

  app.get('/test/products/:id', (req, res) => {
    const productId = req.params.id;

    const query = `SELECT product_name, price, id, image, Specs, stock FROM products WHERE id = '${productId}'`;

    dbProducts.query(query, (err, results) => {
        if (err) {
            console.error('Error executing MySQL query:', err);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }

        if (results.length > 0) {
            const product = {
                product_name: results[0].product_name,
                price: results[0].price,
                id: results[0].id,
                image: results[0].image.toString('base64'),
                Specs: results[0].Specs,
                stock : results[0].stock
            };

            res.json(product);
        } else {
            res.status(404).json({ error: 'Product not found' });
        }
    });
});


app.get('/check_stock/:id', async (req, res) => {
    try {
        const productId = req.params.id;

        if (!productId) {
            return res.status(400).json({ error: 'Product ID is required' });
        }

        const getProductQuery = 'SELECT stock FROM products WHERE id = ?';
        const [rows, fields] = await dbProducts.promise().execute(getProductQuery, [productId]);

        if (rows.length === 1) {
            const stock = rows[0].stock;
            res.status(200).json({ stock });
        } else {
            res.status(404).json({ error: 'Product not found' });
        }
    } catch (error) {
        console.error('Error checking product stock:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

//ADD TO CART 

app.get('/add_cart/:id', (req, res) => {
    const productId = req.params.id;

    const query = 'SELECT product_name, price, image FROM products WHERE id = ?';

    dbProducts.query(query, [productId], (err, results) => {
        if (err) {
            console.error('Error executing MySQL query:', err);
            return res.status(500).json({ error: 'Error executing MySQL query', details: err.message });
        }

        if (results.length > 0) {
            const product = {
                product_name: results[0].product_name,
                price: results[0].price,
                image: results[0].image.toString('base64'),
            };

            return res.json(product);
        } else {
            return res.status(404).json({ error: 'Product not found' });
        }
    });
});

app.post('/add_cart', authenticateUser, async (req, res) => {
    try {
        const userId = req.session.user ? req.session.user.id : null;
        const productId = req.body.productId;

        const userCart = await getUserCart(userId);

        const existingProductIndex = userCart.findIndex(item => item.productId === productId);

        if (existingProductIndex !== -1) {
            userCart[existingProductIndex].quantity += 1;
        } else {
            const newProduct = {
                productId: productId,
                quantity: 1,
            };
            userCart.push(newProduct);
        }

        await updateUserCart(userId, userCart);

        return res.status(200).json({ message: 'Product added to the cart successfully', cart: userCart });
    } catch (error) {
        console.error('Error in add_cart route:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

async function getUserCart(userId) {
    return new Promise((resolve, reject) => {
        db.query('SELECT userCart FROM users WHERE id = ?', [userId], (err, results) => {
            if (err) {
                reject(err);
            } else {
                const userCart = results[0] && results[0].userCart !== '' ? JSON.parse(results[0].userCart) : [];
                resolve(userCart);
            }
        });
    });
}

async function updateUserCart(userId, newCart) {
    return new Promise((resolve, reject) => {
        const serializedCart = JSON.stringify(newCart);
        db.query('UPDATE users SET userCart = ? WHERE id = ?', [serializedCart, userId], (err) => {
            if (err) {
                console.error('Error updating userCart in the database:', err);
                reject(err);
            } else {
                console.log('UserCart updated successfully.');
                resolve();
            }
        });
    });
}

app.get('/get_user_cart', authenticateUser, async (req, res) => {
    try {
        const userId = req.session.user ? req.session.user.id : null;

        const userCart = await getUserCart(userId);

        res.json(userCart);
    } catch (error) {
        console.error('Error in get_user_cart route:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


app.delete('/remove_cart/:id', authenticateUser, async (req, res) => {
    try {
        const productId = req.params.id;
        const userId = req.session.user ? req.session.user.id : null;

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const userCart = await getUserCart(userId);
        const existingItemIndex = userCart.findIndex(item => item.productId === productId);

        if (existingItemIndex !== -1) {
            const existingItem = userCart[existingItemIndex];

            if (existingItem.quantity > 1) {
                existingItem.quantity -= 1;
            } else {
                userCart.splice(existingItemIndex, 1);
            }

            await updateUserCart(userId, userCart);

            const totalPrice = TotalPrice(userCart);
            res.status(200).json({ cart: userCart, totalPrice });
        } else {
            res.status(404).json({ error: 'Product not found in the cart' });
        }
    } catch (error) {
        console.error('Error removing item from cart:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

function TotalPrice(userCart) {
    const totalPrice = userCart.reduce((total, item) => {
        return total + (item.price * item.quantity);
    }, 0);

    return totalPrice;
}

// PAYPAL DEMO PAYMENT
app.get('/paypal', authenticateUser, async (req, res) => {
    const userId = req.session.user ? req.session.user.id : null;
    const userCart = await getUserCart(userId);
    const totalPrice = TotalPrice(userCart);

    const createPaymentJson = {
        intent: 'sale',
        payer: {
            payment_method: 'paypal',
        },
        redirect_urls: {
            return_url: 'http://localhost:4000/success',
            cancel_url: 'http://localhost:4000/cancel',
        },
        transactions: [{
            item_list: {
                items: userCart.map(item => ({
                    name: item.product_name,
                    sku: item.productId,
                    price: (item.price || 0).toFixed(2), 
                    currency: 'USD',
                    quantity: item.quantity,
                })),
            },
            amount: {
                currency: 'USD',
                total: totalPrice.toFixed(2), 
            },
            description: 'Your purchase from My Store',
        }],
    };

    paypal.payment.create(createPaymentJson, (error, payment) => {
        if (error) {
            console.error('Error creating PayPal payment:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            const approvalUrl = payment.links.find(link => link.rel === 'approval_url').href;
            res.redirect(approvalUrl);
        }
    });
});

app.route('/success')
    .get(async (req, res) => {
        try {
            const userId = req.session.user ? req.session.user.id : null;
            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const userCart = await getUserCart(userId);
            const totalPrice = TotalPrice(userCart).toFixed(2); 

        } catch (error) {
            console.error('Error in /success GET route:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    })
    .post(async (req, res) => {
        try {
            const userId = req.session.user ? req.session.user.id : null;
            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
    
            const userCart = await getUserCart(userId); 
            
            for (const item of userCart) {
                await productStock(item.productId, item.quantity);
            }
    
            await updateUserCart(userId, []);
             

        } catch (error) {
            console.error('Error in /success POST route:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });


async function productStock(productId, quantity) {
    try {
        const getProductQuery = 'SELECT stock FROM products WHERE id = ?';
        const [rows] = await dbProducts.promise().execute(getProductQuery, [productId]);
        
        if (rows.length === 1) {
            const currentStock = rows[0].stock;
            if (currentStock >= quantity) {
                const newStock = currentStock - quantity;
                const updateStockQuery = 'UPDATE products SET stock = ? WHERE id = ?';
                const [updateResult] = await dbProducts.promise().execute(updateStockQuery, [newStock, productId]);
                if (updateResult.affectedRows === 1) {
                    console.log('Product stock updated successfully. New stock:', newStock);
                } else {
                    console.error('Failed to update product stock for productId:', productId);
                }
            } else {
                console.log('Insufficient stock for productId:', productId);
            }
        } else {
            console.log('Product not found with productId:', productId);
        }
    } catch (error) {
        console.error('Error updating product stock:', error);
    }
}


app.post('/save_receipt', (req, res) => {
    const { receiptContent, orderId } = req.body;
    const receiptFilePath = path.join(__dirname, 'receipts', `ORDER_${orderId}.xhtml`);

    fs.writeFile(receiptFilePath, receiptContent, (err) => {
        if (err) {
            console.error('Error saving receipt:', err);
            return res.status(500).send('Failed to save receipt');
        }
        res.status(200).send('Receipt saved successfully');
    });
})

app.get('/display_receipt', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'receipts.html'));
});

    
//SIGNUP/LOGIN SESSIONS


app.get('/', (req, res) => {
    res.sendFile(__dirname + '/site.html');
});

app.get('/register', (req, res) => {
    res.sendFile(__dirname + '/register.html');
});

app.get('/login', (req, res) => {
    res.sendFile(__dirname + '/login.html');
});


app.post('/register', encodeUrl, async (req, res) => {
    const { username, password, email } = req.body;


    if (!username || !password || !email) {
        return res.status(400).send('All fields (username, password, email) are required.');
    }

    try {

        const userExists = await new Promise((resolve, reject) => {
            db.query(`SELECT * FROM users WHERE username = ?`, [username], (err, results) => {
                if (err) {
                    reject(err);
                }
                resolve(results.length > 0);
            });
        });

        if (userExists) {
            return res.status(400).send('Username is already taken.');
        }

        
        db.query(`INSERT INTO users (username, password, email) VALUES (?, ?, ?)`, [username, password, email], (err, results) => {
            if (err) {
                console.error('Error during registration:', err);
                return res.status(500).send('Registration failed. Please try again later.');
            }
            res.redirect('/login');
        });
    } catch (err) {
        console.error('Error during registration:', err);
        res.status(500).send('Registration failed. Please try again later.');
    }
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;

    db.query(
        'SELECT id, username, email, image_data FROM users WHERE username = ? AND password = ?',
        [username, password],
        (err, results) => {
            if (err) {
                console.error('Error during login:', err);
                return res.status(500).send('Login failed. Please try again later.');
            }

            if (results.length === 1) {
                console.log('User successfully logged in:', results[0]);
                req.session.user = {
                    id: results[0].id,
                    username: results[0].username,
                    email: results[0].email,
                };
                return res.redirect('/');
            } else {
                console.error('Login failed for user:', username);
                return res.status(401).send('Login failed. User not found or password incorrect.');
            }
        }
    );
});

app.post('/reset_password', (req, res) => {
    const { email, newPassword, confirmNewPassword } = req.body;

    if (newPassword !== confirmNewPassword) {
        return res.status(400).send("Passwords don't match.");
    }

    db.query('SELECT id FROM users WHERE email = ?', [email], (err, results) => {
        if (err) {
            console.error('Error finding email:', err);
            return res.status(500).send('Error finding email in the database.');
        }

        if (results.length === 1) {
            const userId = results[0].id;

            db.query('UPDATE users SET password = ? WHERE id = ?', [newPassword, userId], (updateErr, updateResult) => {
                if (updateErr) {
                    console.error('Error updating password:', updateErr);
                    return res.status(500).send('Error updating password in the database.');
                }

                return res.redirect('/login');
            });
        } else {
            console.error('Email not found:', email);
            return res.status(404).send('Email not found in the database.');
        }
    });
});

app.get('/getUserDetails', authenticateUser, (req, res) => {
    if (!req.session.user) {
        return res.status(401).send('Unauthorized. Please log in.');
    }

    const userId = req.session.user.id;

    db.query('SELECT id, username, email, image_data, Number, Address, PostalCode, State, Area FROM users WHERE id = ?', [userId], (err, results) => {
        if (err) {
            console.error('Error fetching user details:', err);
            return res.status(500).send('Error fetching user details. Please try again later.');
        }

        if (results.length === 1) {
            const user = results[0];

            const userDetails = {
                id: user.id,
                username: user.username,
                email: user.email,
                imageData: Buffer.isBuffer(user.image_data) ? user.image_data.toString('base64') : user.image_data,
                Number: user.Number,
                Address: user.Address,
                PostalCode: user.PostalCode,
                State: user.State,
                Area: user.Area
            };

            res.json(userDetails);
        } else {
            console.error('User not found:', userId);
            return res.status(404).send('User not found.');
        }
    });
});


app.get('/checkLoginStatus', (req, res) => {

    if (req.session.user) {
        
        res.json({ loggedIn: true });
    } else {
   
        res.json({ loggedIn: false });
    }
});

app.get('/logout', (req, res) => {

    req.session.destroy(() => {
        res.redirect('/site.html');
        
    });
});

app.listen(4000, () => {
    console.log('Server running on port 4000');
});
