import React, { useState, useEffect } from 'react';
import { productService, Product as ApiProduct, ProductCategory } from '../services';
import { ApiError } from '../services/api';
import './ProductManagement.css';

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
}

const ProductManagement: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<{code: string, name: string}[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  // Load products and categories from API
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      // Check authentication first
      const token = localStorage.getItem('authToken');
      console.log('🔐 Token check:', token ? 'Token exists' : 'No token');
      console.log('🔐 Token preview:', token ? token.substring(0, 50) + '...' : 'No token');

      // Load categories first
      console.log('🔄 Loading categories...');
      const categoriesResponse = await productService.getActiveCategories();
      console.log('🔍 Categories response:', categoriesResponse);
      console.log('🔍 Categories response status:', categoriesResponse.isSuccessfull);
      console.log('🔍 Categories response data:', categoriesResponse.data);
      
      if (categoriesResponse.isSuccessfull && categoriesResponse.data) {
        console.log('🔍 Raw categories data:', categoriesResponse.data);
        const categoryData = categoriesResponse.data.map(cat => {
          console.log('🔍 Category item:', cat);
          return {code: cat.code, name: cat.description};
        });
        setCategories(categoryData);
        if (categoryData.length > 0) {
          setSelectedCategory(categoryData[0].code);
        }
        console.log('✅ Categories loaded:', categoryData);
      } else {
        console.error('❌ Failed to load categories:', categoriesResponse);
        console.log('⚠️ Creating default categories as fallback');
        
        // Check if it's an authentication error
        if (categoriesResponse.errorMessage && categoriesResponse.errorMessage.includes('401')) {
          setError('Nuk jeni i autentifikuar. Ju lutemi hyni përsëri në sistem.');
          setCategories([]);
          setSelectedCategory('');
          return;
        }
        
        // Create default categories if none exist
        const defaultCategories = [
          {code: '001', name: 'Pije Alkoolike'},
          {code: '002', name: 'Pije joAlkoolike'},
          {code: '003', name: 'Ushqim'},
          {code: '004', name: 'Tjeter'}
        ];
        
        setCategories(defaultCategories);
        setSelectedCategory(defaultCategories[0].code);
        console.log('✅ Using default categories:', defaultCategories);
      }

      // Load products
      const productsResponse = await productService.getAllProducts();
      if (productsResponse.isSuccessfull && productsResponse.data) {
        const convertedProducts: Product[] = productsResponse.data.map(product => ({
          id: product.code,
          name: product.title,
          category: product.category,
          price: product.price
        }));
        setProducts(convertedProducts);
        console.log('✅ Products loaded:', convertedProducts);
      } else {
        setError('Nuk mund të ngarkohen produktet nga serveri');
      }
    } catch (error) {
      console.error('Error loading data:', error);
      const apiError = error as ApiError;
      setError(apiError.message || 'Gabim në ngarkimin e të dhënave');
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesCategory = product.category === selectedCategory;
    const matchesSearch = product.name && product.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleAddProduct = async (productData: Omit<Product, 'id'>) => {
    try {
      setIsAdding(true);
      setError('');
      
      console.log('🔄 Adding product with data:', productData);
      console.log('🔄 Selected category code:', productData.category);
      console.log('🔄 Available categories:', categories);
      
      // Check if category exists in the loaded categories
      const categoryExists = categories.some(cat => cat.code === productData.category);
      if (!categoryExists) {
        console.error('❌ Category validation failed:', {
          selectedCategory: productData.category,
          availableCategories: categories.map(c => c.code),
          categoriesLength: categories.length,
          allCategories: categories
        });
        setError('Kategoria e zgjedhur nuk është e vlefshme. Ju lutemi rifreskoni faqen.');
        return;
      }
      
      const response = await productService.addProduct({
        code: Date.now().toString(),
        title: productData.name,
        category: productData.category,
        price: productData.price
      });
      console.log('✅ Add product response:', response);

      if (response.isSuccessfull) {
        console.log('🔍 Response data:', response.data);
        
        // Since backend returns only true, create product from the data we sent
        const categoryName = categories.find(cat => cat.code === productData.category)?.name || productData.category;
        const newProduct: Product = {
          id: Date.now().toString(), // Use the same code we sent
          name: productData.name,
          category: categoryName, // Use category name instead of code for display
          price: productData.price
        };
        console.log('🔍 New product created:', newProduct);
        setProducts(prev => [...prev, newProduct]);
        setShowAddModal(false);
        setError(''); // Clear any previous errors
      } else {
        console.error('❌ Add product failed:', response);
        setError(response.errorMessage || 'Gabim në shtimin e produktit');
      }
    } catch (error) {
      console.error('Error adding product:', error);
      const apiError = error as ApiError;
      setError(apiError.message || 'Gabim në shtimin e produktit');
    } finally {
      setIsAdding(false);
    }
  };

  const handleEditProduct = async (productData: Omit<Product, 'id'>) => {
    if (editingProduct) {
      try {
        const response = await productService.updateProduct({
          code: editingProduct.id,
          title: productData.name,
          category: productData.category,
          price: productData.price
        });

        if (response.isSuccessfull && response.data) {
          setProducts(prev => 
            prev.map(product => 
              product.id === editingProduct.id 
                ? { ...product, ...productData }
                : product
            )
          );
          setEditingProduct(null);
        } else {
          setError(response.errorMessage || 'Gabim në përditësimin e produktit');
        }
      } catch (error) {
        console.error('Error updating product:', error);
        const apiError = error as ApiError;
        setError(apiError.message || 'Gabim në përditësimin e produktit');
      }
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (window.confirm('A jeni të sigurt që doni ta fshini këtë produkt?')) {
      try {
        const response = await productService.removeProduct(productId);
        
        if (response.isSuccessfull) {
          setProducts(prev => prev.filter(product => product.id !== productId));
        } else {
          setError(response.errorMessage || 'Gabim në fshirjen e produktit');
        }
      } catch (error) {
        console.error('Error deleting product:', error);
        const apiError = error as ApiError;
        setError(apiError.message || 'Gabim në fshirjen e produktit');
      }
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
  };

  if (loading) {
    return (
      <div className="product-management">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Duke ngarkuar produktet...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="product-management">
      <div className="product-header">
        <h2>Menaxhimi i Produkteve</h2>
        <div className="header-actions">
          <button 
            onClick={loadData}
            className="refresh-button"
            title="Rifresko produktet"
          >
            🔄
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="add-product-btn"
          >
            + Shto Produkt të Ri
          </button>
        </div>
      </div>

      {error && (
        <div className="error-banner">
          <span>⚠️ {error}</span>
          <button onClick={() => setError('')} className="close-error">×</button>
        </div>
      )}

      <div className="product-filters">
        <div className="category-tabs">
          {categories.map(category => (
            <button
              key={category.code}
              className={`category-tab ${selectedCategory === category.code ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category.code)}
            >
              {category.name}
            </button>
          ))}
        </div>
        
        <div className="search-box">
          <input
            type="text"
            placeholder="Kërko produkt..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      <div className="products-grid">
        {filteredProducts.map(product => (
          <div key={product.id} className="product-card">
            <div className="product-info">
              <h3>{product.name || 'Unknown Product'}</h3>
              <p className="product-category">{product.category || 'Unknown Category'}</p>
              <p className="product-price">€{product.price || 0}</p>
            </div>
            <div className="product-actions">
              <button 
                onClick={() => handleEdit(product)}
                className="edit-btn"
              >
                ✏️
              </button>
              <button 
                onClick={() => handleDeleteProduct(product.id)}
                className="delete-btn"
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>

      {showAddModal && (
        <ProductModal
          onSave={handleAddProduct}
          onClose={() => setShowAddModal(false)}
          categories={categories}
          isLoading={isAdding}
        />
      )}

      {editingProduct && (
        <ProductModal
          product={editingProduct}
          onSave={handleEditProduct}
          onClose={() => setEditingProduct(null)}
          categories={categories}
        />
      )}
    </div>
  );
};

interface ProductModalProps {
  product?: Product;
  onSave: (productData: Omit<Product, 'id'>) => void;
  onClose: () => void;
  categories: {code: string, name: string}[];
  isLoading?: boolean;
}

const ProductModal: React.FC<ProductModalProps> = ({ product, onSave, onClose, categories, isLoading = false }) => {
  const [name, setName] = useState(product?.name || '');
  const [category, setCategory] = useState(product?.category || (categories.length > 0 ? categories[0].code : ''));
  const [price, setPrice] = useState(product?.price?.toString() || '');
  const [error, setError] = useState('');

  // Update category when categories are loaded
  useEffect(() => {
    console.log('🔄 ProductModal useEffect - categories:', categories);
    console.log('🔄 ProductModal useEffect - product?.category:', product?.category);
    if (categories.length > 0 && !product?.category) {
      console.log('🔄 Setting category to:', categories[0].code);
      setCategory(categories[0].code);
    }
  }, [categories, product?.category]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    console.log('🔄 ProductModal handleSubmit - category:', category);
    console.log('🔄 ProductModal handleSubmit - available categories:', categories);

    if (!name.trim()) {
      setError('Emri i produktit është i detyrueshëm');
      return;
    }

    if (!price || parseFloat(price) <= 0) {
      setError('Çmimi duhet të jetë më i madh se 0');
      return;
    }

    onSave({
      name: name.trim(),
      category,
      price: parseFloat(price)
    });
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-content">
        <div className="modal-header">
          <h2>{product ? 'Ndrysho Produktin' : 'Shto Produkt të Ri'}</h2>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="name">Emri i Produktit:</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Shkruani emrin e produktit"
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="category">Kategoria:</label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="form-select"
            >
              {categories.map(cat => (
                <option key={cat.code} value={cat.code}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="price">Çmimi (€):</label>
            <input
              type="number"
              id="price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Shkruani çmimin"
              className="form-input"
              min="0"
              step="0.01"
              required
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="modal-actions">
            <button 
              type="button" 
              onClick={onClose} 
              className="cancel-button"
              disabled={isLoading}
            >
              Anulo
            </button>
            <button 
              type="submit" 
              className="save-button"
              disabled={isLoading}
            >
              {isLoading ? 'Duke shtuar...' : (product ? 'Ndrysho' : 'Shto')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductManagement;
