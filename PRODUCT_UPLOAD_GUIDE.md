# Product Upload Guide - Colors & Images

## 📸 How Images Map to Colors

When you upload a product with **multiple colors** and **multiple images**, they automatically map in order:

```
Image 1  →  Color 1
Image 2  →  Color 2
Image 3  →  Color 3
etc...
```

### Example Product Upload

Let's say you're adding **"Women's Rayon Dress"** with 6 color variants:

#### Step 1: Upload Images (in order)
1. Red dress image
2. Purple dress image  
3. Black dress image
4. White dress image
5. Blue dress image
6. Green dress image

#### Step 2: Add Colors (in same order)
1. Red
2. Purple
3. Black
4. White
5. Blue
6. Green

---

## 🎯 Customer Experience

When a customer views the product:
1. **Clicks on "Red" color** → Shows Image 1 (Red dress)
2. **Clicks on "Purple" color** → Shows Image 2 (Purple dress)
3. **Clicks on "Black" color** → Shows Image 3 (Black dress)

**The image automatically switches based on color selection!** ✨

---

## 📝 Upload Process in Vendor Admin

### 1. Go to "Add Product" page

### 2. Fill Basic Info
- **Name**: Women's Rayon Fit and Flare Below The Knee Formal Dress
- **Price**: 400
- **Discount Price**: 350 (optional)
- **Stock**: 100
- **Category**: Select from dropdown

### 3. Add Images (IMPORTANT: Upload in color order!)
Click **"Choose Images"** and upload in order:
```
📷 Image 1: red-dress.jpg     (for Red variant)
📷 Image 2: purple-dress.jpg  (for Purple variant)
📷 Image 3: black-dress.jpg   (for Black variant)
📷 Image 4: white-dress.jpg   (for White variant)
📷 Image 5: blue-dress.jpg    (for Blue variant)
📷 Image 6: green-dress.jpg   (for Green variant)
```

### 4. Add Sizes
```
S, M, L, XL, XXL
```

### 5. Add Colors (Must match image order!)
```
Red, Purple, Black, White, Blue, Green
```

### 6. Submit
Click **"Add Product"** → Images uploaded to AWS S3 automatically!

---

## ⚠️ Important Rules

### ✅ DO:
- Upload images in the **same order** as colors
- Use **clear, high-quality** images (at least 800x800px)
- Name colors consistently (e.g., "Red" not "red" or "RED")
- Include at least **one image per color**

### ❌ DON'T:
- Mix up the image order
- Upload different products in one listing
- Use very large files (keep under 5MB per image)
- Add more colors than images (extra colors won't show image change)

---

## 🔄 What if I have more images than colors?

If you upload:
- **6 images**
- **3 colors** (Red, Blue, Green)

Mapping:
- Red → Image 1
- Blue → Image 2
- Green → Image 3
- Images 4-6 → Available in thumbnail gallery but not linked to colors

---

## 🔄 What if I have more colors than images?

If you upload:
- **3 images**
- **6 colors**

Mapping:
- Colors 1-3 → Get their own images
- Colors 4-6 → Will show first image as fallback

**Recommendation**: Always upload at least one image per color for best experience!

---

## 🎨 Supported Color Names

The system automatically recognizes these color names and displays appropriate color circles:

- Red
- Purple  
- Black
- White
- Blue
- Green
- Yellow
- Pink
- Orange
- Gray
- Brown

**For custom colors**: They'll display as gray circles but still work functionally.

---

## 📦 Complete Example

### Product: Summer Floral Dress

**Images uploaded (in order):**
1. https://s3.../summer-dress-red.jpg
2. https://s3.../summer-dress-yellow.jpg  
3. https://s3.../summer-dress-blue.jpg
4. https://s3.../summer-dress-pink.jpg

**Sizes:** S, M, L, XL

**Colors (in same order):** Red, Yellow, Blue, Pink

**Result:** 
- Customer selects "Yellow" → Image 2 displays automatically
- Customer selects "Pink" → Image 4 displays automatically
- All 4 images available in thumbnail gallery

---

## 🚀 Ready to Upload?

1. Prepare your images (name them for easy ordering)
2. Open Vendor Admin → Add Product
3. Upload images in color order
4. Add matching colors
5. Submit!

Your products will now have **dynamic color-based image switching** on the customer site! 🎉



