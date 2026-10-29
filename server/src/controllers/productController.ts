import { Request, Response } from 'express';
import { Product } from '../models/Product.js';
import { Category } from '../models/Category.js';

/**
 * Public: Get products with robust filtering, search, sorting, and pagination
 */
export async function getProducts(req: Request, res: Response): Promise<void> {
  try {
    const {
      search,
      category,
      minPrice,
      maxPrice,
      sort,
      origin,
      airCargo,
      page = 1,
      limit = 12,
      all = 'false',
    } = req.query;

    const query: any = {};

    // For customers, show only published products
    if (all !== 'true') {
      query.isPublished = true;
    }

    // Category filter by slug or id
    if (category) {
      const cat = await Category.findOne({
        $or: [{ slug: category as string }, { _id: (category as string).match(/^[0-9a-fA-F]{24}$/) ? category : null }],
      });
      if (cat) {
        query.category = cat._id;
      } else {
        res.json({
          success: true,
          products: [],
          pagination: { total: 0, page: Number(page), pages: 0 },
        });
        return;
      }
    }

    // Keyword search
    if (search && typeof search === 'string') {
      const trimmedSearch = search.trim();
      if (trimmedSearch) {
        query.$or = [
          { name: { $regex: trimmedSearch, $options: 'i' } },
          { description: { $regex: trimmedSearch, $options: 'i' } },
          { originState: { $regex: trimmedSearch, $options: 'i' } },
        ];
      }
    }

    // Price range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Region origin
    if (origin && typeof origin === 'string') {
      query.originState = { $regex: origin, $options: 'i' };
    }

    // Air cargo status
    if (airCargo === 'true') {
      query.airCargoReady = true;
    }

    // Sorting
    let sortOption: any = { createdAt: -1 };
    if (sort === 'price_asc') sortOption = { price: 1 };
    else if (sort === 'price_desc') sortOption = { price: -1 };
    else if (sort === 'oldest') sortOption = { createdAt: 1 };
    else if (sort === 'featured') sortOption = { isFeatured: -1, createdAt: -1 };

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(50, Math.max(1, Number(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [products, total] = await Promise.all([
      Product.find(query)
        .populate('category', 'name slug hsCode')
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum),
      Product.countDocuments(query),
    ]);

    res.json({
      success: true,
      products,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
        limit: limitNum,
      },
    });
  } catch (error: any) {
    console.error('[Get Products Error]:', error.message);
    res.status(500).json({ success: false, message: 'Failed to retrieve products.' });
  }
}

/**
 * Public: Get single product by slug
 */
export async function getProductBySlug(req: Request, res: Response): Promise<void> {
  try {
    const { slug } = req.params;

    const product = await Product.findOne({ slug }).populate('category', 'name slug hsCode');

    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found.' });
      return;
    }

    // Fetch related products in same category
    const related = await Product.find({
      category: product.category,
      _id: { $ne: product._id },
      isPublished: true,
    })
      .limit(4)
      .select('name slug price internationalPrice images unit originState supplier stockStatus');

    res.json({
      success: true,
      product,
      related,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Error retrieving product.' });
  }
}

/**
 * Admin: Create product
 */
export async function createProduct(req: Request, res: Response): Promise<void> {
  try {
    const {
      name,
      description,
      category,
      images,
      cloudinaryIds,
      price,
      internationalPrice,
      unit,
      minOrderQty,
      availableQty,
      originState,
      supplier,
      specifications,
      packageTiers,
      isPublished,
      isFeatured,
      bestSeller,
      airCargoReady,
      wholesaleAvailable,
    } = req.body;

    if (!name || !description || !category || !price) {
      res.status(400).json({
        success: false,
        message: 'Name, description, category, and price in NGN are required.',
      });
      return;
    }

    const cat = await Category.findById(category);
    if (!cat) {
      res.status(400).json({ success: false, message: 'Specified category does not exist.' });
      return;
    }

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    // Check unique slug
    let finalSlug = slug;
    const existing = await Product.findOne({ slug: finalSlug });
    if (existing) {
      finalSlug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    const product = await Product.create({
      name: name.trim(),
      slug: finalSlug,
      description: description.trim(),
      category: cat._id,
      images: Array.isArray(images) && images.length > 0 ? images : ['https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80'],
      cloudinaryIds: cloudinaryIds || [],
      price: Number(price),
      internationalPrice: internationalPrice ? Number(internationalPrice) : undefined,
      unit: unit ? unit.trim() : 'kg',
      minOrderQty: minOrderQty ? Number(minOrderQty) : 1,
      availableQty: availableQty !== undefined ? Number(availableQty) : 100,
      originState: originState ? originState.trim() : 'Nigeria',
      supplier: supplier || { name: 'FarmNexa Certified Cooperative', verified: true },
      specifications: specifications || { moisture: '< 10%' },
      packageTiers: packageTiers || [],
      isPublished: isPublished !== undefined ? Boolean(isPublished) : true,
      isFeatured: Boolean(isFeatured),
      bestSeller: Boolean(bestSeller),
      airCargoReady: airCargoReady !== undefined ? Boolean(airCargoReady) : true,
      wholesaleAvailable: wholesaleAvailable !== undefined ? Boolean(wholesaleAvailable) : true,
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully.',
      product,
    });
  } catch (error: any) {
    console.error('[Create Product Error]:', error.message);
    res.status(500).json({ success: false, message: error.message || 'Failed to create product.' });
  }
}

/**
 * Admin: Update product
 */
export async function updateProduct(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found.' });
      return;
    }

    const fields = [
      'name',
      'description',
      'category',
      'images',
      'cloudinaryIds',
      'price',
      'internationalPrice',
      'unit',
      'minOrderQty',
      'availableQty',
      'originState',
      'supplier',
      'specifications',
      'packageTiers',
      'isPublished',
      'isFeatured',
      'bestSeller',
      'airCargoReady',
      'wholesaleAvailable',
    ];

    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        (product as any)[field] = req.body[field];
      }
    });

    if (req.body.name && req.body.name !== product.name) {
      product.name = req.body.name.trim();
      product.slug = req.body.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
    }

    await product.save();

    res.json({
      success: true,
      message: 'Product updated successfully.',
      product,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to update product.' });
  }
}

/**
 * Admin: Delete product
 */
export async function deleteProduct(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found.' });
      return;
    }

    res.json({
      success: true,
      message: 'Product deleted successfully.',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to delete product.' });
  }
}
