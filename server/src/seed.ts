import dotenv from 'dotenv';
dotenv.config();

import dns from 'node:dns';
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch {}

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { Category } from './models/Category.js';
import { Product } from './models/Product.js';
import { User } from './models/User.js';

async function seedData() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI not found.');
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log('[Seed] Connected to MongoDB Atlas.');

  // Check if categories already exist
  const existingCategoriesCount = await Category.countDocuments();
  if (existingCategoriesCount > 0) {
    console.log(`[Seed] Database already contains ${existingCategoriesCount} categories. Skipping seed to prevent duplicate or destructive changes.`);
    await mongoose.disconnect();
    return;
  }

  console.log('[Seed] Populating initial agricultural categories and Stitch verified products...');

  // 1. Initial Categories matching Stitch Design
  const categoriesData = [
    {
      name: 'Cassava & Garri',
      slug: 'cassava-and-garri',
      description: 'Processed through traditional hydraulic cassava pressing and micro-fermentation, pan-toasted to crispy perfection, completely grit-free.',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC9vfoslOidX6ROEi4qt8cXES5Ok2_vnFtORoHTo2WfiOW1Mwj-QJfB_LNna0wEj5bjXXRSCJEj4RYgn8wX0s321EeHG0DLhPJqd5Y8LGzpRs4xGnSJS8z-9Dl8l7alXFgxQNAb6bGzXThQ4B144ykr7u1WU_ZxeBihLcMXmevsrmIJgl3UdXdiY4wJQlP1Uv41nXXkyGHFcHgc7fGYtHgRRNgiuD3FE06mdTaQoY4b8o526vG4wArO',
      hsCode: '0714.10.00',
      displayOrder: 1,
      isActive: true,
    },
    {
      name: 'Grains & Cereals',
      slug: 'grains-and-cereals',
      description: 'Northern golden sorghum, polished Ofada rice with authentic brown stripes, white maize, and pearled millet.',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBubFh6eBIWDn3aVvZAozC6FjYk3i7C7ttN0EWVhSH-CKMXra5LkUCVPDXaGVkw7mFBc13i6wLfm3bm1_LkZG0hRV8wFyVEI-z4jBDxIIeWjmvGsf07QRQ_M22uLd7gBJN5TV6TMO5qix0UavsMnB2GYMqBljek4evx-keiYxVijj_-EQO2BNH3SixgVDe80xuEhGRBRdO3AEVaT5fcOquh4D9MYhAQJaXCGDU0DdUtGavHDhSFAtmp',
      hsCode: '1006.10.00',
      displayOrder: 2,
      isActive: true,
    },
    {
      name: 'Dried Fish & Seafood',
      slug: 'dried-fish-and-seafood',
      description: 'Oven-smoked dark mangrove catfish curled and skewered, cleaned and gut-free for international air travel and domestic kitchen use.',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCUKepJJthEhqX35IdBqlwDRKp56H-GarwZ9sNiwjWKxh6zb1xvfZ9tRj05q4pZJOIvYM1AMePuxjZ-sLqjUnAWyvwmYPeFsy4UH2Vz1S3RcUEicyqO-eBBxrZ328DIb7PDhj7is6HXfeILYVd150k1RTvFdgJxw_to29z4tBLvnk6kDvFgazJ-PPFta3ogoTjPo_lsbLENndtUxPi7M9TeF65dYrCAlhuyozz2FbK_xOv48fU2c2LT',
      hsCode: '0305.59.00',
      displayOrder: 3,
      isActive: true,
    },
    {
      name: 'Sun-Dried Crayfish',
      slug: 'sun-dried-crayfish',
      description: 'Export grade 100% de-sanded large Oron crayfish and crushed pink littoral prawns, rich aroma and natural orange pigment.',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDwPiuOkwRnAikcu2Fy3SB4KrU3hs1125VgsjmlOFTrTBTvcxlt64nOhTVkkGSboR5lF6u-5r13GNiVEB6xSZujxXJw8KHw8MIEWkCPaBjjhTS9Fhqh65iJyImxjD6uN1DEFh__tLIAqgDsFy9IBA8glQL_R0XkIVUUj9y_uLmotqlILqBfOEiAIpEJWXhCc5kBzY9ciBOWudGoY8kuM6b7TtZp-jK7fdexTE_VI_nhqGrxwIXGN5wq',
      hsCode: '0306.95.00',
      displayOrder: 4,
      isActive: true,
    },
    {
      name: 'Spices & Seasonings',
      slug: 'spices-and-seasonings',
      description: 'Aromatic Nigerian native spices: split dried ginger, black Uda peppercorns, Uziza seeds, and bold Suya pepper blends.',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA6nokBPMOeFulr2y_o4IDlzoPDaxmp-JKZ_GRl_8m7KbaKnZ-SPHOUzfTvdtcvsrjdFVxyUKm4X0yoowajt--hLQ5TjYS4fnF1yg4N7Uv6__ORMt-3HLlBK96WVZy-L-h7ZqbkupjLvlLcnVkkfa9Kh5xu6kJxjTj5e7g9yrQ3Zy971PAFJBGKDPZXf9iNpDBQNvtuNk6k29LNNk9UWT1ipQe5W401hU6SbOnuiMwCyTz0uPhG1e8v',
      hsCode: '0910.11.00',
      displayOrder: 5,
      isActive: true,
    },
    {
      name: 'Palm Oil & Cooking Oils',
      slug: 'palm-oil-and-oils',
      description: 'Pure cold-pressed unrefined ruby red Nsukka palm oil with zero adulteration and natural palm fruit aroma.',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAbSgmf3jngG_T-oFXM7QpSmh6oE2bGFtxyY9gWJUCB3KPZVr9Mgj4KAKNg5P7kya9uCIsaq1Yf3pZd83wgFWR6jzCx4C_mVh5cBxyElOxYgS6KApFwUP5-rpFkFrpBQT1Tx9hkA67PpaRkQ3NNUk789cAbdkqVOca5rJiNLcESZVq4lClbbdlJxvYlB9jZIM1OXztTfMRHdfEGcz-jF198SeE95BIlAZ9PDjGG0vdxee8saajgiQbS',
      hsCode: '1511.10.00',
      displayOrder: 6,
      isActive: true,
    },
    {
      name: 'Beans & Legumes',
      slug: 'beans-and-legumes',
      description: 'Double hand-picked Nigerian honey beans (Oloyin), sweet brownish seeds polished and sorted without weevils or chemical powders.',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAKAbjMVPM9PLOpEkYxs6Ga83N76EIL0B5Xecs5IVMrgm7uQ9klR7xwTcS8gCByJQ3nO5t187fGTZ8xTSgP4l6E3-53rXmhEbjHvsM01jpt8vkI-8-3X9ugirhOi_KzX1L0rjfeedLYUV8Sx9WPoboQYsHZvk4jQO6ltjLZG-xpj96WGVT4rvMaxaoFnILlnPRB-LQIAe03K8gT4eFcxz6Nj0T-UDPUxiU3dmdjjuryyMohrZ2QgTne',
      hsCode: '0713.35.00',
      displayOrder: 7,
      isActive: true,
    },
    {
      name: 'Wholesale & Bulk',
      slug: 'bulk-and-wholesale',
      description: 'Commercial pallet and 20ft / 40ft container export loads for institutional commodity importers and diaspora retailers.',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAnyyDw_heFEcw9RRgvdlcHnrEt1_q9xr-S1EBr4j6eyuScImTHsM7CWMcuU5JVV4cmbYhagpDnxlgbGTyYxXlYo9ADTYNBruUEpTxTtv9WzKaGj8Tv2F1NFbpS61UKlBGhwUHJO38UuNzzW2tOAqv1sBG2lYJ7WNPMdfOxOxPasAQYIjt5u3e1jAb1CR2nzS_rM5zlha_qEgls4giEN2S1lj-ZuEKWu79_n-kt_Q_7pe6JUjVMs4Ww',
      hsCode: '9999.00.00',
      displayOrder: 8,
      isActive: true,
    },
  ];

  const createdCategories = await Category.insertMany(categoriesData);
  console.log(`[Seed] Created ${createdCategories.length} categories.`);

  // Map slugs to ObjectIds
  const catMap = new Map<string, mongoose.Types.ObjectId>();
  createdCategories.forEach((c) => catMap.set(c.slug, c._id as mongoose.Types.ObjectId));

  // 2. Initial Products matching Stitch Designs
  const productsData = [
    {
      name: 'Ijebu Garri (Extra Crispy & Sour)',
      slug: 'ijebu-garri-extra-crispy-sour',
      description: 'Crispy granular white cassava flakes made with traditional hydraulic micro-fermentation in Ogun State. Renowned for its signature sour bite, zero grit, rapid floatation in water, and long shelf life without deterioration.',
      category: catMap.get('cassava-and-garri'),
      images: [
        'https://lh3.googleusercontent.com/aida-public/AB6AXuAdYHKfcNMO_cd9SW58O-cjm_La6na8YpB50OCUWsWJhOay0Xe0lcEElDfsnYgccyPYOPn9FOWur8oXUAnxadP9AQHz2VjsoUyaScvj3QZLSvXVcnAgKuiiMcHWID1jj-elyWxwoLbqMhRBFap0FMBWwZ8oDobVh-B1OsYRcXXVOQh21aLFmj_Vw8k0EfvANwPrNhSaiaueQifOawAynEIzjqiohTx216kHEkXadwn_zY6p19tQMmbU',
        'https://lh3.googleusercontent.com/aida-public/AB6AXuC9vfoslOidX6ROEi4qt8cXES5Ok2_vnFtORoHTo2WfiOW1Mwj-QJfB_LNna0wEj5bjXXRSCJEj4RYgn8wX0s321EeHG0DLhPJqd5Y8LGzpRs4xGnSJS8z-9Dl8l7alXFgxQNAb6bGzXThQ4B144ykr7u1WU_ZxeBihLcMXmevsrmIJgl3UdXdiY4wJQlP1Uv41nXXkyGHFcHgc7fGYtHgRRNgiuD3FE06mdTaQoY4b8o526vG4wArO',
      ],
      price: 9500,
      internationalPrice: 12.5,
      unit: '5kg bag',
      minOrderQty: 1,
      availableQty: 150,
      originState: 'Ogun State, NG',
      supplier: {
        name: 'Ogun Farmers Cooperative Union',
        coop: 'Ijebu Agro Hub',
        rating: 4.9,
        verified: true,
      },
      specifications: {
        moisture: '< 8.5%',
        processing: 'Hydraulic Micro-fermented & Pan Toasted',
        packaging: 'Double Food-Grade Poly Liner with Moisture Barrier',
        hsCode: '0714.10.00',
        certifications: ['NAFDAC Listed', 'Phytosanitary Inspected', 'Export Tier 1'],
      },
      packageTiers: [
        { label: '5kg Bag', price: 9500, usdPrice: 12.5, unitText: '₦1,900 / kg', stock: 150 },
        { label: '10kg Sack', price: 18500, usdPrice: 24.0, unitText: '₦1,850 / kg', stock: 80 },
        { label: '50kg Bulk Sack', price: 88000, usdPrice: 112.0, unitText: '₦1,760 / kg', stock: 35 },
      ],
      isPublished: true,
      isFeatured: true,
      bestSeller: true,
      airCargoReady: true,
      wholesaleAvailable: true,
    },
    {
      name: 'Premium Cleaned Sun-Dried Oron Crayfish',
      slug: 'premium-cleaned-sun-dried-oron-crayfish',
      description: 'Centrifugally sifted 100% de-sanded giant Oron crayfish harvested from the serene Cross River coastal estuaries in Akwa Ibom. Sun-cured on hygienic elevated racks, locking in explosive umami sweetness, crisp chitin shell, and radiant orange colour.',
      category: catMap.get('sun-dried-crayfish'),
      images: [
        'https://lh3.googleusercontent.com/aida-public/AB6AXuB_ewZlekjGIXREbvmLBrVj7zrhvAXgEMR_vizrYpX8txrlP96EhQL7Z09dwUvj25NCHKkobPqhYSCLfVB1Sqy9QFEJMFlYnM7k0YayTBbxB1ODzpW3pdQgU5_AVWpZo3Jvz8UxLXHVX_e0uZfeKRCXirfNz4VgiJOxljexfqk_8iWzPNSOydxUxc59hYSMD0pEMxcz8_oQ5asdnwCu5EZrlV50mrclOPHmreQPgKx9OteaQLFL08PN',
        'https://lh3.googleusercontent.com/aida-public/AB6AXuBv868nIQLersuWep2lOIsjokT5qZmphfqIUpy2zLLe57atJfw2AOEg72MmpC11SCSesZ3jmqqsr4p3tvxO2PJrRyZC2wTxStq-CsqZ0tWOzmoC5stJOTnyT-xFzCvyO1oY3wew_HRF6e-1CL-_rnBU0Cp1W2ouMiw10Kn8LGGgvktuxiuodDfMrAw-SBAkrflv1CNTJH7lADIcbslM-H-eUHqwIGGGISEGVMYzXKEa6Jf4gsbjI9Pi',
        'https://lh3.googleusercontent.com/aida-public/AB6AXuD_sxFOLJ2ghGdDTeR6frXv1ui0XSjnvKwJD7-6nwmiH7g1pMd200iff2bRbcLHKZXBWibCfUhMP2V59XNtnwQb6o3A2tEOLXFsDUc11KZzRixi4Fayo17_N3o1POIRuHDZwrszGsPljBME6-FbWcoFoS9IXdKiwjKNlfcymamy974LsOaPXkd4GHt8K5ce0pIUzn8PNbLqnjD2DPSqGML06PigIibZ3eQnhTOf3ZiFgGe_5ftfmPf6',
        'https://lh3.googleusercontent.com/aida-public/AB6AXuA5ilOeU3he8OI0oczvTCFVLJtUh3Fx8DjbGexka7KtF9A43lsC584knPbTtNGCSJCrL-KV7s911ibCN6V6PsyH4KTcRgWM_vdmKbpywkPiqKzhqMA_a4CqlA5vM_Byucs0Y-T2XJewDAaTh6v9Sgl4k9NeC57at98y0M_14PfKWo89Ya0tkX6oOLx0R7rwfsyNN_oolF7u7xiA5XciJIgyBr0Knxf4dyUWaw67MbM-zb-vmQk63rsK',
      ],
      price: 14200,
      internationalPrice: 18.0,
      unit: '1kg pouch',
      minOrderQty: 1,
      availableQty: 84,
      originState: 'Akwa Ibom, NG',
      supplier: {
        name: 'Calabar Coast Artisanal Fisheries Cooperative',
        coop: 'Oron Fishermen Alliance',
        rating: 4.9,
        verified: true,
      },
      specifications: {
        moisture: '< 7.8%',
        processing: 'Centrifugally De-sanded & Sun Cured',
        packaging: 'Aroma-Lock Multi-Layer Vacuum Pouch',
        hsCode: '0306.95.00',
        certifications: ['NAFDAC Export Seal', 'CITES Exemption Compliant', 'Zero Preservatives'],
      },
      packageTiers: [
        { label: '500g Pouch', price: 7400, usdPrice: 9.5, unitText: '₦14.80 / gram', stock: 120 },
        { label: '1kg Standup Pouch', price: 14200, usdPrice: 18.0, unitText: '₦14.20 / gram', stock: 84 },
        { label: '5kg Bulk Box', price: 67500, usdPrice: 85.0, unitText: '₦13.50 / gram', stock: 38 },
        { label: '20kg Export Sack', price: 260000, usdPrice: 325.0, unitText: '₦13.00 / gram', stock: 14 },
      ],
      isPublished: true,
      isFeatured: true,
      bestSeller: true,
      airCargoReady: true,
      wholesaleAvailable: true,
    },
    {
      name: 'Cleaned Mangrove Smoked Catfish',
      slug: 'cleaned-mangrove-smoked-catfish',
      description: 'Hygienically curled and kiln-smoked over mangrove wood in Delta State. Gut-cleaned, thoroughly dried to low moisture, free of sand, ready for airline carriage or immediate cooking.',
      category: catMap.get('dried-fish-and-seafood'),
      images: [
        'https://lh3.googleusercontent.com/aida-public/AB6AXuD7qz2fDV1XW71UsYEVsZovr_ZdFyaL2AS2iLcZR82x1uVl8hLN3qcsdh0okdCJAHwCBGvFDIURc3TPCRK94Y5igxjSS6MaKzw8LNCwENd76p_qD9liOSPilcfaUpYRBO6J6BumBV4Y6y3aZvLHNdvhdWQ0Omvui3Q1oH0jlVI8ZFWpwhViDeHU2lyNjcLg8ikfYZvekzWlaZ--UESaxQ1_NCtaTndfpndSCizh2FczvK2n6MJBkRu0',
      ],
      price: 18500,
      internationalPrice: 23.5,
      unit: '1kg carton',
      minOrderQty: 1,
      availableQty: 60,
      originState: 'Delta State, NG',
      supplier: {
        name: 'Niger Delta Agro Hub',
        coop: 'Warri Smokehouse Guild',
        rating: 4.8,
        verified: true,
      },
      specifications: {
        moisture: '< 8.0%',
        processing: 'Mangrove Wood Kiln Smoked',
        packaging: 'Vacuum Sealed Foil Pouch',
        hsCode: '0305.59.00',
        certifications: ['NAQS Export Cleared', 'HACCP Compliant'],
      },
      isPublished: true,
      isFeatured: true,
      bestSeller: false,
      airCargoReady: true,
      wholesaleAvailable: true,
    },
    {
      name: 'Nigerian Honey Beans (Oloyin)',
      slug: 'nigerian-honey-beans-oloyin',
      description: 'Naturally sweet caramel-toned brown cowpeas from Kano State. Hand-picked, free of weevils or chemical dusting powder, quick-cooking with dense buttery gravy.',
      category: catMap.get('beans-and-legumes'),
      images: [
        'https://lh3.googleusercontent.com/aida-public/AB6AXuD4X4p6RmY3FGr9lOVVFhkG2z54nWaSQBrWYpY8NJ6erS_KYpXXHWSnmJmmw1EwqF3xeJyE6dcW6g5I5FUKwzZ8TlPAM_16ilXnSTQVJzVk2rGmyZqSeYg6UgT2UGfpz9FAHfQwpjKepER0OxQFAd4el4qj-GHNvYHadkCyVBTCECrmanS-SZrEO-gEW_WTdVmb1eeEW8XRiZOsDiizwnOJexH9CLGxyIGaLzZK2wruJbezBYgl0X6R',
      ],
      price: 12000,
      internationalPrice: 15.2,
      unit: '5kg bag',
      minOrderQty: 1,
      availableQty: 95,
      originState: 'Kano State, NG',
      supplier: {
        name: 'Kano Grains Alliance',
        coop: 'Dawanau Commodity Market Union',
        rating: 4.9,
        verified: true,
      },
      specifications: {
        moisture: '< 10.0%',
        processing: 'Double Hand-Picked & Sorted',
        packaging: 'Heavy Breathable Jute Sack',
        hsCode: '0713.35.00',
        certifications: ['Pesticide-Free Tested', 'Phytosanitary OK'],
      },
      isPublished: true,
      isFeatured: true,
      bestSeller: true,
      airCargoReady: true,
      wholesaleAvailable: true,
    },
    {
      name: 'Nsukka Pure Red Palm Oil',
      slug: 'nsukka-pure-red-palm-oil',
      description: 'First press unrefined ruby red palm oil extracted in Nsukka, Enugu State. Exceptional heavy body, rich carotene aroma, completely zero artificial colour or adulterants.',
      category: catMap.get('palm-oil-and-oils'),
      images: [
        'https://lh3.googleusercontent.com/aida-public/AB6AXuBsYR_JE0IfuZhZiM7bt6ffqGx5QhHgat8SHSosaDrrpgvX3ffUkmIRlyzyuTPU2wmXSeeyGu3DDnoi-z-OUk_B5E20qpHUZgK4FgM4X4c94qFhS586IxgvTjCBCyRYL7RGz2XmfuRqqwr743HRLoUldNy7OT3NEfzJqt_gFCt13h8yrU1Vzw5cKYNSg9roY8YFldyKZu7LelvsevJ2haw-7IVTmG6BUjBeSVJsKk7IG7FcwRWudIWw',
      ],
      price: 16000,
      internationalPrice: 20.5,
      unit: '4L gallon',
      minOrderQty: 1,
      availableQty: 70,
      originState: 'Enugu State, NG',
      supplier: {
        name: 'Enugu Palm Mills Association',
        coop: 'Nsukka Agro Cooperative',
        rating: 4.8,
        verified: true,
      },
      specifications: {
        moisture: '< 0.2%',
        processing: 'Cold Press Hydraulic Extraction',
        packaging: 'Leak-Proof Heavy Food-Grade Canister',
        hsCode: '1511.10.00',
        certifications: ['100% Unadulterated', 'NAFDAC Certified'],
      },
      isPublished: true,
      isFeatured: true,
      bestSeller: false,
      airCargoReady: false,
      wholesaleAvailable: true,
    },
    {
      name: 'Stone-Free Nigerian Ofada Rice',
      slug: 'stone-free-nigerian-ofada-rice',
      description: 'Indigenous unpolished brown-striped aromatic rice cultivated in Ogun State. Stone-free destoned via modern vibratory aspirators, packed with natural bran fibre and distinctive fragrant aroma.',
      category: catMap.get('grains-and-cereals'),
      images: [
        'https://lh3.googleusercontent.com/aida-public/AB6AXuBubFh6eBIWDn3aVvZAozC6FjYk3i7C7ttN0EWVhSH-CKMXra5LkUCVPDXaGVkw7mFBc13i6wLfm3bm1_LkZG0hRV8wFyVEI-z4jBDxIIeWjmvGsf07QRQ_M22uLd7gBJN5TV6TMO5qix0UavsMnB2GYMqBljek4evx-keiYxVijj_-EQO2BNH3SixgVDe80xuEhGRBRdO3AEVaT5fcOquh4D9MYhAQJaXCGDU0DdUtGavHDhSFAtmp',
      ],
      price: 17500,
      internationalPrice: 22.0,
      unit: '5kg bag',
      minOrderQty: 1,
      availableQty: 110,
      originState: 'Ogun State, NG',
      supplier: {
        name: 'Ogun State Rice Growers Syndicate',
        coop: 'Ofada Heritage Mill',
        rating: 4.7,
        verified: true,
      },
      specifications: {
        moisture: '< 11.5%',
        processing: 'Modern Destoned & Parboiled',
        packaging: 'Multi-layer Poly Weave Bag',
        hsCode: '1006.10.00',
        certifications: ['Stone-Free Guaranteed', 'Export Grade'],
      },
      isPublished: true,
      isFeatured: false,
      bestSeller: false,
      airCargoReady: true,
      wholesaleAvailable: true,
    },
    {
      name: 'Export Grade Dried Split Ginger',
      slug: 'export-grade-dried-split-ginger',
      description: 'Sun-dried split ginger rhizomes from southern Kaduna. High gingerol content, pungent aroma, clean and free of mould or debris, compliant with European spice imports.',
      category: catMap.get('spices-and-seasonings'),
      images: [
        'https://lh3.googleusercontent.com/aida-public/AB6AXuA6nokBPMOeFulr2y_o4IDlzoPDaxmp-JKZ_GRl_8m7KbaKnZ-SPHOUzfTvdtcvsrjdFVxyUKm4X0yoowajt--hLQ5TjYS4fnF1yg4N7Uv6__ORMt-3HLlBK96WVZy-L-h7ZqbkupjLvlLcnVkkfa9Kh5xu6kJxjTj5e7g9yrQ3Zy971PAFJBGKDPZXf9iNpDBQNvtuNk6k29LNNk9UWT1ipQe5W401hU6SbOnuiMwCyTz0uPhG1e8v',
      ],
      price: 8500,
      internationalPrice: 11.0,
      unit: '1kg bag',
      minOrderQty: 1,
      availableQty: 130,
      originState: 'Kaduna State, NG',
      supplier: {
        name: 'Kachia Ginger Processing Union',
        coop: 'Southern Kaduna Agro Cooperative',
        rating: 4.9,
        verified: true,
      },
      specifications: {
        moisture: '< 9.0%',
        processing: 'Sun Dried & Split Hand-Graded',
        packaging: 'Vacuum Sealed Pack',
        hsCode: '0910.11.00',
        certifications: ['EU Spice Import Ready', 'Phytosanitary OK'],
      },
      isPublished: true,
      isFeatured: false,
      bestSeller: false,
      airCargoReady: true,
      wholesaleAvailable: true,
    },
    {
      name: 'Palm Oil Enriched Yellow Garri (Bendel Style)',
      slug: 'palm-oil-enriched-yellow-garri',
      description: 'Authentic Edo/Delta yellow garri toasted with freshly pressed pure palm oil during the pan roast stage. Gives a vibrant golden hue, subtle nutty aroma, and extra crunchy body.',
      category: catMap.get('cassava-and-garri'),
      images: [
        'https://lh3.googleusercontent.com/aida-public/AB6AXuC9vfoslOidX6ROEi4qt8cXES5Ok2_vnFtORoHTo2WfiOW1Mwj-QJfB_LNna0wEj5bjXXRSCJEj4RYgn8wX0s321EeHG0DLhPJqd5Y8LGzpRs4xGnSJS8z-9Dl8l7alXFgxQNAb6bGzXThQ4B144ykr7u1WU_ZxeBihLcMXmevsrmIJgl3UdXdiY4wJQlP1Uv41nXXkyGHFcHgc7fGYtHgRRNgiuD3FE06mdTaQoY4b8o526vG4wArO',
      ],
      price: 11000,
      internationalPrice: 14.0,
      unit: '5kg bag',
      minOrderQty: 1,
      availableQty: 90,
      originState: 'Edo State, NG',
      supplier: {
        name: 'Agbor Agro Processors',
        coop: 'Bendel Farmers Guild',
        rating: 4.8,
        verified: true,
      },
      specifications: {
        moisture: '< 8.8%',
        processing: 'Palm Oil Infused Pan Roast',
        packaging: 'Heavy Food-Grade Sack',
        hsCode: '0714.10.00',
        certifications: ['NAFDAC Listed', 'Export Tier 1'],
      },
      isPublished: true,
      isFeatured: false,
      bestSeller: true,
      airCargoReady: true,
      wholesaleAvailable: true,
    },
  ];

  await Product.insertMany(productsData);
  console.log(`[Seed] Created ${productsData.length} initial products.`);

  // 3. Create default initial Administrator securely if not present
  const existingAdmin = await User.findOne({ role: 'admin' });
  if (!existingAdmin) {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('FarmNexaAdmin2026!', salt);

    await User.create({
      name: 'FarmNexa Administrator',
      email: 'admin@farmnexa.com',
      passwordHash,
      role: 'admin',
      phone: '2348000000000',
    });
    console.log('[Seed] Created default administrator: admin@farmnexa.com');
  }

  console.log('[Seed] Database initialization completed successfully.');
  await mongoose.disconnect();
}

seedData().catch((err) => {
  console.error('[Seed Error]:', err);
  process.exit(1);
});
