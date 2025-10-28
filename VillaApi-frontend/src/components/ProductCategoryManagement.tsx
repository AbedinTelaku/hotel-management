import React, { useState } from 'react';
import './ProductCategoryManagement.css';

interface ProductCategory {
  code: string;
  title: string;
  description: string;
  isActive: boolean;
  orderNo: number;
  productCount: number;
  createdAt: string;
}

const ProductCategoryManagement: React.FC = () => {
  const [categories, setCategories] = useState<ProductCategory[]>([
    {
      code: 'ALKOOL',
      title: 'Alkool',
      description: 'Pije alkoolike të ndryshme',
      isActive: true,
      orderNo: 1,
      productCount: 18,
      createdAt: '2024-01-01'
    },
    {
      code: 'JOALKOOL',
      title: 'Joalkool',
      description: 'Pije pa alkool',
      isActive: true,
      orderNo: 2,
      productCount: 8,
      createdAt: '2024-01-01'
    },
    {
      code: 'USHQIM',
      title: 'Ushqim',
      description: 'Produkte ushqimore',
      isActive: true,
      orderNo: 3,
      productCount: 8,
      createdAt: '2024-01-01'
    },
    {
      code: 'SNACKS',
      title: 'Snacks',
      description: 'Ushqime të lehta dhe snacks',
      isActive: true,
      orderNo: 4,
      productCount: 5,
      createdAt: '2024-01-15'
    },
    {
      code: 'DESSERT',
      title: 'Dessert',
      description: 'Ëmbëlsira dhe dessert',
      isActive: false,
      orderNo: 5,
      productCount: 0,
      createdAt: '2024-01-20'
    }
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ProductCategory | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [sortBy, setSortBy] = useState<'orderNo' | 'title' | 'productCount' | 'createdAt'>('orderNo');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const filteredCategories = categories.filter(category => {
    const matchesSearch = category.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         category.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         category.code.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesFilter = true;
    if (filterStatus === 'active') matchesFilter = category.isActive;
    else if (filterStatus === 'inactive') matchesFilter = !category.isActive;
    
    return matchesSearch && matchesFilter;
  });

  const sortedCategories = [...filteredCategories].sort((a, b) => {
    let aValue: any, bValue: any;
    
    switch (sortBy) {
      case 'orderNo':
        aValue = a.orderNo;
        bValue = b.orderNo;
        break;
      case 'title':
        aValue = a.title.toLowerCase();
        bValue = b.title.toLowerCase();
        break;
      case 'productCount':
        aValue = a.productCount;
        bValue = b.productCount;
        break;
      case 'createdAt':
        aValue = new Date(a.createdAt);
        bValue = new Date(b.createdAt);
        break;
      default:
        return 0;
    }

    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const handleAddCategory = (categoryData: Omit<ProductCategory, 'code' | 'orderNo' | 'productCount' | 'createdAt'>) => {
    const newCategory: ProductCategory = {
      ...categoryData,
      code: categoryData.title.toUpperCase().replace(/\s+/g, '_'),
      orderNo: Math.max(...categories.map(c => c.orderNo)) + 1,
      productCount: 0,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setCategories(prev => [...prev, newCategory]);
    setShowAddModal(false);
  };

  const handleEditCategory = (categoryData: Omit<ProductCategory, 'code' | 'orderNo' | 'productCount' | 'createdAt'>) => {
    if (editingCategory) {
      setCategories(prev =>
        prev.map(category =>
          category.code === editingCategory.code
            ? { ...category, ...categoryData }
            : category
        )
      );
      setEditingCategory(null);
    }
  };

  const handleDeleteCategory = (code: string) => {
    const category = categories.find(c => c.code === code);
    if (category && category.productCount > 0) {
      alert('Nuk mund të fshini një kategori që ka produkte!');
      return;
    }
    
    if (window.confirm('A jeni të sigurt që doni ta fshini këtë kategori?')) {
      setCategories(prev => prev.filter(category => category.code !== code));
    }
  };

  const handleToggleActive = (code: string) => {
    setCategories(prev =>
      prev.map(category =>
        category.code === code
          ? { ...category, isActive: !category.isActive }
          : category
      )
    );
  };

  const handleEdit = (category: ProductCategory) => {
    setEditingCategory(category);
  };

  const handleReorder = (code: string, direction: 'up' | 'down') => {
    setCategories(prev => {
      const sorted = [...prev].sort((a, b) => a.orderNo - b.orderNo);
      const index = sorted.findIndex(c => c.code === code);
      
      if (direction === 'up' && index > 0) {
        [sorted[index], sorted[index - 1]] = [sorted[index - 1], sorted[index]];
      } else if (direction === 'down' && index < sorted.length - 1) {
        [sorted[index], sorted[index + 1]] = [sorted[index + 1], sorted[index]];
      }
      
      return sorted.map((cat, idx) => ({ ...cat, orderNo: idx + 1 }));
    });
  };

  const totalCategories = categories.length;
  const activeCategories = categories.filter(c => c.isActive).length;
  const totalProducts = categories.reduce((sum, c) => sum + c.productCount, 0);

  return (
    <div className="product-category-management">
      <div className="category-header">
        <h2>Menaxhimi i Kategorive të Produkteve</h2>
        <button 
          onClick={() => setShowAddModal(true)}
          className="add-category-btn"
        >
          + Shto Kategori të Re
        </button>
      </div>

      <div className="category-stats">
        <div className="stat-card">
          <div className="stat-icon">📂</div>
          <div className="stat-content">
            <span className="stat-number">{totalCategories}</span>
            <span className="stat-label">Kategori Totale</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <span className="stat-number">{activeCategories}</span>
            <span className="stat-label">Kategori Aktive</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-content">
            <span className="stat-number">{totalProducts}</span>
            <span className="stat-label">Produkte Totale</span>
          </div>
        </div>
      </div>

      <div className="category-filters">
        <div className="filter-row">
          <div className="filter-group">
            <label htmlFor="search">Kërko:</label>
            <input
              type="text"
              id="search"
              placeholder="Emër, përshkrim, kod..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="filter-input"
            />
          </div>

          <div className="filter-group">
            <label htmlFor="status-filter">Statusi:</label>
            <select 
              id="status-filter"
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="filter-select"
            >
              <option value="all">Të Gjitha</option>
              <option value="active">Aktive</option>
              <option value="inactive">Joaktive</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="sort-by">Rendit sipas:</label>
            <select 
              id="sort-by"
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value as any)}
              className="filter-select"
            >
              <option value="orderNo">Renditja</option>
              <option value="title">Emri</option>
              <option value="productCount">Numri i Produkteve</option>
              <option value="createdAt">Data e Krijimit</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="sort-order">Renditja:</label>
            <select 
              id="sort-order"
              value={sortOrder} 
              onChange={(e) => setSortOrder(e.target.value as any)}
              className="filter-select"
            >
              <option value="asc">Ngjitëse</option>
              <option value="desc">Zbritëse</option>
            </select>
          </div>
        </div>
      </div>

      <div className="categories-grid">
        {sortedCategories.map(category => (
          <div key={category.code} className={`category-card ${!category.isActive ? 'inactive' : ''}`}>
            <div className="category-header-card">
              <div className="category-info">
                <h3 className="category-title">{category.title}</h3>
                <span className="category-code">{category.code}</span>
              </div>
              <div className="category-status">
                <span className={`status-badge ${category.isActive ? 'active' : 'inactive'}`}>
                  {category.isActive ? '✅ Aktiv' : '❌ Joaktiv'}
                </span>
              </div>
            </div>

            <div className="category-description">
              <p>{category.description}</p>
            </div>

            <div className="category-details">
              <div className="detail-item">
                <span className="detail-label">Produkte:</span>
                <span className="detail-value">{category.productCount}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Renditja:</span>
                <span className="detail-value">#{category.orderNo}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Krijuar:</span>
                <span className="detail-value">{new Date(category.createdAt).toLocaleDateString('sq-AL')}</span>
              </div>
            </div>

            <div className="category-actions">
              <div className="reorder-buttons">
                <button 
                  onClick={() => handleReorder(category.code, 'up')}
                  className="reorder-btn up"
                  title="Lëviz lart"
                >
                  ⬆️
                </button>
                <button 
                  onClick={() => handleReorder(category.code, 'down')}
                  className="reorder-btn down"
                  title="Lëviz poshtë"
                >
                  ⬇️
                </button>
              </div>
              
              <div className="action-buttons">
                <button 
                  onClick={() => handleToggleActive(category.code)}
                  className={`toggle-btn ${category.isActive ? 'deactivate' : 'activate'}`}
                  title={category.isActive ? 'Deaktivizo' : 'Aktivizo'}
                >
                  {category.isActive ? '⏸️' : '▶️'}
                </button>
                <button 
                  onClick={() => handleEdit(category)}
                  className="edit-btn"
                  title="Ndrysho"
                >
                  ✏️
                </button>
                <button 
                  onClick={() => handleDeleteCategory(category.code)}
                  className="delete-btn"
                  title="Fshi"
                  disabled={category.productCount > 0}
                >
                  🗑️
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {sortedCategories.length === 0 && (
        <div className="no-results">
          <p>Nuk u gjetën kategori për këto kritere.</p>
        </div>
      )}

      {showAddModal && (
        <CategoryModal
          onSave={handleAddCategory}
          onClose={() => setShowAddModal(false)}
        />
      )}

      {editingCategory && (
        <CategoryModal
          category={editingCategory}
          onSave={handleEditCategory}
          onClose={() => setEditingCategory(null)}
        />
      )}
    </div>
  );
};

interface CategoryModalProps {
  category?: ProductCategory;
  onSave: (categoryData: Omit<ProductCategory, 'code' | 'orderNo' | 'productCount' | 'createdAt'>) => void;
  onClose: () => void;
}

const CategoryModal: React.FC<CategoryModalProps> = ({ category, onSave, onClose }) => {
  const [title, setTitle] = useState(category?.title || '');
  const [description, setDescription] = useState(category?.description || '');
  const [isActive, setIsActive] = useState(category?.isActive ?? true);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Emri i kategorisë është i detyrueshëm');
      return;
    }

    if (title.length < 2) {
      setError('Emri duhet të ketë të paktën 2 karaktere');
      return;
    }

    if (!description.trim()) {
      setError('Përshkrimi është i detyrueshëm');
      return;
    }

    onSave({
      title: title.trim(),
      description: description.trim(),
      isActive
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
          <h2>{category ? 'Ndrysho Kategorinë' : 'Shto Kategori të Re'}</h2>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="title">Emri i Kategorisë:</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Shkruani emrin e kategorisë"
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Përshkrimi:</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Shkruani përshkrimin e kategorisë"
              className="form-textarea"
              rows={3}
              required
            />
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="checkbox-input"
              />
              <span className="checkbox-text">Kategoria Aktive</span>
            </label>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="cancel-button">
              Anulo
            </button>
            <button type="submit" className="save-button">
              {category ? 'Ndrysho' : 'Shto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductCategoryManagement;
