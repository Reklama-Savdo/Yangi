import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import AdminSidebar from '../../components/AdminSidebar';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import { Plus, Pencil, Trash2, Upload, Search, ImagePlus } from 'lucide-react';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export default function AdminProducts() {
  const { getAuthHeader } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    quantity: '',
    sku: '',
    image_url: '',
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API}/products`);
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const productData = {
      ...formData,
      price: parseFloat(formData.price),
      quantity: parseInt(formData.quantity) || 0,
    };

    try {
      if (editingProduct) {
        await axios.put(`${API}/products/${editingProduct.id}`, productData, {
          headers: getAuthHeader()
        });
        toast.success('Product updated successfully');
      } else {
        await axios.post(`${API}/products`, productData, {
          headers: getAuthHeader()
        });
        toast.success('Product created successfully');
      }
      
      setDialogOpen(false);
      resetForm();
      fetchProducts();
    } catch (error) {
      toast.error('Failed to save product');
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    
    try {
      await axios.delete(`${API}/products/${productId}`, {
        headers: getAuthHeader()
      });
      toast.success('Product deleted');
      fetchProducts();
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      category: product.category,
      quantity: product.quantity.toString(),
      sku: product.sku || '',
      image_url: product.image_url || '',
    });
    setDialogOpen(true);
  };

  const handleExcelUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(`${API}/products/upload-excel`, formData, {
        headers: {
          ...getAuthHeader(),
          'Content-Type': 'multipart/form-data',
        }
      });
      toast.success(response.data.message);
      fetchProducts();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to upload file');
    }
    
    e.target.value = '';
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImage(true);
    const imageFormData = new FormData();
    imageFormData.append('file', file);

    try {
      const response = await axios.post(`${API}/upload/image`, imageFormData, {
        headers: {
          ...getAuthHeader(),
          'Content-Type': 'multipart/form-data',
        }
      });
      const imageUrl = `${BACKEND_URL}${response.data.url}`;
      setFormData(prev => ({ ...prev, image_url: imageUrl }));
      toast.success('Image uploaded successfully');
    } catch (error) {
      toast.error('Failed to upload image');
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  const resetForm = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      category: '',
      quantity: '',
      sku: '',
      image_url: '',
    });
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-[#0D2440]" data-testid="admin-products">
      <AdminSidebar />
      
      <main className="flex-1 p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-heading font-black text-3xl text-[#E7F0FA]">Products</h1>
            <p className="text-[#7BA4D0]">Manage your product catalog</p>
          </div>
          
          <div className="flex gap-4">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleExcelUpload}
              accept=".xlsx,.xls,.csv"
              className="hidden"
            />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="border-[#2E5E99] text-[#E7F0FA] hover:bg-[#2E5E99]/20"
              data-testid="upload-excel-btn"
            >
              <Upload className="mr-2 h-4 w-4" />
              Upload Excel
            </Button>
            
            <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
              <DialogTrigger asChild>
                <Button className="bg-[#00F0FF] text-[#0D2440] hover:bg-[#00F0FF]/80" data-testid="add-product-btn">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Product
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-[#132D4E] border-[#2E5E99] text-[#E7F0FA] max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="font-heading text-xl">
                    {editingProduct ? 'Edit Product' : 'Add New Product'}
                  </DialogTitle>
                </DialogHeader>
                
                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Name *</Label>
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        className="bg-[#0A1B30] border-[#2E5E99]/50"
                        data-testid="product-name-input"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Category *</Label>
                      <Input
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        required
                        className="bg-[#0A1B30] border-[#2E5E99]/50"
                        placeholder="e.g., Signage, Banners"
                        data-testid="product-category-input"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Description *</Label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      required
                      className="bg-[#0A1B30] border-[#2E5E99]/50 min-h-[100px]"
                      data-testid="product-description-input"
                    />
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Price ($) *</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        required
                        className="bg-[#0A1B30] border-[#2E5E99]/50"
                        data-testid="product-price-input"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Quantity *</Label>
                      <Input
                        type="number"
                        min="0"
                        value={formData.quantity}
                        onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                        required
                        className="bg-[#0A1B30] border-[#2E5E99]/50"
                        data-testid="product-quantity-input"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>SKU</Label>
                      <Input
                        value={formData.sku}
                        onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                        className="bg-[#0A1B30] border-[#2E5E99]/50"
                        placeholder="Optional"
                        data-testid="product-sku-input"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Product Image</Label>
                    <div className="flex gap-2">
                      <Input
                        value={formData.image_url}
                        onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                        className="bg-[#0A1B30] border-[#2E5E99]/50 flex-1"
                        placeholder="Image URL or upload"
                        data-testid="product-image-input"
                      />
                      <input
                        type="file"
                        ref={imageInputRef}
                        onChange={handleImageUpload}
                        accept="image/*"
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => imageInputRef.current?.click()}
                        disabled={uploadingImage}
                        className="border-[#2E5E99] text-[#E7F0FA] hover:bg-[#2E5E99]/20"
                      >
                        {uploadingImage ? (
                          <span className="w-4 h-4 border-2 border-[#E7F0FA] border-t-transparent rounded-full animate-spin"></span>
                        ) : (
                          <ImagePlus className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    {formData.image_url && (
                      <div className="mt-2 w-24 h-24 bg-[#0A1B30] overflow-hidden">
                        <img src={formData.image_url} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex justify-end gap-4 pt-4">
                    <Button type="button" variant="ghost" onClick={() => setDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" className="bg-[#00F0FF] text-[#0D2440] hover:bg-[#00F0FF]/80" data-testid="save-product-btn">
                      {editingProduct ? 'Update' : 'Create'} Product
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#7BA4D0]" />
            <Input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-[#132D4E] border-[#2E5E99]/50 text-[#E7F0FA]"
              data-testid="product-search"
            />
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-[#132D4E] border border-white/5 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-[#2E5E99]/30 hover:bg-transparent">
                <TableHead className="text-[#7BA4D0]">Product</TableHead>
                <TableHead className="text-[#7BA4D0]">Category</TableHead>
                <TableHead className="text-[#7BA4D0]">Price</TableHead>
                <TableHead className="text-[#7BA4D0]">Stock</TableHead>
                <TableHead className="text-[#7BA4D0]">SKU</TableHead>
                <TableHead className="text-[#7BA4D0] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i} className="border-[#2E5E99]/30">
                    <TableCell colSpan={6}>
                      <div className="h-12 bg-[#0A1B30] animate-pulse"></div>
                    </TableCell>
                  </TableRow>
                ))
              ) : filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <TableRow key={product.id} className="border-[#2E5E99]/30 hover:bg-[#0A1B30]/50">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-[#0A1B30] flex-shrink-0 overflow-hidden">
                          {product.image_url ? (
                            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[#7BA4D0] font-bold">
                              {product.name.charAt(0)}
                            </div>
                          )}
                        </div>
                        <span className="text-[#E7F0FA] font-medium">{product.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-[#00F0FF]">{product.category}</TableCell>
                    <TableCell className="text-[#E7F0FA] font-mono">${product.price.toFixed(2)}</TableCell>
                    <TableCell>
                      <span className={`${
                        product.quantity > 5 ? 'text-[#00F0FF]' : 
                        product.quantity > 0 ? 'text-[#FFD700]' : 'text-[#FF4D4D]'
                      }`}>
                        {product.quantity}
                      </span>
                    </TableCell>
                    <TableCell className="text-[#7BA4D0] font-mono text-sm">{product.sku || '-'}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(product)}
                          className="text-[#7BA4D0] hover:text-[#00F0FF] hover:bg-[#00F0FF]/10"
                          data-testid={`edit-product-${product.id}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(product.id)}
                          className="text-[#7BA4D0] hover:text-[#FF4D4D] hover:bg-[#FF4D4D]/10"
                          data-testid={`delete-product-${product.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow className="border-[#2E5E99]/30">
                  <TableCell colSpan={6} className="text-center text-[#7BA4D0] py-12">
                    No products found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </main>
    </div>
  );
}
