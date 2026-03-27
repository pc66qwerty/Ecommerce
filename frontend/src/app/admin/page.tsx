"use client";

import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { useRouter } from 'next/navigation';
import { Package, Users, Settings, Tag, Grid, CheckCircle2, Image as ImageIcon, BarChart3, Download, Search, FileSpreadsheet, FileText, MessageCircle } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import * as XLSX from 'xlsx';
import ImageInput from '@/components/ImageInput';

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('dashboard');

  const [orders, setOrders] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);

  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [productForm, setProductForm] = useState({ name: '', slug: '', description: '', price: '', discount_price: '', offer_ends_at: '', stock: '', category_id: 1, is_featured: false, images: [] as string[], video_url: '' });

  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [categoryForm, setCategoryForm] = useState({ name: '', slug: '', description: '', image: '' });

  const [showCouponModal, setShowCouponModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<any>(null);
  const [couponForm, setCouponForm] = useState({ code: '', description: '', discount_type: 'percentage', discount_value: '', min_purchase: '', max_uses: '', expires_at: '', is_active: true });

  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [userForm, setUserForm] = useState({ name: '', role: 'customer', is_active: true });
  const [newPassword, setNewPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [createUserForm, setCreateUserForm] = useState({ name: '', email: '', password: '', role: 'customer', is_active: true });

  const emptySlide = { image: '', badge: '', title: '', subtitle: '' };
  const [carouselSlides, setCarouselSlides] = useState([{ ...emptySlide }, { ...emptySlide }, { ...emptySlide }]);
  const [carouselSaving, setCarouselSaving] = useState(false);

  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [whatsappSaving, setWhatsappSaving] = useState(false);

  const [loadingData, setLoadingData] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const { user, isAuthenticated, isLoading, logout } = useAuthStore();

  const PAGE_SIZE = 20;
  const [ordersSearch, setOrdersSearch] = useState('');
  const [ordersPage, setOrdersPage] = useState(1);
  const [productsSearch, setProductsSearch] = useState('');
  const [productsPage, setProductsPage] = useState(1);
  const [usersSearch, setUsersSearch] = useState('');
  const [usersPage, setUsersPage] = useState(1);
  const [couponsSearch, setCouponsSearch] = useState('');
  const [couponsPage, setCouponsPage] = useState(1);

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated || user?.role !== 'admin') {
        router.push('/auth/login');
      } else {
        loadData();
      }
    }
  }, [isLoading, isAuthenticated, user, router]);

  const loadData = async () => {
    setLoadingData(true);
    try {
      const [oRes, uRes, pRes, cRes, cRes2, carRes, statsRes, waRes] = await Promise.allSettled([
        api.get('/admin/orders'),
        api.get('/admin/users'),
        api.get('/products'),
        api.get('/categories'),
        api.get('/admin/coupons'),
        api.get('/settings/carousel'),
        api.get('/admin/stats'),
        api.get('/settings/whatsapp'),
      ]);
      if (oRes.status === 'fulfilled') setOrders(oRes.value.data);
      if (uRes.status === 'fulfilled') setUsersList(uRes.value.data);
      if (pRes.status === 'fulfilled') setProducts(pRes.value.data);
      if (cRes.status === 'fulfilled') setCategories(cRes.value.data);
      if (cRes2.status === 'fulfilled') setCoupons(cRes2.value.data);
      if (carRes.status === 'fulfilled' && Array.isArray(carRes.value.data) && carRes.value.data.length > 0) setCarouselSlides(carRes.value.data);
      if (statsRes.status === 'fulfilled') setStats(statsRes.value.data);
      if (waRes.status === 'fulfilled') setWhatsappNumber(waRes.value.data.whatsapp_number || '');
    } catch (err: any) {
      alert('Error al cargar los datos de administración');
    } finally {
      setLoadingData(false);
    }
  };

  const updateOrderStatus = async (id: number, status: string) => {
    try {
      await api.put(`/orders/${id}/status`, { status });
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
    } catch (err) { alert('Error al actualizar el estado'); }
  };

  const statusSelectColor = (status: string) => {
    switch (status) {
      case 'Pending confirmation':    return 'bg-orange-50 text-orange-600 border-orange-200';
      case 'Order accepted':          return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Awaiting payment proof':  return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'Payment confirmed':       return 'bg-teal-50 text-teal-700 border-teal-200';
      case 'Preparing product':       return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'Packaged':                return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Shipped':                 return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'Out for delivery':        return 'bg-cyan-50 text-cyan-700 border-cyan-200';
      case 'Delivered':               return 'bg-green-50 text-green-700 border-green-200';
      default:                        return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  };

  const statusLabelsES: Record<string, string> = {
    'Pending confirmation': 'Pendiente de confirmación',
    'Order accepted': 'Pedido aceptado',
    'Awaiting payment proof': 'Esperando comprobante de pago',
    'Payment confirmed': 'Pago confirmado',
    'Preparing product': 'Preparando producto',
    'Packaged': 'Empaquetado',
    'Shipped': 'Enviado',
    'Out for delivery': 'En reparto',
    'Delivered': 'Entregado',
  };

  const notifyWhatsApp = (order: any) => {
    const name = order.user?.name || 'Cliente';
    const ref = order.reference_number;
    const status = statusLabelsES[order.status] || order.status;
    const msg = `Hola ${name}, te informamos que tu pedido *${ref}* ha sido actualizado a: *${status}*. ¡Gracias por tu compra!`;
    const phone = order.user?.phone ? order.user.phone.replace('+', '') : whatsappNumber;
    const base = phone ? `https://wa.me/${phone}` : 'https://wa.me/';
    window.open(`${base}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const approvePaymentProof = async (id: number) => {
    try {
        await api.put(`/orders/${id}/approve-payment`);
        loadData();
    } catch (err) { alert('Error al aprobar el comprobante de pago'); }
  };

  const denyPaymentProof = async (id: number) => {
    try {
      await api.put(`/orders/${id}/deny-payment`);
      loadData();
    } catch (err) { alert('Error al denegar el pago'); }
  };

  const handleLogout = () => { logout(); };

  const openEditUserModal = (u: any) => {
    setEditingUser(u);
    setUserForm({ name: u.name, role: u.role, is_active: u.is_active ?? true });
    setNewPassword('');
    setShowUserModal(true);
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.put(`/admin/users/${editingUser.id}`, userForm);
      setShowUserModal(false);
      loadData();
    } catch (err: any) {
      alert(`Error: ${err.response?.data?.message || 'No se pudo actualizar el usuario.'}`);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword.trim() || newPassword.length < 8) {
      alert('La contraseña debe tener al menos 8 caracteres.');
      return;
    }
    setPasswordSaving(true);
    try {
      await api.put(`/admin/users/${editingUser.id}/password`, { password: newPassword });
      setNewPassword('');
      alert('Contraseña actualizada correctamente.');
    } catch (err: any) {
      alert(`Error: ${err.response?.data?.message || 'No se pudo cambiar la contraseña.'}`);
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/admin/users', createUserForm);
      setShowCreateUserModal(false);
      setCreateUserForm({ name: '', email: '', password: '', role: 'customer', is_active: true });
      loadData();
    } catch (err: any) {
      alert(`Error: ${err.response?.data?.message || 'No se pudo crear el usuario.'}`);
    }
  };

  const toggleUserActive = async (u: any) => {
    try {
      await api.put(`/admin/users/${u.id}`, { is_active: !u.is_active });
      loadData();
    } catch (err) { alert('Error al actualizar el estado del usuario'); }
  };

  const openAddModal = () => {
      setEditingProduct(null);
      setProductForm({ name: '', slug: '', description: '', price: '', discount_price: '', offer_ends_at: '', stock: '', category_id: categories[0]?.id || 1, is_featured: false, images: [''], video_url: '' });
      setShowProductModal(true);
  };

  const openEditModal = (p: any) => {
      setEditingProduct(p);
      const endsAt = p.offer_ends_at ? new Date(p.offer_ends_at).toISOString().slice(0, 16) : '';
      setProductForm({ name: p.name, slug: p.slug, description: p.description, price: p.price, discount_price: p.discount_price || '', offer_ends_at: endsAt, stock: p.stock, category_id: p.category_id, is_featured: p.is_featured, images: p.images || [], video_url: p.video_url || '' });
      setShowProductModal(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
          let res;
          if (editingProduct) {
              res = await api.put(`/products/${editingProduct.id}`, productForm);
          } else {
              res = await api.post('/products', productForm);
          }
              alert(editingProduct ? '¡Producto actualizado!' : '¡Producto registrado exitosamente!');
          setShowProductModal(false);
          loadData();
      } catch (err: any) {
          alert(`Error: ${err.response?.data?.message || 'Verifica los campos o que el slug no esté duplicado.'}`);
      }
  };

  const handleDeleteProduct = async (id: number) => {
      if (!confirm('¿Estás seguro de que deseas eliminar este producto?')) return;
      try {
          await api.delete(`/products/${id}`);
          alert('Producto eliminado correctamente.');
          loadData();
      } catch (err: any) {
          alert(`Error al eliminar: ${err.response?.data?.message || 'No se pudo eliminar el producto.'}`);
      }
  };

  const openAddCategoryModal = () => {
    setEditingCategory(null);
    setCategoryForm({ name: '', slug: '', description: '', image: '' });
    setShowCategoryModal(true);
  };

  const openEditCategoryModal = (c: any) => {
    setEditingCategory(c);
    setCategoryForm({ name: c.name, slug: c.slug, description: c.description || '', image: c.image || '' });
    setShowCategoryModal(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await api.put(`/categories/${editingCategory.id}`, categoryForm);
      } else {
        await api.post('/categories', categoryForm);
      }
      alert(editingCategory ? '¡Categoría actualizada!' : '¡Categoría creada!');
      setShowCategoryModal(false);
      loadData();
    } catch (err: any) {
      alert(`Error: ${err.response?.data?.message || 'Revisa los campos e intenta de nuevo.'}`);
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (!confirm('¿Eliminar esta categoría? Fallará si tiene productos asignados.')) return;
    try {
      await api.delete(`/categories/${id}`);
      alert('Categoría eliminada.');
      loadData();
    } catch (err: any) {
      alert(`Error: ${err.response?.data?.message || 'No se pudo eliminar la categoría.'}`);
    }
  };

  const openAddCouponModal = () => {
    setEditingCoupon(null);
    setCouponForm({ code: '', description: '', discount_type: 'percentage', discount_value: '', min_purchase: '', max_uses: '', expires_at: '', is_active: true });
    setShowCouponModal(true);
  };

  const openEditCouponModal = (c: any) => {
    setEditingCoupon(c);
    setCouponForm({
      code: c.code,
      description: c.description || '',
      discount_type: c.discount_type,
      discount_value: c.discount_value,
      min_purchase: c.min_purchase || '',
      max_uses: c.max_uses || '',
      expires_at: c.expires_at ? c.expires_at.split('T')[0] : '',
      is_active: c.is_active,
    });
    setShowCouponModal(true);
  };

  const handleSaveCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...couponForm,
        discount_value: parseFloat(couponForm.discount_value as any),
        min_purchase: couponForm.min_purchase ? parseFloat(couponForm.min_purchase as any) : 0,
        max_uses: couponForm.max_uses ? parseInt(couponForm.max_uses as any) : null,
        expires_at: couponForm.expires_at || null,
      };
      if (editingCoupon) {
        await api.put(`/admin/coupons/${editingCoupon.id}`, payload);
      } else {
        await api.post('/admin/coupons', payload);
      }
      setShowCouponModal(false);
      loadData();
    } catch (err: any) {
      alert(`Error: ${err.response?.data?.message || 'Revisa los campos.'}`);
    }
  };

  const handleDeleteCoupon = async (id: number) => {
    if (!confirm('¿Eliminar este cupón?')) return;
    try {
      await api.delete(`/admin/coupons/${id}`);
      loadData();
    } catch (err: any) {
      alert(`Error: ${err.response?.data?.message}`);
    }
  };

  const handleSaveCarousel = async () => {
    for (const s of carouselSlides) {
      if (!s.image.trim() || !s.badge.trim() || !s.title.trim() || !s.subtitle.trim()) {
        alert('Todos los campos de cada diapositiva son requeridos.');
        return;
      }
    }
    setCarouselSaving(true);
    try {
      await api.put('/admin/settings/carousel', { slides: carouselSlides });
      alert('¡Carrusel actualizado correctamente!');
    } catch (err: any) {
      alert(`Error: ${err.response?.data?.message || 'No se pudo guardar el carrusel.'}`);
    } finally {
      setCarouselSaving(false);
    }
  };

  const exportExcel = () => {
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(orders.map(o => ({
      Referencia: o.reference_number,
      Cliente: o.user?.name || 'Invitado',
      Email: o.user?.email || '',
      'Total (Q)': Number(o.total_amount).toFixed(2),
      Estado: o.status,
      Pago: paymentStatusLabel(o.payment_proof_status),
      Fecha: new Date(o.created_at).toLocaleDateString('es-GT'),
    }))), 'Pedidos');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(products.map(p => ({
      Nombre: p.name,
      'Precio (Q)': p.price,
      'Precio Descuento (Q)': p.discount_price || '',
      Stock: p.stock,
      Destacado: p.is_featured ? 'Sí' : 'No',
    }))), 'Productos');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(usersList.map(u => ({
      Nombre: u.name,
      Email: u.email,
      Rol: u.role,
      Estado: u.is_active !== false ? 'Activo' : 'Inactivo',
      Registrado: new Date(u.created_at).toLocaleDateString('es-GT'),
    }))), 'Usuarios');
    XLSX.writeFile(wb, `mian-reporte-${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const exportPDF = () => {
    const date = new Date().toLocaleDateString('es-GT');
    const html = `<html><head><title>Reporte MIAN</title><style>
      body{font-family:Arial,sans-serif;padding:24px;color:#111}
      h1{color:#ff5000;margin:0 0 4px}p{color:#666;font-size:12px;margin:0 0 20px}
      h2{font-size:14px;color:#333;margin:20px 0 8px;border-left:4px solid #ff5000;padding-left:8px}
      .stats{display:flex;gap:12px;margin-bottom:20px}
      .stat{flex:1;background:#f9f9f9;border-radius:8px;padding:12px}
      .stat b{display:block;font-size:22px;color:#ff5000}
      .stat span{font-size:11px;color:#666}
      table{width:100%;border-collapse:collapse;font-size:11px}
      th{background:#ff5000;color:#fff;padding:7px 10px;text-align:left}
      td{padding:6px 10px;border-bottom:1px solid #eee}
    </style></head><body>
      <h1>Reporte MIAN Store</h1><p>Generado: ${date}</p>
      ${stats ? `<div class="stats">
        <div class="stat"><b>${stats.total_orders}</b><span>Pedidos</span></div>
        <div class="stat"><b>Q${Number(stats.total_revenue).toFixed(2)}</b><span>Ingresos</span></div>
        <div class="stat"><b>${stats.total_products}</b><span>Productos</span></div>
        <div class="stat"><b>${stats.total_users}</b><span>Usuarios</span></div>
      </div>` : ''}
      <h2>Pedidos (${orders.length})</h2>
      <table><thead><tr><th>Referencia</th><th>Cliente</th><th>Total</th><th>Estado</th><th>Fecha</th></tr></thead>
      <tbody>${orders.map(o => `<tr><td>${o.reference_number}</td><td>${o.user?.name || 'Invitado'}</td><td>Q${Number(o.total_amount).toFixed(2)}</td><td>${o.status}</td><td>${new Date(o.created_at).toLocaleDateString('es-GT')}</td></tr>`).join('')}</tbody></table>
      <h2>Productos (${products.length})</h2>
      <table><thead><tr><th>Nombre</th><th>Precio</th><th>Stock</th><th>Destacado</th></tr></thead>
      <tbody>${products.map(p => `<tr><td>${p.name}</td><td>Q${p.price}</td><td>${p.stock}</td><td>${p.is_featured ? 'Sí' : 'No'}</td></tr>`).join('')}</tbody></table>
    </body></html>`;
    const win = window.open('', '_blank');
    if (win) { win.document.write(html); win.document.close(); win.focus(); win.print(); }
  };

  const updateSlide = (index: number, field: string, value: string) => {
    setCarouselSlides(prev => prev.map((s, i) => i === index ? { ...s, [field]: value } : s));
  };

  const addSlide = () => {
    if (carouselSlides.length < 6) setCarouselSlides(prev => [...prev, { ...emptySlide }]);
  };

  const removeSlide = (index: number) => {
    if (carouselSlides.length > 1) setCarouselSlides(prev => prev.filter((_, i) => i !== index));
  };

  const handleClearAllDiscounts = async () => {
    if (!confirm('¿Quitar el descuento de TODOS los productos? Esta acción no se puede deshacer.')) return;
    try {
      await api.post('/admin/clear-discounts');
      loadData();
      alert('Descuentos eliminados correctamente.');
    } catch (err: any) {
      alert(`Error: ${err.response?.data?.message || 'No se pudo limpiar los descuentos.'}`);
    }
  };

  const handleSaveWhatsapp = async () => {
    if (!whatsappNumber.trim()) return;
    setWhatsappSaving(true);
    try {
      await api.put('/admin/settings/whatsapp', { whatsapp_number: whatsappNumber });
      alert('¡Número de WhatsApp actualizado!');
    } catch (err: any) {
      alert(`Error: ${err.response?.data?.message || 'No se pudo guardar el número.'}`);
    } finally {
      setWhatsappSaving(false);
    }
  };

  const TABS = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'orders', label: 'Pedidos', icon: Package },
    { id: 'products', label: 'Productos', icon: Tag },
    { id: 'categories', label: 'Categorías', icon: Grid },
    { id: 'users', label: 'Usuarios', icon: Users },
    { id: 'coupons', label: 'Cupones', icon: Tag },
    { id: 'carousel', label: 'Carrusel', icon: ImageIcon },
    { id: 'settings', label: 'Configuración', icon: Settings },
  ];

  const paymentStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'received':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'denied':
        return 'bg-red-50 text-red-600 border-red-200';
      default:
        return 'bg-gray-50 text-gray-500 border-gray-200';
    }
  };

  const paymentStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'received': return 'Recibido';
      case 'approved': return 'Aprobado';
      case 'denied': return 'Denegado';
      default: return status;
    }
  };

  // Reset pages when search changes
  useEffect(() => setOrdersPage(1), [ordersSearch]);
  useEffect(() => setProductsPage(1), [productsSearch]);
  useEffect(() => setUsersPage(1), [usersSearch]);
  useEffect(() => setCouponsPage(1), [couponsSearch]);

  const q = (s: string) => s.toLowerCase();
  const filteredOrders = orders.filter(o => !ordersSearch || q(o.reference_number || '').includes(q(ordersSearch)) || q(o.user?.name || '').includes(q(ordersSearch)) || q(o.status || '').includes(q(ordersSearch)));
  const pagedOrders = filteredOrders.slice((ordersPage - 1) * PAGE_SIZE, ordersPage * PAGE_SIZE);
  const filteredProducts = products.filter(p => !productsSearch || q(p.name || '').includes(q(productsSearch)));
  const pagedProducts = filteredProducts.slice((productsPage - 1) * PAGE_SIZE, productsPage * PAGE_SIZE);
  const filteredUsers = usersList.filter(u => !usersSearch || q(u.name || '').includes(q(usersSearch)) || q(u.email || '').includes(q(usersSearch)));
  const pagedUsers = filteredUsers.slice((usersPage - 1) * PAGE_SIZE, usersPage * PAGE_SIZE);
  const filteredCoupons = coupons.filter(c => !couponsSearch || q(c.code || '').includes(q(couponsSearch)) || q(c.description || '').includes(q(couponsSearch)));
  const pagedCoupons = filteredCoupons.slice((couponsPage - 1) * PAGE_SIZE, couponsPage * PAGE_SIZE);

  if (isLoading || loadingData) return <div className="min-h-screen flex items-center justify-center bg-gray-50 flex-col"><div className="w-8 h-8 border-4 border-[#ff5000] border-t-transparent animate-spin rounded-full"></div><p className="mt-4 font-bold text-gray-500">Cargando panel de administración...</p></div>;

  return (
    <div className="bg-gray-50 flex h-[calc(100vh-64px)] overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col z-10">
        <div className="p-6">
          <h2 className="text-xl font-black text-gray-900 border-l-4 border-[#ff5000] pl-3 tracking-tight">Administración</h2>
        </div>
        <nav className="flex-1 px-4 space-y-2 mt-4">
          {TABS.map(t => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-xl font-bold transition-all ${activeTab === t.id ? 'bg-[#ff5000] text-white shadow-md hover:-translate-y-0.5' : 'text-gray-500 hover:bg-gray-50'}`}
              >
                <Icon size={20} strokeWidth={activeTab === t.id ? 2.5 : 2} />
                <span>{t.label}</span>
              </button>
            );
          })}
        </nav>
        <div className="p-4 border-t border-gray-100">
           <button onClick={handleLogout} className="w-full text-center text-sm font-bold text-red-500 hover:bg-red-50 py-2 rounded-lg transition-colors">Cerrar Sesión</button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto w-full p-4 md:p-8 relative">

        {/* Mobile Tabs */}
        <div className="flex md:hidden space-x-2 overflow-x-auto pb-4 mb-4 hide-scrollbar">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)} className={`px-5 py-2.5 rounded-full whitespace-nowrap text-sm font-bold shadow-sm transition-all ${activeTab === t.id ? 'bg-[#ff5000] text-white' : 'bg-white text-gray-500 border border-gray-200'}`}>
              {t.label}
            </button>
          ))}
        </div>

        {activeTab === 'dashboard' && (
          !stats ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-4 border-[#ff5000] border-t-transparent animate-spin rounded-full" />
            </div>
          ) : (
          <div className="space-y-6">
            {/* Export buttons */}
            <div className="flex gap-3 justify-end">
              <button onClick={exportExcel} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors shadow-sm">
                <FileSpreadsheet size={15} /> Exportar Excel
              </button>
              <button onClick={exportPDF} className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors shadow-sm">
                <FileText size={15} /> Exportar PDF
              </button>
            </div>
            {/* KPI cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Total Pedidos', value: stats.total_orders, sub: `${stats.week_orders} esta semana`, color: 'text-blue-600', border: 'border-blue-100' },
                { label: 'Ingresos Totales', value: `Q${Number(stats.total_revenue).toFixed(2)}`, sub: `Q${Number(stats.week_revenue).toFixed(2)} esta semana`, color: 'text-[#ff5000]', border: 'border-orange-100' },
                { label: 'Productos', value: stats.total_products, sub: `${stats.low_stock_products} con stock bajo`, color: 'text-green-600', border: 'border-green-100' },
                { label: 'Usuarios', value: stats.total_users, sub: 'registrados', color: 'text-purple-600', border: 'border-purple-100' },
              ].map((card, i) => (
                <div key={i} className={`bg-white rounded-2xl shadow-sm border ${card.border} p-5`}>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{card.label}</p>
                  <p className={`text-3xl font-black ${card.color}`}>{card.value}</p>
                  <p className="text-xs text-gray-400 font-medium mt-1">{card.sub}</p>
                </div>
              ))}
            </div>

            {/* Orders by status */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-extrabold text-gray-900 mb-5">Pedidos por Estado</h3>
              {stats.orders_by_status.length === 0 ? (
                <p className="text-sm text-gray-400 font-medium">No hay pedidos registrados aún.</p>
              ) : (
                <div className="space-y-4">
                  {stats.orders_by_status.map((s: any) => {
                    const pct = stats.total_orders > 0 ? Math.round((s.count / stats.total_orders) * 100) : 0;
                    return (
                      <div key={s.status}>
                        <div className="flex justify-between text-xs font-bold text-gray-700 mb-1.5">
                          <span>{statusLabelsES[s.status] ?? s.status}</span>
                          <span className="text-gray-500">{s.count} pedido{s.count !== 1 ? 's' : ''} · {pct}%</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                          <div className="bg-[#ff5000] h-2 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
          )
        )}

        {activeTab === 'orders' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100 bg-gray-50 space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="font-extrabold text-gray-900">Resumen de Pedidos <span className="text-gray-400 font-normal text-sm">({filteredOrders.length})</span></h3>
                <button
                  onClick={() => {
                    const headers = ['Referencia', 'Cliente', 'Email', 'Total', 'Estado', 'Pago', 'Fecha'];
                    const rows = orders.map(o => [o.reference_number, o.user?.name || '', o.user?.email || '', Number(o.total_amount).toFixed(2), o.status, o.payment_proof_status || '', new Date(o.created_at).toLocaleDateString('es-GT')]);
                    const csv = [headers, ...rows].map(r => r.map((c: any) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
                    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url; a.download = `pedidos-${new Date().toISOString().slice(0, 10)}.csv`; a.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors shadow-sm"
                >
                  <Download size={14} /> Exportar CSV
                </button>
              </div>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input value={ordersSearch} onChange={e => setOrdersSearch(e.target.value)} placeholder="Buscar por referencia, cliente o estado..." className="w-full pl-8 pr-4 py-2 text-sm border border-gray-200 rounded-xl bg-white text-gray-900 outline-none focus:border-[#ff5000] focus:ring-1 focus:ring-[#ff5000]" />
              </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-white text-gray-400 font-bold uppercase tracking-wider text-[10px] border-b border-gray-100">
                    <tr>
                    <th className="p-4">Referencia</th>
                    <th className="p-4">Cliente</th>
                    <th className="p-4">Total</th>
                    <th className="p-4">Estado del Pedido</th>
                    <th className="p-4">Pago</th>
                    <th className="p-4 text-right">Acciones</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                    {pagedOrders.map((o: any) => (
                    <tr key={o.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="p-4 font-black text-gray-800">{o.reference_number}</td>
                        <td className="p-4 font-medium text-gray-600 truncate max-w-37.5">{o.user?.name || 'Invitado'}</td>
                        <td className="p-4 font-bold text-[#ff5000]">Q{o.total_amount}</td>
                        <td className="p-4">
                        <select
                            value={o.status}
                            onChange={(e) => updateOrderStatus(o.id, e.target.value)}
                            className={`text-xs font-bold rounded-lg px-3 py-1.5 outline-none border focus:ring-2 focus:ring-[#ff5000] shadow-sm cursor-pointer transition-colors ${statusSelectColor(o.status)}`}
                        >
                            <option value="Pending confirmation">Pendiente de confirmación</option>
                            <option value="Order accepted">Pedido aceptado</option>
                            <option value="Awaiting payment proof">Esperando comprobante de pago</option>
                            <option value="Payment confirmed">Pago confirmado</option>
                            <option value="Preparing product">Preparando producto</option>
                            <option value="Packaged">Empaquetado</option>
                            <option value="Shipped">Enviado</option>
                            <option value="Out for delivery">En reparto</option>
                            <option value="Delivered">Entregado</option>
                        </select>
                        <button
                            onClick={() => notifyWhatsApp(o)}
                            title="Notificar al cliente por WhatsApp"
                            className="mt-2 flex items-center gap-1 text-[10px] font-bold text-green-600 hover:text-green-800 transition-colors"
                        >
                            <MessageCircle size={13} /> Notificar
                        </button>
                        </td>
                        <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border shadow-sm ${paymentStatusBadge(o.payment_proof_status)}`}>
                            {paymentStatusLabel(o.payment_proof_status)}
                        </span>
                        </td>
                        <td className="p-4 text-right space-x-2">
                            {(o.payment_proof_status === 'pending' || o.payment_proof_status === 'received') && (
                              <>
                                <button onClick={() => approvePaymentProof(o.id)} className="bg-white border-2 border-green-200 hover:border-green-500 hover:text-green-600 text-green-700 px-4 py-1.5 rounded-lg text-xs font-bold shadow-sm transition-all focus:outline-none">Aprobar Pago</button>
                                <button onClick={() => denyPaymentProof(o.id)} className="bg-white border-2 border-red-200 hover:border-red-500 hover:text-red-600 text-red-500 px-4 py-1.5 rounded-lg text-xs font-bold shadow-sm transition-all focus:outline-none">Denegar</button>
                              </>
                            )}
                            {o.payment_proof_status === 'approved' && (
                              <span className="px-3 py-1.5 rounded-lg text-xs font-black bg-green-50 text-green-700 border border-green-200">Aprobado</span>
                            )}
                            {o.payment_proof_status === 'denied' && (
                              <span className="px-3 py-1.5 rounded-lg text-xs font-black bg-red-50 text-red-600 border border-red-200">Denegado</span>
                            )}
                        </td>
                    </tr>
                    ))}
                    {pagedOrders.length === 0 && <tr><td colSpan={6} className="text-center p-12 text-gray-400 font-medium">{ordersSearch ? 'Sin resultados.' : 'No hay pedidos registrados aún.'}</td></tr>}
                </tbody>
                </table>
            </div>
            <PaginationBar total={filteredOrders.length} page={ordersPage} pageSize={PAGE_SIZE} onPage={setOrdersPage} />
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100 bg-gray-50 space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="font-extrabold text-gray-900">Directorio de Usuarios <span className="text-gray-400 font-normal text-sm">({filteredUsers.length})</span></h3>
                <button onClick={() => setShowCreateUserModal(true)} className="bg-[#111] text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm hover:bg-[#ff5000] transition-colors">+ Agregar Usuario</button>
              </div>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input value={usersSearch} onChange={e => setUsersSearch(e.target.value)} placeholder="Buscar por nombre o correo..." className="w-full pl-8 pr-4 py-2 text-sm border border-gray-200 rounded-xl bg-white text-gray-900 outline-none focus:border-[#ff5000] focus:ring-1 focus:ring-[#ff5000]" />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-white text-gray-400 font-bold uppercase tracking-wider text-[10px] border-b border-gray-100">
                  <tr>
                    <th className="p-4">Nombre</th>
                    <th className="p-4">Correo</th>
                    <th className="p-4">Rol</th>
                    <th className="p-4">Estado</th>
                    <th className="p-4">Registrado</th>
                    <th className="p-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {pagedUsers.map((u: any) => (
                    <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="p-4 font-bold text-gray-800">{u.name}</td>
                      <td className="p-4 text-gray-500 font-medium">{u.email}</td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border ${u.role === 'admin' ? 'bg-[#ff5000] text-white border-[#ff5000]' : 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => toggleUserActive(u)}
                          className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border transition-colors ${u.is_active !== false ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' : 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'}`}
                        >
                          {u.is_active !== false ? 'Activo' : 'Inactivo'}
                        </button>
                      </td>
                      <td className="p-4 text-gray-500 text-xs font-medium">{new Date(u.created_at).toLocaleDateString()}</td>
                      <td className="p-4 text-right">
                        <button onClick={() => openEditUserModal(u)} className="text-blue-600 hover:underline font-bold text-xs">Editar</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <PaginationBar total={filteredUsers.length} page={usersPage} pageSize={PAGE_SIZE} onPage={setUsersPage} />
          </div>
        )}

        {activeTab === 'products' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
             <div className="p-5 border-b border-gray-100 bg-gray-50 space-y-3">
               <div className="flex justify-between items-center">
                 <h3 className="font-extrabold text-gray-900">Control de Inventario <span className="text-gray-400 font-normal text-sm">({filteredProducts.length})</span></h3>
                 <div className="flex gap-2">
                   <button onClick={handleClearAllDiscounts} className="bg-orange-50 border border-orange-200 text-orange-600 text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm hover:bg-orange-100 transition-colors">Limpiar Descuentos</button>
                   <button onClick={openAddModal} className="bg-[#111] text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm hover:bg-[#ff5000] transition-colors">+ Agregar Producto</button>
                 </div>
               </div>
               <div className="relative">
                 <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                 <input value={productsSearch} onChange={e => setProductsSearch(e.target.value)} placeholder="Buscar producto por nombre..." className="w-full pl-8 pr-4 py-2 text-sm border border-gray-200 rounded-xl bg-white text-gray-900 outline-none focus:border-[#ff5000] focus:ring-1 focus:ring-[#ff5000]" />
               </div>
             </div>

             {/* Low Stock Alerts */}
             {products.filter(p => p.stock < 5).length > 0 && (
                <div className="bg-red-50 p-4 border-l-4 border-red-500 flex items-center space-x-3 shadow-inner mb-1">
                    <span className="text-red-500 font-extrabold text-sm flex items-center"><Package size={16} className="mr-1" /> ALERTA DE STOCK BAJO:</span>
                    <span className="text-red-800 text-xs font-bold">{products.filter(p => p.stock < 5).length} artículos tienen stock crítico. Reponer inventario.</span>
                </div>
             )}

             <div className="overflow-x-auto">
                 <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-white text-gray-400 font-bold uppercase tracking-wider text-[10px] border-b border-gray-100">
                      <tr>
                        <th className="p-4">Nombre del Producto</th>
                        <th className="p-4">Precio</th>
                        <th className="p-4">Stock</th>
                        <th className="p-4">Destacado</th>
                        <th className="p-4 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {pagedProducts.map((p: any) => (
                        <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="p-4 font-bold text-gray-800 truncate max-w-50 hover:max-w-none hover:whitespace-normal">{p.name}</td>
                          <td className="p-4 font-black text-[#ff5000]">Q{p.price}</td>
                          <td className="p-4">
                            <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border shadow-sm ${p.stock < 5 ? 'bg-red-50 text-red-600 border-red-200 animate-pulse' : 'bg-green-50 text-green-700 border-green-200'}`}>
                              {p.stock} en stock
                            </span>
                          </td>
                          <td className="p-4 text-gray-500 text-xs font-bold">
                             {p.is_featured ? <span className="text-yellow-600 bg-yellow-50 border border-yellow-200 px-2 py-0.5 rounded-md">⭐ Sí</span> : 'No'}
                          </td>
                          <td className="p-4 text-right space-x-2">
                             <button onClick={() => openEditModal(p)} className="text-blue-600 hover:underline font-bold text-xs">Editar</button>
                             <button onClick={() => handleDeleteProduct(p.id)} className="text-red-600 hover:underline font-bold text-xs">Eliminar</button>
                          </td>
                        </tr>
                      ))}
                      {pagedProducts.length === 0 && <tr><td colSpan={4} className="text-center p-10 text-gray-500">{productsSearch ? 'Sin resultados.' : 'No hay productos registrados.'}</td></tr>}
                    </tbody>
                 </table>
             </div>
             <PaginationBar total={filteredProducts.length} page={productsPage} pageSize={PAGE_SIZE} onPage={setProductsPage} />
          </div>
        )}

        {activeTab === 'categories' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
              <h3 className="font-extrabold text-gray-900">Categorías</h3>
              <button onClick={openAddCategoryModal} className="bg-[#111] text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm hover:bg-[#ff5000] transition-colors">+ Agregar Categoría</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-white text-gray-400 font-bold uppercase tracking-wider text-[10px] border-b border-gray-100">
                  <tr>
                    <th className="p-4">Nombre</th>
                    <th className="p-4">Slug</th>
                    <th className="p-4">Descripción</th>
                    <th className="p-4">Productos</th>
                    <th className="p-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {categories.map((c: any) => (
                    <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="p-4 font-bold text-gray-800 flex items-center gap-3">
                        {c.image && <img src={c.image} alt={c.name} className="w-8 h-8 rounded-md object-cover border border-gray-100" />}
                        {c.name}
                      </td>
                      <td className="p-4 text-gray-500 font-mono text-xs">{c.slug}</td>
                      <td className="p-4 text-gray-500 font-medium max-w-50 truncate">{c.description || '—'}</td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-black border bg-blue-50 text-blue-700 border-blue-200">
                          {c.products_count ?? products.filter((p: any) => p.category_id === c.id).length} productos
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button onClick={() => openEditCategoryModal(c)} className="text-blue-600 hover:underline font-bold text-xs">Editar</button>
                        <button onClick={() => handleDeleteCategory(c.id)} className="text-red-600 hover:underline font-bold text-xs">Eliminar</button>
                      </td>
                    </tr>
                  ))}
                  {categories.length === 0 && (
                    <tr><td colSpan={5} className="text-center p-10 text-gray-400 font-medium">No hay categorías aún. Agrega una para comenzar.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'coupons' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100 bg-gray-50 space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="font-extrabold text-gray-900">Cupones <span className="text-gray-400 font-normal text-sm">({filteredCoupons.length})</span></h3>
                <button onClick={openAddCouponModal} className="bg-[#111] text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm hover:bg-[#ff5000] transition-colors">+ Agregar Cupón</button>
              </div>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input value={couponsSearch} onChange={e => setCouponsSearch(e.target.value)} placeholder="Buscar por código o descripción..." className="w-full pl-8 pr-4 py-2 text-sm border border-gray-200 rounded-xl bg-white text-gray-900 outline-none focus:border-[#ff5000] focus:ring-1 focus:ring-[#ff5000]" />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-white text-gray-400 font-bold uppercase tracking-wider text-[10px] border-b border-gray-100">
                  <tr>
                    <th className="p-4">Código</th>
                    <th className="p-4">Tipo</th>
                    <th className="p-4">Valor</th>
                    <th className="p-4">Compra Mín.</th>
                    <th className="p-4">Usos</th>
                    <th className="p-4">Vence</th>
                    <th className="p-4">Estado</th>
                    <th className="p-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {pagedCoupons.map((c: any) => (
                    <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="p-4 font-black text-gray-800 font-mono tracking-wider">{c.code}</td>
                      <td className="p-4 text-gray-600 font-medium">{c.discount_type === 'percentage' ? 'Porcentaje' : 'Monto fijo'}</td>
                      <td className="p-4 font-bold text-[#ff5000]">{c.discount_type === 'percentage' ? `${c.discount_value}%` : `Q${c.discount_value}`}</td>
                      <td className="p-4 text-gray-500 font-medium">{c.min_purchase > 0 ? `Q${c.min_purchase}` : '—'}</td>
                      <td className="p-4 text-gray-500 font-medium">{c.uses_count}{c.max_uses ? ` / ${c.max_uses}` : ''}</td>
                      <td className="p-4 text-gray-500 text-xs font-medium">{c.expires_at ? new Date(c.expires_at).toLocaleDateString() : '—'}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border shadow-sm ${c.is_active ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                          {c.is_active ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button onClick={() => openEditCouponModal(c)} className="text-blue-600 hover:underline font-bold text-xs">Editar</button>
                        <button onClick={() => handleDeleteCoupon(c.id)} className="text-red-600 hover:underline font-bold text-xs">Eliminar</button>
                      </td>
                    </tr>
                  ))}
                  {pagedCoupons.length === 0 && (
                    <tr><td colSpan={8} className="text-center p-10 text-gray-400 font-medium">{couponsSearch ? 'Sin resultados.' : 'No hay cupones aún.'}</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <PaginationBar total={filteredCoupons.length} page={couponsPage} pageSize={PAGE_SIZE} onPage={setCouponsPage} />
          </div>
        )}

        {activeTab === 'carousel' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-extrabold text-gray-900 text-lg">Editar Carrusel de Inicio</h3>
                  <p className="text-xs text-gray-400 font-medium mt-1">Los cambios se reflejan en la página principal al guardar.</p>
                </div>
                <div className="flex gap-2">
                  {carouselSlides.length < 6 && (
                    <button onClick={addSlide} className="text-xs font-bold px-3 py-1.5 rounded-lg border border-gray-200 hover:border-[#ff5000] hover:text-[#ff5000] transition-colors">+ Agregar Diapositiva</button>
                  )}
                  <button onClick={handleSaveCarousel} disabled={carouselSaving} className="bg-[#ff5000] text-white text-xs font-bold px-4 py-1.5 rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50">
                    {carouselSaving ? 'Guardando...' : 'Guardar Carrusel'}
                  </button>
                </div>
              </div>

              <div className="space-y-6">
                {carouselSlides.map((slide, i) => (
                  <div key={i} className="border border-gray-100 rounded-2xl p-5 bg-gray-50/50 relative">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-black text-gray-500 uppercase tracking-wider">Diapositiva {i + 1}</span>
                      {carouselSlides.length > 1 && (
                        <button onClick={() => removeSlide(i)} className="text-[10px] font-bold text-red-400 hover:text-red-600 border border-red-200 hover:border-red-400 px-2 py-1 rounded-lg transition-colors">Eliminar</button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="text-xs font-bold block mb-1 text-gray-700">Imagen</label>
                        <ImageInput value={slide.image} onChange={url => updateSlide(i, 'image', url)} placeholder="https://images.unsplash.com/..." />
                      </div>
                      <div>
                        <label className="text-xs font-bold block mb-1 text-gray-700">Etiqueta (Badge) <span className="text-gray-400 font-normal">Ej. 🔥 Oferta Relámpago</span></label>
                        <input
                          value={slide.badge}
                          onChange={e => updateSlide(i, 'badge', e.target.value)}
                          className="w-full bg-gray-100 border border-gray-300 text-gray-900 rounded-xl p-2.5 text-sm outline-none focus:border-[#ff5000] focus:ring-1 focus:ring-[#ff5000]"
                          placeholder="🔥 Oferta Relámpago"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold block mb-1 text-gray-700">Título <span className="text-gray-400 font-normal">Usa \n para salto de línea</span></label>
                        <input
                          value={slide.title}
                          onChange={e => updateSlide(i, 'title', e.target.value)}
                          className="w-full bg-gray-100 border border-gray-300 text-gray-900 rounded-xl p-2.5 text-sm outline-none focus:border-[#ff5000] focus:ring-1 focus:ring-[#ff5000]"
                          placeholder="Ilumina tu\nCamino"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-xs font-bold block mb-1 text-gray-700">Subtítulo</label>
                        <input
                          value={slide.subtitle}
                          onChange={e => updateSlide(i, 'subtitle', e.target.value)}
                          className="w-full bg-gray-100 border border-gray-300 text-gray-900 rounded-xl p-2.5 text-sm outline-none focus:border-[#ff5000] focus:ring-1 focus:ring-[#ff5000]"
                          placeholder="Descripción breve del slide..."
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 max-w-lg">
              <div className="flex items-center gap-2 mb-5">
                <MessageCircle size={18} className="text-green-500" />
                <h3 className="font-extrabold text-gray-900 text-lg">Número de WhatsApp</h3>
              </div>
              <p className="text-xs text-gray-400 font-medium mb-4">Este es el número al que se redirigen los pedidos cuando un cliente hace checkout. Incluye el código de país sin el +, ej: <span className="font-mono text-gray-600">50212345678</span></p>
              <div className="flex gap-3">
                <input
                  type="tel"
                  value={whatsappNumber}
                  onChange={e => setWhatsappNumber(e.target.value)}
                  className="flex-1 bg-gray-100 border border-gray-300 text-gray-900 rounded-xl p-3 text-sm outline-none focus:border-[#ff5000] focus:ring-1 focus:ring-[#ff5000] font-mono"
                  placeholder="50212345678"
                />
                <button
                  onClick={handleSaveWhatsapp}
                  disabled={whatsappSaving}
                  className="bg-green-500 hover:bg-green-600 text-white font-bold px-5 py-3 rounded-xl text-sm transition-colors disabled:opacity-50"
                >
                  {whatsappSaving ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Category Form Modal */}
        {showCategoryModal && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
              <div className="p-5 border-b flex justify-between items-center bg-gray-100">
                <h3 className="font-black text-lg text-gray-900">{editingCategory ? 'Editar Categoría' : 'Agregar Categoría'}</h3>
                <button onClick={() => setShowCategoryModal(false)} className="text-gray-400 hover:text-black font-bold">✕</button>
              </div>
              <div className="p-5 overflow-y-auto">
                <form id="category-form" onSubmit={handleSaveCategory} className="space-y-4">
                  <div>
                    <label className="text-xs font-bold block mb-1 text-gray-700">Nombre</label>
                    <input required value={categoryForm.name} onChange={e => setCategoryForm({ ...categoryForm, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') })} className="w-full bg-gray-100 border border-gray-300 text-gray-900 rounded-lg p-2.5 text-sm outline-none focus:border-[#ff5000] focus:ring-1 focus:ring-[#ff5000]" placeholder="Ej. Luces LED" />
                  </div>
                  <div>
                    <label className="text-xs font-bold block mb-1 text-gray-700">Slug</label>
                    <input required value={categoryForm.slug} onChange={e => setCategoryForm({ ...categoryForm, slug: e.target.value })} className="w-full bg-gray-100 border border-gray-300 text-gray-900 rounded-lg p-2.5 text-sm outline-none focus:border-[#ff5000] focus:ring-1 focus:ring-[#ff5000] font-mono" placeholder="ej. luces-led" />
                  </div>
                  <div>
                    <label className="text-xs font-bold block mb-1 text-gray-700">Descripción</label>
                    <textarea value={categoryForm.description} onChange={e => setCategoryForm({ ...categoryForm, description: e.target.value })} className="w-full bg-gray-100 border border-gray-300 text-gray-900 rounded-lg p-2.5 text-sm outline-none focus:border-[#ff5000] focus:ring-1 focus:ring-[#ff5000] h-20" placeholder="Descripción opcional..." />
                  </div>
                  <div>
                    <label className="text-xs font-bold block mb-1 text-gray-700">Imagen</label>
                    <ImageInput value={categoryForm.image} onChange={url => setCategoryForm({ ...categoryForm, image: url })} />
                  </div>
                </form>
              </div>
              <div className="p-4 border-t bg-gray-100 flex justify-end space-x-2">
                <button onClick={() => setShowCategoryModal(false)} className="px-4 py-2 font-bold text-sm text-gray-500 hover:text-black">Cancelar</button>
                <button type="submit" form="category-form" className="px-4 py-2 font-bold text-sm bg-[#ff5000] text-white rounded shadow-sm hover:bg-orange-600">Guardar Categoría</button>
              </div>
            </div>
          </div>
        )}

        {/* Product Form Modal */}
        {showProductModal && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
             <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-5 border-b flex justify-between items-center bg-gray-100">
                    <h3 className="font-black text-lg text-gray-900">{editingProduct ? 'Editar Producto' : 'Agregar Producto'}</h3>
                    <button onClick={() => setShowProductModal(false)} className="text-gray-400 hover:text-black font-bold">✕</button>
                </div>
                <div className="p-5 overflow-y-auto">
                    <form id="product-form" onSubmit={handleSaveProduct} className="space-y-4">
                        <div><label className="text-xs font-bold block mb-1 text-gray-700">Nombre</label><input required value={productForm.name} onChange={e=>setProductForm({...productForm, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-')})} className="w-full bg-gray-100 border border-gray-300 text-gray-900 rounded-lg p-2.5 text-sm outline-none focus:border-[#ff5000] focus:ring-1 focus:ring-[#ff5000]" /></div>
                        <div><label className="text-xs font-bold block mb-1 text-gray-700">Slug</label><input required value={productForm.slug} onChange={e=>setProductForm({...productForm, slug: e.target.value})} className="w-full bg-gray-100 border border-gray-300 text-gray-900 rounded-lg p-2.5 text-sm outline-none focus:border-[#ff5000] focus:ring-1 focus:ring-[#ff5000]" /></div>
                        <div className="grid grid-cols-2 gap-4">
                            <div><label className="text-xs font-bold block mb-1 text-gray-700">Precio (Q)</label><input required type="number" step="0.01" value={productForm.price} onChange={e=>setProductForm({...productForm, price: e.target.value})} className="w-full bg-gray-100 border border-gray-300 text-gray-900 rounded-lg p-2.5 text-sm outline-none focus:border-[#ff5000] focus:ring-1 focus:ring-[#ff5000]" /></div>
                            <div><label className="text-xs font-bold block mb-1 text-gray-700">Precio con Descuento (Q) <span className="text-gray-400 font-normal">Opcional</span></label><input type="number" step="0.01" min="0" value={productForm.discount_price} onChange={e=>setProductForm({...productForm, discount_price: e.target.value})} className="w-full bg-gray-100 border border-gray-300 text-gray-900 rounded-lg p-2.5 text-sm outline-none focus:border-[#ff5000] focus:ring-1 focus:ring-[#ff5000]" placeholder="Dejar vacío si no aplica" /></div>
                        </div>
                        {productForm.discount_price && (
                          <div><label className="text-xs font-bold block mb-1 text-gray-700">⏰ Oferta válida hasta <span className="text-gray-400 font-normal">Opcional — si no pones fecha, el descuento no expira</span></label><input type="datetime-local" value={productForm.offer_ends_at} onChange={e=>setProductForm({...productForm, offer_ends_at: e.target.value})} className="w-full bg-gray-100 border border-gray-300 text-gray-900 rounded-lg p-2.5 text-sm outline-none focus:border-[#ff5000] focus:ring-1 focus:ring-[#ff5000]" /></div>
                        )}
                        <div><label className="text-xs font-bold block mb-1 text-gray-700">Stock</label><input required type="number" value={productForm.stock} onChange={e=>setProductForm({...productForm, stock: e.target.value})} className="w-full bg-gray-100 border border-gray-300 text-gray-900 rounded-lg p-2.5 text-sm outline-none focus:border-[#ff5000] focus:ring-1 focus:ring-[#ff5000]" /></div>
                        <div>
                            <label className="text-xs font-bold block mb-1 text-gray-700">Categoría</label>
                            <select value={productForm.category_id} onChange={e=>setProductForm({...productForm, category_id: parseInt(e.target.value)})} className="w-full bg-gray-100 border border-gray-300 text-gray-900 rounded-lg p-2.5 text-sm outline-none focus:border-[#ff5000] focus:ring-1 focus:ring-[#ff5000]">
                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div><label className="text-xs font-bold block mb-1 text-gray-700">Descripción</label><textarea required value={productForm.description} onChange={e=>setProductForm({...productForm, description: e.target.value})} className="w-full bg-gray-100 border border-gray-300 text-gray-900 rounded-lg p-2.5 text-sm outline-none focus:border-[#ff5000] focus:ring-1 focus:ring-[#ff5000] h-20" /></div>
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-xs font-bold text-gray-700">Imágenes (URLs)</label>
                            {productForm.images.length < 5 && (
                              <button type="button" onClick={() => setProductForm({...productForm, images: [...productForm.images, '']})} className="text-[10px] font-bold text-[#ff5000] hover:underline">+ Agregar imagen</button>
                            )}
                          </div>
                          {productForm.images.map((img, idx) => (
                            <div key={idx} className="mb-3">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-[11px] text-gray-500 font-bold">Imagen {idx + 1}{idx === 0 ? ' (principal)' : ''}</span>
                                {productForm.images.length > 1 && (
                                  <button type="button" onClick={() => setProductForm({...productForm, images: productForm.images.filter((_, i) => i !== idx)})} className="text-[10px] text-red-400 hover:text-red-600 font-bold">Eliminar</button>
                                )}
                              </div>
                              <ImageInput
                                value={img}
                                onChange={url => {
                                  const imgs = [...productForm.images];
                                  imgs[idx] = url;
                                  setProductForm({...productForm, images: imgs});
                                }}
                                placeholder={`URL imagen ${idx + 1}`}
                              />
                            </div>
                          ))}
                        </div>
                        <div>
                          <label className="text-xs font-bold block mb-1 text-gray-700">Video Demostrativo <span className="text-gray-400 font-normal">(opcional — URL de YouTube o Vimeo)</span></label>
                          <input
                            type="url"
                            value={productForm.video_url}
                            onChange={e => setProductForm({...productForm, video_url: e.target.value})}
                            placeholder="https://www.youtube.com/watch?v=..."
                            className="w-full bg-gray-100 border border-gray-300 text-gray-900 rounded-lg p-2.5 text-sm outline-none focus:border-[#ff5000] focus:ring-1 focus:ring-[#ff5000]"
                          />
                          {productForm.video_url && (
                            <p className="text-[10px] text-green-600 font-bold mt-1">✓ Video guardado — se mostrará en la página del producto</p>
                          )}
                        </div>
                        <div className="flex items-center space-x-2"><input type="checkbox" id="feat" checked={productForm.is_featured} onChange={e=>setProductForm({...productForm, is_featured: e.target.checked})} /><label htmlFor="feat" className="text-xs font-bold cursor-pointer">Marcar como Producto Destacado</label></div>
                    </form>
                </div>
                <div className="p-4 border-t bg-gray-100 flex justify-end space-x-2">
                    <button onClick={() => setShowProductModal(false)} className="px-4 py-2 font-bold text-sm text-gray-500 hover:text-black">Cancelar</button>
                    <button type="submit" form="product-form" className="px-4 py-2 font-bold text-sm bg-[#ff5000] text-white rounded shadow-sm hover:bg-orange-600">Guardar Producto</button>
                </div>
             </div>
          </div>
        )}

        {/* Coupon Form Modal */}
        {showCouponModal && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
              <div className="p-5 border-b flex justify-between items-center bg-gray-100">
                <h3 className="font-black text-lg text-gray-900">{editingCoupon ? 'Editar Cupón' : 'Agregar Cupón'}</h3>
                <button onClick={() => setShowCouponModal(false)} className="text-gray-400 hover:text-black font-bold">✕</button>
              </div>
              <div className="p-5 overflow-y-auto">
                <form id="coupon-form" onSubmit={handleSaveCoupon} className="space-y-4">
                  <div>
                    <label className="text-xs font-bold block mb-1 text-gray-700">Código</label>
                    <input required value={couponForm.code} onChange={e => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })} className="w-full bg-gray-100 border border-gray-300 text-gray-900 rounded-lg p-2.5 text-sm outline-none focus:border-[#ff5000] focus:ring-1 focus:ring-[#ff5000] font-mono uppercase tracking-wider" placeholder="Ej. AHORRA10" />
                  </div>
                  <div>
                    <label className="text-xs font-bold block mb-1 text-gray-700">Descripción</label>
                    <input value={couponForm.description} onChange={e => setCouponForm({ ...couponForm, description: e.target.value })} className="w-full bg-gray-100 border border-gray-300 text-gray-900 rounded-lg p-2.5 text-sm outline-none focus:border-[#ff5000] focus:ring-1 focus:ring-[#ff5000]" placeholder="Ej. 10% de descuento en tu pedido" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold block mb-1 text-gray-700">Tipo de Descuento</label>
                      <select value={couponForm.discount_type} onChange={e => setCouponForm({ ...couponForm, discount_type: e.target.value })} className="w-full bg-gray-100 border border-gray-300 text-gray-900 rounded-lg p-2.5 text-sm outline-none focus:border-[#ff5000] focus:ring-1 focus:ring-[#ff5000]">
                        <option value="percentage">Porcentaje (%)</option>
                        <option value="fixed">Fijo (Q)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold block mb-1 text-gray-700">Valor</label>
                      <input required type="number" step="0.01" min="0" value={couponForm.discount_value} onChange={e => setCouponForm({ ...couponForm, discount_value: e.target.value })} className="w-full bg-gray-100 border border-gray-300 text-gray-900 rounded-lg p-2.5 text-sm outline-none focus:border-[#ff5000] focus:ring-1 focus:ring-[#ff5000]" placeholder={couponForm.discount_type === 'percentage' ? '10' : '50'} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold block mb-1 text-gray-700">Compra Mínima (Q)</label>
                      <input type="number" step="0.01" min="0" value={couponForm.min_purchase} onChange={e => setCouponForm({ ...couponForm, min_purchase: e.target.value })} className="w-full bg-gray-100 border border-gray-300 text-gray-900 rounded-lg p-2.5 text-sm outline-none focus:border-[#ff5000] focus:ring-1 focus:ring-[#ff5000]" placeholder="0" />
                    </div>
                    <div>
                      <label className="text-xs font-bold block mb-1 text-gray-700">Usos Máximos</label>
                      <input type="number" min="1" value={couponForm.max_uses} onChange={e => setCouponForm({ ...couponForm, max_uses: e.target.value })} className="w-full bg-gray-100 border border-gray-300 text-gray-900 rounded-lg p-2.5 text-sm outline-none focus:border-[#ff5000] focus:ring-1 focus:ring-[#ff5000]" placeholder="Sin límite" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold block mb-1 text-gray-700">Fecha de Vencimiento</label>
                    <input type="date" value={couponForm.expires_at} onChange={e => setCouponForm({ ...couponForm, expires_at: e.target.value })} className="w-full bg-gray-100 border border-gray-300 text-gray-900 rounded-lg p-2.5 text-sm outline-none focus:border-[#ff5000] focus:ring-1 focus:ring-[#ff5000]" />
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="coupon-active" checked={couponForm.is_active} onChange={e => setCouponForm({ ...couponForm, is_active: e.target.checked })} />
                    <label htmlFor="coupon-active" className="text-xs font-bold cursor-pointer">Activo</label>
                  </div>
                </form>
              </div>
              <div className="p-4 border-t bg-gray-100 flex justify-end space-x-2">
                <button onClick={() => setShowCouponModal(false)} className="px-4 py-2 font-bold text-sm text-gray-500 hover:text-black">Cancelar</button>
                <button type="submit" form="coupon-form" className="px-4 py-2 font-bold text-sm bg-[#ff5000] text-white rounded shadow-sm hover:bg-orange-600">Guardar Cupón</button>
              </div>
            </div>
          </div>
        )}

        {/* Edit User Modal */}
        {showUserModal && editingUser && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">
              <div className="p-5 border-b flex justify-between items-center bg-gray-100">
                <h3 className="font-black text-lg text-gray-900">Editar Usuario</h3>
                <button onClick={() => setShowUserModal(false)} className="text-gray-400 hover:text-black font-bold">✕</button>
              </div>
              <div className="p-5">
                <form id="user-edit-form" onSubmit={handleUpdateUser} className="space-y-4">
                  <div>
                    <label className="text-xs font-bold block mb-1 text-gray-700">Nombre</label>
                    <input required value={userForm.name} onChange={e => setUserForm({ ...userForm, name: e.target.value })} className="w-full bg-gray-100 border border-gray-300 text-gray-900 rounded-xl p-2.5 text-sm outline-none focus:border-[#ff5000] focus:ring-1 focus:ring-[#ff5000]" />
                  </div>
                  <div>
                    <label className="text-xs font-bold block mb-1 text-gray-700">Rol</label>
                    <select value={userForm.role} onChange={e => setUserForm({ ...userForm, role: e.target.value })} className="w-full bg-gray-100 border border-gray-300 text-gray-900 rounded-xl p-2.5 text-sm outline-none focus:border-[#ff5000] focus:ring-1 focus:ring-[#ff5000]">
                      <option value="customer">Cliente</option>
                      <option value="admin">Administrador</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold block mb-1 text-gray-700">Estado</label>
                    <select value={userForm.is_active ? 'active' : 'inactive'} onChange={e => setUserForm({ ...userForm, is_active: e.target.value === 'active' })} className="w-full bg-gray-100 border border-gray-300 text-gray-900 rounded-xl p-2.5 text-sm outline-none focus:border-[#ff5000] focus:ring-1 focus:ring-[#ff5000]">
                      <option value="active">Activo</option>
                      <option value="inactive">Inactivo</option>
                    </select>
                  </div>
                </form>

                {/* Password reset — outside the main form to avoid submit conflict */}
                <div className="border-t border-gray-200 pt-4 mt-2">
                  <label className="text-xs font-bold block mb-1 text-gray-700">Nueva contraseña</label>
                  <div className="flex gap-2">
                    <input
                      type="password"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      placeholder="Mínimo 8 caracteres"
                      className="flex-1 bg-gray-100 border border-gray-300 text-gray-900 rounded-xl p-2.5 text-sm outline-none focus:border-[#ff5000] focus:ring-1 focus:ring-[#ff5000]"
                    />
                    <button
                      type="button"
                      onClick={handleResetPassword}
                      disabled={passwordSaving || !newPassword.trim()}
                      className="px-3 py-2 text-xs font-black bg-[#111] hover:bg-[#ff5000] text-white rounded-xl transition-colors disabled:opacity-40 shrink-0"
                    >
                      {passwordSaving ? '...' : 'Cambiar'}
                    </button>
                  </div>
                </div>
              </div>
              <div className="p-4 border-t bg-gray-100 flex justify-end space-x-2">
                <button onClick={() => setShowUserModal(false)} className="px-4 py-2 font-bold text-sm text-gray-500 hover:text-black">Cancelar</button>
                <button type="submit" form="user-edit-form" className="px-4 py-2 font-bold text-sm bg-[#ff5000] text-white rounded shadow-sm hover:bg-orange-600">Guardar Cambios</button>
              </div>
            </div>
          </div>
        )}

        {/* Create User Modal */}
        {showCreateUserModal && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">
              <div className="p-5 border-b flex justify-between items-center bg-gray-100">
                <h3 className="font-black text-lg text-gray-900">Agregar Nuevo Usuario</h3>
                <button onClick={() => setShowCreateUserModal(false)} className="text-gray-400 hover:text-black font-bold">✕</button>
              </div>
              <div className="p-5">
                <form id="user-create-form" onSubmit={handleCreateUser} className="space-y-4">
                  <div>
                    <label className="text-xs font-bold block mb-1 text-gray-700">Nombre</label>
                    <input required value={createUserForm.name} onChange={e => setCreateUserForm({ ...createUserForm, name: e.target.value })} className="w-full bg-gray-100 border border-gray-300 text-gray-900 rounded-xl p-2.5 text-sm outline-none focus:border-[#ff5000] focus:ring-1 focus:ring-[#ff5000]" placeholder="Nombre Completo" />
                  </div>
                  <div>
                    <label className="text-xs font-bold block mb-1 text-gray-700">Correo</label>
                    <input required type="email" value={createUserForm.email} onChange={e => setCreateUserForm({ ...createUserForm, email: e.target.value })} className="w-full bg-gray-100 border border-gray-300 text-gray-900 rounded-xl p-2.5 text-sm outline-none focus:border-[#ff5000] focus:ring-1 focus:ring-[#ff5000]" placeholder="correo@ejemplo.com" />
                  </div>
                  <div>
                    <label className="text-xs font-bold block mb-1 text-gray-700">Contraseña</label>
                    <input required type="password" minLength={8} value={createUserForm.password} onChange={e => setCreateUserForm({ ...createUserForm, password: e.target.value })} className="w-full bg-gray-100 border border-gray-300 text-gray-900 rounded-xl p-2.5 text-sm outline-none focus:border-[#ff5000] focus:ring-1 focus:ring-[#ff5000]" placeholder="Mín. 8 caracteres" />
                  </div>
                  <div>
                    <label className="text-xs font-bold block mb-1 text-gray-700">Rol</label>
                    <select value={createUserForm.role} onChange={e => setCreateUserForm({ ...createUserForm, role: e.target.value })} className="w-full bg-gray-100 border border-gray-300 text-gray-900 rounded-xl p-2.5 text-sm outline-none focus:border-[#ff5000] focus:ring-1 focus:ring-[#ff5000]">
                      <option value="customer">Cliente</option>
                      <option value="admin">Administrador</option>
                    </select>
                  </div>
                </form>
              </div>
              <div className="p-4 border-t bg-gray-100 flex justify-end space-x-2">
                <button onClick={() => setShowCreateUserModal(false)} className="px-4 py-2 font-bold text-sm text-gray-500 hover:text-black">Cancelar</button>
                <button type="submit" form="user-create-form" className="px-4 py-2 font-bold text-sm bg-[#ff5000] text-white rounded shadow-sm hover:bg-orange-600">Crear Usuario</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

function PaginationBar({ total, page, pageSize, onPage }: { total: number; page: number; pageSize: number; onPage: (p: number) => void }) {
  const totalPages = Math.ceil(total / pageSize);
  if (totalPages <= 1) return null;
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, start + 4);
  const visible = Array.from({ length: end - start + 1 }, (_, i) => start + i);
  return (
    <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50/60">
      <span className="text-xs font-medium text-gray-500">
        {Math.min((page - 1) * pageSize + 1, total)}–{Math.min(page * pageSize, total)} de {total}
      </span>
      <div className="flex gap-1">
        <button disabled={page === 1} onClick={() => onPage(page - 1)} className="px-2.5 py-1.5 text-xs font-bold rounded-lg border border-gray-200 hover:border-[#ff5000] hover:text-[#ff5000] disabled:opacity-40 disabled:cursor-not-allowed transition-colors">‹</button>
        {visible.map(p => (
          <button key={p} onClick={() => onPage(p)} className={`w-8 h-7 text-xs font-bold rounded-lg border transition-colors ${p === page ? 'bg-[#ff5000] text-white border-[#ff5000]' : 'border-gray-200 hover:border-[#ff5000] hover:text-[#ff5000]'}`}>{p}</button>
        ))}
        <button disabled={page === totalPages} onClick={() => onPage(page + 1)} className="px-2.5 py-1.5 text-xs font-bold rounded-lg border border-gray-200 hover:border-[#ff5000] hover:text-[#ff5000] disabled:opacity-40 disabled:cursor-not-allowed transition-colors">›</button>
      </div>
    </div>
  );
}
