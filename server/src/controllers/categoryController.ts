import { Request, Response } from 'express';
import { Category } from '../models/Category.js';
import { Product } from '../models/Product.js';

/**
 * Public: Get all active categories
 */
export async function getCategories(req: Request, res: Response): Promise<void> {
  try {
    const includeInactive = req.query.all === 'true';
    const filter = includeInactive ? {} : { isActive: true };

    const categories = await Category.find(filter).sort({ displayOrder: 1, name: 1 });

    // Update dynamic item count
    const categoriesWithCount = await Promise.all(
      categories.map(async (cat) => {
        const count = await Product.countDocuments({
          category: cat._id,
          isPublished: true,
        });
        const catObj = cat.toObject();
        catObj.itemCount = count;
        return catObj;
      })
    );

    res.json({
      success: true,
      categories: categoriesWithCount,
    });
  } catch (error: any) {
    console.error('[Get Categories Error]:', error.message);
    res.status(500).json({ success: false, message: 'Failed to retrieve categories.' });
  }
}

/**
 * Public: Get category by slug
 */
export async function getCategoryBySlug(req: Request, res: Response): Promise<void> {
  try {
    const { slug } = req.params;
    const category = await Category.findOne({ slug });

    if (!category) {
      res.status(404).json({ success: false, message: 'Category not found.' });
      return;
    }

    const itemCount = await Product.countDocuments({
      category: category._id,
      isPublished: true,
    });

    res.json({
      success: true,
      category: {
        ...category.toObject(),
        itemCount,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Error retrieving category.' });
  }
}

/**
 * Admin: Create category
 */
export async function createCategory(req: Request, res: Response): Promise<void> {
  try {
    const { name, description, image, cloudinaryId, hsCode, displayOrder } = req.body;

    if (!name) {
      res.status(400).json({ success: false, message: 'Category name is required.' });
      return;
    }

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    const existing = await Category.findOne({ slug });
    if (existing) {
      res.status(409).json({ success: false, message: 'A category with this name already exists.' });
      return;
    }

    const category = await Category.create({
      name: name.trim(),
      slug,
      description: description?.trim() || '',
      image: image || '',
      cloudinaryId: cloudinaryId || '',
      hsCode: hsCode?.trim() || '',
      displayOrder: displayOrder ? Number(displayOrder) : 0,
      isActive: true,
    });

    res.status(201).json({
      success: true,
      message: 'Category created successfully.',
      category,
    });
  } catch (error: any) {
    console.error('[Create Category Error]:', error.message);
    res.status(500).json({ success: false, message: 'Failed to create category.' });
  }
}

/**
 * Admin: Update category
 */
export async function updateCategory(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { name, description, image, cloudinaryId, hsCode, displayOrder, isActive } = req.body;

    const category = await Category.findById(id);
    if (!category) {
      res.status(404).json({ success: false, message: 'Category not found.' });
      return;
    }

    if (name) {
      category.name = name.trim();
      category.slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
    }
    if (description !== undefined) category.description = description.trim();
    if (image !== undefined) category.image = image;
    if (cloudinaryId !== undefined) category.cloudinaryId = cloudinaryId;
    if (hsCode !== undefined) category.hsCode = hsCode.trim();
    if (displayOrder !== undefined) category.displayOrder = Number(displayOrder);
    if (isActive !== undefined) category.isActive = Boolean(isActive);

    await category.save();

    res.json({
      success: true,
      message: 'Category updated successfully.',
      category,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to update category.' });
  }
}

/**
 * Admin: Delete category safely (prevent orphaned products)
 */
export async function deleteCategory(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const category = await Category.findById(id);
    if (!category) {
      res.status(404).json({ success: false, message: 'Category not found.' });
      return;
    }

    const assignedProductsCount = await Product.countDocuments({ category: category._id });
    if (assignedProductsCount > 0) {
      res.status(400).json({
        success: false,
        message: `Cannot delete category: ${assignedProductsCount} product(s) are currently assigned to it. Please reassign or deactivate the category instead.`,
      });
      return;
    }

    await Category.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Category deleted successfully.',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to delete category.' });
  }
}
