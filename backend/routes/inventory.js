const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

router.get('/', async (req, res) => {
    try {
        const { storeId } = req.query;
        const where = storeId ? { storeId: parseInt(storeId) } : {};

        const products = await prisma.product.findMany({
            where,
            include: {
                store: true,
                history: {
                    orderBy: { date: 'desc' }
                }
            }
        });
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const { name, price, stock, storeId, code, category, providerPrice, providerName, comparePrice, unit, imageUrl } = req.body;
        const product = await prisma.product.create({
            data: {
                name,
                code: code || `PROD-${Math.floor(Math.random() * 1000)}`,
                category: category || "General",
                unit: unit || "pz",
                price: parseFloat(price),
                providerPrice: providerPrice ? parseFloat(providerPrice) : 0,
                providerName: providerName || "",
                comparePrice: comparePrice ? parseFloat(comparePrice) : 0,
                imageUrl: imageUrl || null,
                stock: parseFloat(stock),
                storeId: parseInt(storeId),
                history: {
                    create: {
                        type: "Ingreso",
                        quantity: parseFloat(stock),
                        details: "Carga inicial de producto"
                    }
                }
            }
        });
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Upload Product Image
router.post('/:id/upload', async (req, res) => {
    try {
        if (!req.files || Object.keys(req.files).length === 0) {
            return res.status(400).send('No files were uploaded.');
        }

        const { id } = req.params;
        const imageFile = req.files.image;
        const uploadDir = path.join(__dirname, '../public/uploads/products');

        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        const fileName = `prod_${id}_${Date.now()}${path.extname(imageFile.name)}`;
        const uploadPath = path.join(uploadDir, fileName);

        await imageFile.mv(uploadPath);

        const imageUrl = `http://localhost:3001/uploads/products/${fileName}`;

        const updatedProduct = await prisma.product.update({
            where: { id: parseInt(id) },
            data: { imageUrl }
        });

        res.json(updatedProduct);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update Product Details
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, code, category, unit, price, providerPrice, providerName, comparePrice } = req.body;

        const updatedProduct = await prisma.product.update({
            where: { id: parseInt(id) },
            data: {
                name,
                code,
                category,
                unit,
                price: parseFloat(price) || 0,
                providerPrice: providerPrice ? parseFloat(providerPrice) : 0,
                providerName: providerName || "",
                comparePrice: comparePrice ? parseFloat(comparePrice) : 0,
            }
        });

        res.json(updatedProduct);
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ error: error.message });
    }
});

// Adjust Stock (Increase/Decrease)
router.post('/:id/adjust', async (req, res) => {
    try {
        const { id } = req.params;
        const { quantity, type, details } = req.body; // type: 'Ingreso' or 'Salida'

        const product = await prisma.product.findUnique({ where: { id: parseInt(id) } });
        if (!product) return res.status(404).send('Product not found');

        const newStock = type === 'Ingreso'
            ? product.stock + parseFloat(quantity)
            : product.stock - parseFloat(quantity);

        const updatedProduct = await prisma.product.update({
            where: { id: parseInt(id) },
            data: {
                stock: newStock,
                history: {
                    create: {
                        type,
                        quantity: parseFloat(quantity),
                        details: details || `Ajuste manual: ${type}`
                    }
                }
            },
            include: { history: { orderBy: { date: 'desc' } } }
        });

        res.json(updatedProduct);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// Transfer Stock between Stores
router.post('/transfer', async (req, res) => {
    const { productId, targetStoreId, quantity, reason } = req.body;

    if (!productId || !targetStoreId || !quantity) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        await prisma.$transaction(async (prisma) => {
            // 1. Get Source Product
            const sourceProduct = await prisma.product.findUnique({
                where: { id: parseInt(productId) },
                include: { store: true }
            });

            if (!sourceProduct) throw new Error('Source product not found');
            if (sourceProduct.stock < quantity) throw new Error('Insufficient stock');

            // 2. Decrement Source Stock
            await prisma.product.update({
                where: { id: sourceProduct.id },
                data: {
                    stock: { decrement: parseFloat(quantity) },
                    history: {
                        create: {
                            type: "Salida",
                            quantity: parseFloat(quantity),
                            details: `Transferencia a Tienda #${targetStoreId}: ${reason || ''}`
                        }
                    }
                }
            });

            // 3. Find or Create Target Product
            // We search by CODE and STORE_ID
            let targetProduct = await prisma.product.findFirst({
                where: {
                    code: sourceProduct.code,
                    storeId: parseInt(targetStoreId)
                }
            });

            if (targetProduct) {
                // Update existing
                await prisma.product.update({
                    where: { id: targetProduct.id },
                    data: {
                        stock: { increment: parseFloat(quantity) },
                        history: {
                            create: {
                                type: "Ingreso",
                                quantity: parseFloat(quantity),
                                details: `Transferencia desde ${sourceProduct.store.name}`
                            }
                        }
                    }
                });
            } else {
                // Create new
                await prisma.product.create({
                    data: {
                        code: sourceProduct.code,
                        name: sourceProduct.name,
                        category: sourceProduct.category,
                        unit: sourceProduct.unit,
                        price: sourceProduct.price,
                        providerPrice: sourceProduct.providerPrice,
                        providerName: sourceProduct.providerName,
                        comparePrice: sourceProduct.comparePrice,
                        imageUrl: sourceProduct.imageUrl,
                        storeId: parseInt(targetStoreId),
                        stock: parseFloat(quantity),
                        history: {
                            create: {
                                type: "Ingreso",
                                quantity: parseFloat(quantity),
                                details: `Transferencia desde ${sourceProduct.store.name} (Nuevo)`
                            }
                        }
                    }
                });
            }
        });

        res.json({ success: true, message: 'Transfer completed successfully' });
    } catch (error) {
        console.error("Transfer Error:", error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
