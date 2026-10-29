import React, { useState, useEffect } from 'react';
import { Header } from '../components/layout/Header';
import { Toast, ToastMessage } from '../components/common/Toast';
import { ProductItem } from '../types/product.types';
import { productService } from '../services/productService';
import { processService } from '../services/processService';

interface ProductPageProps {
  onNavigate?: (tabKey: string) => void;
}

export const ProductPage: React.FC<ProductPageProps> = ({ onNavigate }) => {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [stages, setStages] = useState<{ id: string; name: string }[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<ProductItem | null>(null);

  // Form State
  const [formId, setFormId] = useState('');
  const [formName, setFormName] = useState('');
  const [formStageId, setFormStageId] = useState('CD001');

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [prods, procData] = await Promise.all([
          productService.fetchProducts(),
          processService.fetchProcesses()
        ]);
        setProducts(prods);
        setStages((procData.stages || []).map(s => ({
          id: s.processId || s.id || '',
          name: s.processName || s.name || ''
        })));
      } catch (e) {
        console.error('Lỗi tải sản phẩm từ DB:', e);
      }
    };
    load();
  }, []);

  const addToast = (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => {
    const newToast: ToastMessage = { id: Date.now().toString(), type, title, message };
    setToasts(prev => [...prev, newToast]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Filtered products
  const filteredProducts = products.filter(p => {
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchId = p.id.toLowerCase().includes(term);
      const matchName = p.name.toLowerCase().includes(term);
      if (!matchId && !matchName) return false;
    }
    return true;
  });

  const openAddModal = () => {
    setEditingProduct(null);
    setFormId(productService.generateNextId('CD001'));
    setFormName('');
    setFormStageId('CD001');
    setIsModalOpen(true);
  };

  const openEditModal = (product: ProductItem) => {
    setEditingProduct(product);
    setFormId(product.id);
    setFormName(product.name);
    setFormStageId(product.stageId || 'CD001');
    setIsModalOpen(true);
  };

  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = productService.validateProduct(
      { id: formId, name: formName },
      !!editingProduct
    );

    if (!validation.isValid) {
      addToast('error', 'Lỗi dữ liệu', validation.error || 'Vui lòng kiểm tra lại thông tin.');
      return;
    }

    if (editingProduct) {
      const updated = await productService.addProductToDatabase({
        ...editingProduct,
        name: formName.trim(),
        stageId: formStageId
      });
      setProducts(updated);
      setIsModalOpen(false);
      addToast('success', 'Đã lưu', `Sản phẩm ${formName} đã được cập nhật thành công.`);
    } else {
      const updated = await productService.addProductToDatabase({
        id: formId.trim(),
        name: formName.trim(),
        stageId: formStageId,
        type: 'SEMI',
        unit: 'kg'
      });
      setProducts(updated);
      setIsModalOpen(false);
      addToast('success', 'Thêm thành công', `Đã thêm sản phẩm "${formName}" vào hệ thống.`);
    }
  };

  const openDeleteModal = (product: ProductItem) => {
    setDeletingProduct(product);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingProduct) return;
    const name = deletingProduct.name;
    const updated = await productService.deleteProductFromDatabase(deletingProduct.id);
    setProducts(updated);
    setIsDeleteModalOpen(false);
    setDeletingProduct(null);
    addToast('info', 'Đã xoá', `Sản phẩm ${name} đã được xoá khỏi danh mục.`);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header activeTab="products" onTabChange={(tab) => {
        if (onNavigate) {
          onNavigate(tab);
        } else {
          if (tab === 'weighStation') window.location.href = 'weighStation.html';
          if (tab === 'process') window.location.href = 'process.html';
        }
      }} />

      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-12">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-2.5">
          <a href="#" onClick={(e) => { e.preventDefault(); onNavigate?.('weighStation'); }} className="hover:text-red-600">Hệ thống</a>
          <span>/</span>
          <span className="text-slate-900 font-semibold">Quản lý sản phẩm</span>
        </div>

        {/* Page Header */}
        <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Danh mục sản phẩm</h1>
          </div>

          <button
            onClick={() => openAddModal()}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-[#DE4444] text-white text-xs font-semibold hover:bg-[#C93333] transition-colors shadow-xs cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Thêm sản phẩm
          </button>
        </div>

        {/* Search Panel */}
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs mb-5 flex items-center justify-between gap-4 flex-wrap">
          <div className="relative min-w-[280px] max-w-md flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Tìm theo mã sản phẩm, tên sản phẩm..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full h-9.5 pl-9 pr-3 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#DE4444]"
            />
          </div>

          <div className="text-xs font-semibold text-slate-500">
            Tổng cộng: <strong className="text-slate-900 font-mono text-sm">{filteredProducts.length}</strong> sản phẩm
          </div>
        </div>

        {/* Table View (Mã Sản Phẩm, Tên Sản Phẩm, Thao Tác) */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse min-w-[640px] table-fixed">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-6 w-[18%]">Mã Sản Phẩm</th>
                  <th className="py-3.5 px-6 w-[68%]">Tên Sản Phẩm</th>
                  <th className="py-3.5 px-6 w-[14%] text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-12 text-center text-slate-400 text-xs">
                      Không tìm thấy sản phẩm nào phù hợp.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* 1. Mã Sản Phẩm (22%) */}
                      <td className="py-4 px-6 font-mono font-bold text-xs text-[#DE4444] whitespace-nowrap">
                        <span className="bg-red-50 border border-red-200 px-3 py-1 rounded-lg inline-flex items-center">
                          {p.id}
                        </span>
                      </td>

                      {/* 2. Tên Sản Phẩm (64%) */}
                      <td className="py-4 px-6 font-bold text-slate-900 text-sm leading-snug truncate" title={p.name}>
                        {p.name}
                      </td>

                      {/* 3. Thao Tác (14%) */}
                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <div className="inline-flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(p)}
                            className="h-8 px-2.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:text-slate-900 hover:border-slate-300 hover:bg-slate-50 inline-flex items-center gap-1 text-xs font-medium transition-colors shrink-0 cursor-pointer"
                            title="Sửa / Đổi tên"
                          >
                            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                            <span>Sửa</span>
                          </button>
                          <button
                            onClick={() => openDeleteModal(p)}
                            className="w-8 h-8 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-red-600 hover:bg-red-50 hover:border-red-200 flex items-center justify-center transition-colors shrink-0 cursor-pointer"
                            title="Xoá sản phẩm"
                          >
                            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Modal Thêm / Chỉnh sửa / Đổi tên */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <svg className="w-5 h-5 text-[#DE4444]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                </svg>
                {editingProduct ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-7 h-7 rounded-md flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSaveForm}>
              <div className="p-5 flex flex-col gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">
                    Mã Sản Phẩm <span className="text-[#DE4444]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formId}
                    readOnly={!!editingProduct}
                    onChange={e => setFormId(e.target.value)}
                    placeholder="Ví dụ: SP-001"
                    className="w-full h-9.5 px-3 font-mono font-bold text-slate-900 border border-slate-200 rounded-lg focus:outline-none focus:border-[#DE4444] read-only:bg-slate-100 read-only:text-slate-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">
                    Tên Sản Phẩm <span className="text-[#DE4444]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={e => setFormName(e.target.value)}
                    placeholder="Ví dụ: Tôm thẻ xuất khẩu size 20-25"
                    className="w-full h-9.5 px-3 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-[#DE4444]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">
                    Công đoạn chế biến
                  </label>
                  <select
                    value={formStageId}
                    onChange={e => {
                      setFormStageId(e.target.value);
                      if (!editingProduct) {
                        setFormId(productService.generateNextId(e.target.value));
                      }
                    }}
                    className="w-full h-9.5 px-3 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:border-[#DE4444]"
                  >
                    {stages.map(st => (
                      <option key={st.id} value={st.id}>
                        [{st.id}] {st.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-4.5 py-2 rounded-lg bg-[#DE4444] text-white text-xs font-semibold hover:bg-[#C93333] transition-colors cursor-pointer"
                >
                  {editingProduct ? 'Cập nhật' : 'Thêm sản phẩm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal xác nhận xoá */}
      {isDeleteModalOpen && deletingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-3">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-1">Xoá sản phẩm?</h3>
              <p className="text-xs text-slate-500 mb-4">
                Bạn có chắc chắn muốn xoá sản phẩm <strong className="text-slate-800">"{deletingProduct.name}"</strong> ({deletingProduct.id})? Thao tác này không thể hoàn tác.
              </p>
              <div className="flex gap-2.5 w-full">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="flex-1 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="flex-1 py-2 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-700 transition-colors cursor-pointer"
                >
                  Xác nhận xoá
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast container */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map(toast => (
          <div key={toast.id} className="pointer-events-auto">
            <Toast toast={toast} onClose={removeToast} />
          </div>
        ))}
      </div>
    </div>
  );
};
