const csvParser = require('csv-parser');
const fs = require('fs');
// Handle file upload (using multer or similar middleware)
const upload = multer({ dest: 'uploads/' });

const addProductsFromCSV = async (req, res, next) => {
    try {
        if (!req.file) {
            return next(createError(400, 'CSV file is required!'));
        }

        const products = [];

        // Parse CSV file
        fs.createReadStream(req.file.path)
            .pipe(csvParser())
            .on('data', (row) => {
                const { name, price, description, subcategory, stock, image, discount, category } = row;
                // You can validate each row here
                if (name && price && description && subcategory && stock && category) {
                    products.push({
                        name,
                        price,
                        description,
                        subcategory,
                        stock,
                        image,
                        discount,
                        category
                    });
                }
            })
            .on('end', async () => {
                // Add parsed products to the database
                try {
                    const savedProducts = await Product.insertMany(products);
                    return res.status(201).json({
                        success: true,
                        status: 201,
                        message: 'Products added successfully!',
                        data: savedProducts
                    });
                } catch (error) {
                    return next(createError(500, 'Error saving products to the database'));
                }
            })
            .on('error', (error) => {
                console.error('Error parsing CSV:', error);
                return next(createError(500, 'Error parsing CSV file'));
            });
    } catch (error) {
        console.error('Error adding products:', error);
        return next(createError(500, 'Something went wrong!'));
    }
};

// Example multer middleware for file upload
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

app.post('/api/product/add-from-csv', upload.single('csvFile'), addProductsFromCSV);
