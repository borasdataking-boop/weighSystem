import React, { useState, useEffect, useMemo } from 'react';
import { Header } from '../components/layout/Header';
import { Toast, ToastMessage } from '../components/common/Toast';
import { ProductItem, ProductIOType, ProductStageAssignment } from '../types/product.types';
import { productService } from '../services/productService';
import { processService } from '../services/processService';

interface ProductPageProps {
  onNavigate?: (tabKey: string) => void;
}

type ProductViewMode = 'table' | 'stage_board';
type IOFilterType = 'ALL' | 'IN' | 'OUT' | 'UNASSIGNED';

export const ProductPage: React.FC<ProductPageProps> = ({ onNavigate }) => {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [stages, setStages] = useState<{ id: string; name: string }[]>([]);
  const [viewMode, setViewMode] = useState<ProductViewMode>('table');

  // Bộ lọc tìm kiếm
  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState<string>('ALL');
  const [ioFilter, setIoFilter] = useState<IOFilterType>('ALL');

  // Chỉnh sửa nhanh tên sản phẩm (Inline Edit trên bảng)
  const [inlineEditId, setInlineEditId] = useState<string | null>(null);
  const [inlineEditName, setInlineEditName] = useState<string>('');

  // Gán nhanh công đoạn trực tiếp tại cột Đầu vào (IN) hoặc Đầu ra (OUT)
  const [quickAssignCell, setQuickAssignCell] = useState<{
    productId: string;
    ioType: ProductIOType;
  } | null>(null);
  const [quickAssignStageId, setQuickAssignStageId] = useState<string>('CD001');

  // Chọn sản phẩm gán nhanh ở chế độ Theo công đoạn (Stage Board)
  const [boardSelectedProduct, setBoardSelectedProduct] = useState<Record<string, string>>({});

  // Modals Thêm / Sửa / Xoá
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<ProductItem | null>(null);

  // Form State trong Modal (Tách riêng danh sách công đoạn Đầu vào IN và Đầu ra OUT)
  const [formId, setFormId] = useState('');
  const [formName, setFormName] = useState('');
  const [formInStages, setFormInStages] = useState<string[]>([]);
  const [formOutStages, setFormOutStages] = useState<string[]>([]);
  const [modalPickInStage, setModalPickInStage] = useState<string>('CD001');
  const [modalPickOutStage, setModalPickOutStage] = useState<string>('CD001');

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
        const mappedStages = (procData.stages || []).map(s => ({
          id: s.processId || s.id || '',
          name: s.processName || s.name || ''
        }));
        setStages(mappedStages);
        if (mappedStages.length > 0) {
          setQuickAssignStageId(mappedStages[0].id);
          setModalPickInStage(mappedStages[0].id);
          setModalPickOutStage(mappedStages[0].id);
        }
      } catch (e) {
        console.error('Lỗi tải sản phẩm từ DB:', e);
      }
    };
    load();
  }, []);

  const addToast = (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => {
    const newToast: ToastMessage = { id: `${Date.now()}-${Math.random()}`, type, title, message };
    setToasts(prev => [...prev, newToast]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const stageMap = useMemo(() => {
    const map = new Map<string, string>();
    stages.forEach(s => map.set(s.id, s.name));
    return map;
  }, [stages]);

  const getStageName = (stageId: string) => {
    if (!stageId || stageId === 'UNASSIGNED') return 'Chưa gán công đoạn';
    return stageMap.get(stageId) || stageId;
  };

  // Thống kê số lượng theo vai trò IN / OUT / Chưa gán
  const counts = useMemo(() => {
    let inProducts = 0;
    let outProducts = 0;
    let unassignedProducts = 0;

    products.forEach(p => {
      const assigns = productService.getProductAssignments(p);
      if (assigns.length === 0) {
        unassignedProducts++;
      } else {
        if (assigns.some(a => a.ioType === 'IN')) inProducts++;
        if (assigns.some(a => a.ioType === 'OUT')) outProducts++;
      }
    });

    return {
      total: products.length,
      inProducts,
      outProducts,
      unassignedProducts
    };
  }, [products]);

  // Lọc danh sách sản phẩm
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const assigns = productService.getProductAssignments(p);

      // 1. Lọc theo từ khoá (mã SP, tên SP, mã công đoạn, tên công đoạn)
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase().trim();
        const matchId = p.id.toLowerCase().includes(term);
        const matchName = p.name.toLowerCase().includes(term);
        const matchStage = assigns.some(
          a =>
            a.stageId.toLowerCase().includes(term) ||
            getStageName(a.stageId).toLowerCase().includes(term)
        );
        if (!matchId && !matchName && !matchStage) return false;
      }

      // 2. Lọc theo công đoạn
      if (stageFilter !== 'ALL') {
        if (stageFilter === 'UNASSIGNED') {
          if (assigns.length > 0) return false;
        } else {
          if (!assigns.some(a => a.stageId === stageFilter)) return false;
        }
      }

      // 3. Lọc theo chiều IN / OUT
      if (ioFilter === 'IN') {
        if (stageFilter !== 'ALL' && stageFilter !== 'UNASSIGNED') {
          if (!assigns.some(a => a.stageId === stageFilter && a.ioType === 'IN')) return false;
        } else if (!assigns.some(a => a.ioType === 'IN')) {
          return false;
        }
      } else if (ioFilter === 'OUT') {
        if (stageFilter !== 'ALL' && stageFilter !== 'UNASSIGNED') {
          if (!assigns.some(a => a.stageId === stageFilter && a.ioType === 'OUT')) return false;
        } else if (!assigns.some(a => a.ioType === 'OUT')) {
          return false;
        }
      } else if (ioFilter === 'UNASSIGNED') {
        if (assigns.length > 0) return false;
      }

      return true;
    });
  }, [products, searchTerm, stageFilter, ioFilter, stageMap]);

  // Mở Modal thêm sản phẩm mới (có thể truyền sẵn công đoạn & chiều IN/OUT)
  const openAddModal = (presetStageId?: string, presetIoType?: ProductIOType) => {
    const defaultStage =
      presetStageId ||
      (stageFilter !== 'ALL' && stageFilter !== 'UNASSIGNED'
        ? stageFilter
        : stages[0]?.id || 'CD001');
    const defaultIo: ProductIOType =
      presetIoType || (ioFilter === 'IN' ? 'IN' : defaultStage === 'CD001' ? 'IN' : 'OUT');

    setEditingProduct(null);
    setFormId(productService.generateNextId(defaultStage));
    setFormName('');
    setFormInStages(defaultIo === 'IN' ? [defaultStage] : []);
    setFormOutStages(defaultIo === 'OUT' ? [defaultStage] : []);
    setModalPickInStage(defaultStage);
    setModalPickOutStage(defaultStage);
    setIsModalOpen(true);
  };

  // Mở Modal chỉnh sửa sản phẩm
  const openEditModal = (product: ProductItem) => {
    const assigns = productService.getProductAssignments(product);
    const inList = assigns.filter(a => a.ioType === 'IN').map(a => a.stageId);
    const outList = assigns.filter(a => a.ioType === 'OUT').map(a => a.stageId);

    setEditingProduct(product);
    setFormId(product.id);
    setFormName(product.name);
    setFormInStages(inList);
    setFormOutStages(outList);
    setModalPickInStage(stages[0]?.id || 'CD001');
    setModalPickOutStage(stages[0]?.id || 'CD001');
    setIsModalOpen(true);
  };

  // Lưu trong Modal Thêm / Sửa
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

    const combinedAssignments: ProductStageAssignment[] = [
      ...formInStages.map(stageId => ({ stageId, ioType: 'IN' as ProductIOType })),
      ...formOutStages.map(stageId => ({ stageId, ioType: 'OUT' as ProductIOType }))
    ];

    const primaryStageId = combinedAssignments[0]?.stageId || 'UNASSIGNED';
    const primaryIoType: ProductIOType = combinedAssignments[0]?.ioType || 'OUT';

    if (editingProduct) {
      const updated = await productService.addProductToDatabase({
        ...editingProduct,
        name: formName.trim(),
        stageId: primaryStageId,
        ioType: primaryIoType,
        assignments: combinedAssignments
      });
      setProducts(updated);
      setIsModalOpen(false);
      addToast('success', 'Đã cập nhật sản phẩm', `Đã lưu "${formName.trim()}" cùng cấu hình Đầu vào / Đầu ra.`);
    } else {
      const updated = await productService.addProductToDatabase({
        id: formId.trim().toUpperCase(),
        name: formName.trim(),
        stageId: primaryStageId,
        ioType: primaryIoType,
        assignments: combinedAssignments,
        type: 'SEMI',
        unit: 'kg'
      });
      setProducts(updated);
      setIsModalOpen(false);
      addToast('success', 'Thêm sản phẩm thành công', `Đã thêm sản phẩm "${formName.trim()}" (${formId.trim().toUpperCase()}).`);
    }
  };

  // Bắt đầu sửa nhanh tên sản phẩm trên bảng
  const startInlineRename = (product: ProductItem) => {
    setInlineEditId(product.id);
    setInlineEditName(product.name);
  };

  // Lưu tên sản phẩm sửa nhanh trên bảng
  const saveInlineRename = async (product: ProductItem) => {
    const trimmed = inlineEditName.trim();
    if (!trimmed) {
      addToast('error', 'Tên không hợp lệ', 'Tên sản phẩm không được để trống.');
      return;
    }
    if (trimmed === product.name) {
      setInlineEditId(null);
      return;
    }
    const assigns = productService.getProductAssignments(product);
    const updated = await productService.addProductToDatabase({
      ...product,
      name: trimmed,
      assignments: assigns
    });
    setProducts(updated);
    setInlineEditId(null);
    addToast('success', 'Đã đổi tên sản phẩm', `Mã ${product.id} đã được đổi tên thành "${trimmed}".`);
  };

  // Đổi nhanh Đầu vào (IN) <-> Đầu ra (OUT)
  const handleToggleAssignmentIO = async (
    product: ProductItem,
    stageId: string,
    currentIoType: ProductIOType
  ) => {
    const newIo: ProductIOType = currentIoType === 'IN' ? 'OUT' : 'IN';
    const updated = await productService.toggleProductAssignmentIO(product.id, stageId, currentIoType);
    setProducts(updated);
    addToast(
      'info',
      'Đã chuyển cột Đầu vào / Đầu ra',
      `"${product.name}" tại [${stageId}] đã chuyển sang cột ${newIo === 'IN' ? 'Đầu vào (IN)' : 'Đầu ra (OUT)'}.`
    );
  };

  // Gỡ một phân bổ công đoạn khỏi sản phẩm
  const handleRemoveAssignment = async (
    product: ProductItem,
    stageId: string,
    ioType: ProductIOType
  ) => {
    const updated = await productService.removeProductAssignment(product.id, stageId, ioType);
    setProducts(updated);
    addToast(
      'info',
      'Đã gỡ phân bổ công đoạn',
      `Đã gỡ "${product.name}" khỏi cột ${ioType === 'IN' ? 'Đầu vào (IN)' : 'Đầu ra (OUT)'} của [${stageId}].`
    );
  };

  // Gán nhanh công đoạn trực tiếp tại ô Đầu vào (IN) hoặc Đầu ra (OUT)
  const handleQuickAssignCellSubmit = async (product: ProductItem, ioType: ProductIOType) => {
    if (!quickAssignStageId) return;
    const updated = await productService.assignProductToStage(product.id, quickAssignStageId, ioType);
    setProducts(updated);
    setQuickAssignCell(null);
    addToast(
      'success',
      `Đã gán vào ${ioType === 'IN' ? 'Đầu vào (IN)' : 'Đầu ra (OUT)'}`,
      `Đã gán "${product.name}" vào ${ioType === 'IN' ? 'Đầu vào (IN)' : 'Đầu ra (OUT)'} của [${quickAssignStageId}] ${getStageName(quickAssignStageId)}.`
    );
  };

  // Gán sản phẩm có sẵn vào Đầu vào / Đầu ra ở chế độ Stage Board
  const handleBoardAssignExisting = async (stageId: string, ioType: ProductIOType) => {
    const key = `${stageId}_${ioType}`;
    const selectedProdId = boardSelectedProduct[key];
    if (!selectedProdId) return;

    const prod = products.find(p => p.id === selectedProdId);
    const updated = await productService.assignProductToStage(selectedProdId, stageId, ioType);
    setProducts(updated);
    setBoardSelectedProduct(prev => ({ ...prev, [key]: '' }));
    addToast(
      'success',
      'Đã gán sản phẩm vào công đoạn',
      `Đã gán "${prod?.name || selectedProdId}" làm ${ioType === 'IN' ? 'Đầu vào (IN)' : 'Đầu ra (OUT)'} của [${stageId}] ${getStageName(stageId)}.`
    );
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
    addToast('info', 'Đã xoá', `Sản phẩm "${name}" đã được xoá khỏi danh mục.`);
  };

  // Danh sách công đoạn hiển thị trong chế độ Stage Board
  const visibleStagesForBoard = useMemo(() => {
    return stages.filter(st => {
      if (stageFilter !== 'ALL' && stageFilter !== 'UNASSIGNED' && st.id !== stageFilter) {
        return false;
      }
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase().trim();
        const matchStage =
          st.id.toLowerCase().includes(term) || st.name.toLowerCase().includes(term);
        const stageProds = products.filter(p => productService.isProductAssignedTo(p, st.id));
        const matchProd = stageProds.some(
          p => p.id.toLowerCase().includes(term) || p.name.toLowerCase().includes(term)
        );
        return matchStage || matchProd;
      }
      return true;
    });
  }, [stages, stageFilter, searchTerm, products]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      <Header
        activeTab="products"
        onTabChange={tab => {
          if (onNavigate) {
            onNavigate(tab);
          } else {
            if (tab === 'weighStation') window.location.href = 'weighStation.html';
            if (tab === 'process') window.location.href = 'process.html';
          }
        }}
      />

      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-12">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
          <a
            href="#"
            onClick={e => {
              e.preventDefault();
              onNavigate?.('weighStation');
            }}
            className="hover:text-[#DE4444]"
          >
            Hệ thống
          </a>
          <span>/</span>
          <span className="text-slate-900 font-semibold">Quản lý sản phẩm</span>
        </div>

        {/* Page Header */}
        <div className="flex items-center justify-between gap-4 mb-5 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Danh mục sản phẩm & Phân bổ Đầu vào / Đầu ra
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Thêm sản phẩm, đổi tên sản phẩm và tự do gán sản phẩm vào bất kỳ công đoạn nào ở cột{' '}
              <span className="font-semibold text-blue-700">Đầu vào (IN)</span> hoặc cột{' '}
              <span className="font-semibold text-emerald-700">Đầu ra (OUT)</span> riêng biệt.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Chuyển chế độ xem */}
            <div className="inline-flex h-10 items-center bg-slate-200/70 p-1 rounded-lg border border-slate-200">
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`inline-flex items-center gap-1.5 h-full px-3 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-white text-[#DE4444] shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="8" y1="6" x2="21" y2="6" />
                  <line x1="8" y1="12" x2="21" y2="12" />
                  <line x1="8" y1="18" x2="21" y2="18" />
                  <line x1="3" y1="6" x2="3.01" y2="6" />
                  <line x1="3" y1="12" x2="3.01" y2="12" />
                  <line x1="3" y1="18" x2="3.01" y2="18" />
                </svg>
                <span>Danh sách sản phẩm</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('stage_board')}
                className={`inline-flex items-center gap-1.5 h-full px-3 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                  viewMode === 'stage_board'
                    ? 'bg-white text-[#DE4444] shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7" rx="1" />
                  <rect x="14" y="3" width="7" height="7" rx="1" />
                  <rect x="14" y="14" width="7" height="7" rx="1" />
                  <rect x="3" y="14" width="7" height="7" rx="1" />
                </svg>
                <span>Theo công đoạn (IN / OUT)</span>
              </button>
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
        </div>

        {/* Search & Filter Toolbar - Đồng bộ chiều cao h-9.5 đều tăm tắp */}
        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs mb-5 flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-1 flex-wrap">
            {/* Ô tìm kiếm */}
            <div className="relative min-w-[240px] flex-1 max-w-sm">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder="Tìm mã SP, tên SP (VD: tôm tươi sống, HLSO)..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full h-9.5 pl-9 pr-3 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#DE4444]"
              />
            </div>

            {/* Lọc theo Công đoạn */}
            <select
              value={stageFilter}
              onChange={e => setStageFilter(e.target.value)}
              className="h-9.5 px-3 border border-slate-200 rounded-lg text-xs bg-white text-slate-700 font-medium focus:outline-none focus:border-[#DE4444] cursor-pointer"
            >
              <option value="ALL">Tất cả công đoạn ({stages.length})</option>
              {stages.map(st => (
                <option key={st.id} value={st.id}>
                  [{st.id}] {st.name}
                </option>
              ))}
              <option value="UNASSIGNED">[Chưa gán công đoạn]</option>
            </select>

            {/* Lọc theo Đầu vào (IN) / Đầu ra (OUT) */}
            <div className="inline-flex h-9.5 items-center bg-slate-100 p-1 rounded-lg gap-1 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setIoFilter('ALL')}
                className={`h-full px-3 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                  ioFilter === 'ALL'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Tất cả ({counts.total})
              </button>
              <button
                type="button"
                onClick={() => setIoFilter('IN')}
                className={`h-full px-3 rounded-md text-xs font-semibold inline-flex items-center gap-1 transition-all cursor-pointer ${
                  ioFilter === 'IN'
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'text-blue-700 hover:bg-blue-50'
                }`}
              >
                <span>↓ Đầu vào (IN)</span>
                <span className="font-mono text-[11px] opacity-85">({counts.inProducts})</span>
              </button>
              <button
                type="button"
                onClick={() => setIoFilter('OUT')}
                className={`h-full px-3 rounded-md text-xs font-semibold inline-flex items-center gap-1 transition-all cursor-pointer ${
                  ioFilter === 'OUT'
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'text-emerald-700 hover:bg-emerald-50'
                }`}
              >
                <span>↑ Đầu ra (OUT)</span>
                <span className="font-mono text-[11px] opacity-85">({counts.outProducts})</span>
              </button>
              {counts.unassignedProducts > 0 && (
                <button
                  type="button"
                  onClick={() => setIoFilter('UNASSIGNED')}
                  className={`h-full px-3 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                    ioFilter === 'UNASSIGNED'
                      ? 'bg-amber-600 text-white shadow-2xs'
                      : 'text-amber-700 hover:bg-amber-50'
                  }`}
                >
                  Chưa gán ({counts.unassignedProducts})
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between xl:justify-end gap-3 text-xs text-slate-500 shrink-0">
            {(searchTerm || stageFilter !== 'ALL' || ioFilter !== 'ALL') && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setStageFilter('ALL');
                  setIoFilter('ALL');
                }}
                className="text-xs font-semibold text-[#DE4444] hover:underline cursor-pointer"
              >
                Đặt lại bộ lọc
              </button>
            )}
            <span className="font-semibold">
              Hiển thị: <strong className="text-slate-900 font-mono text-sm">{filteredProducts.length}</strong> sản phẩm
            </span>
          </div>
        </div>

        {/* ========================================================= */}
        {/* CHẾ ĐỘ 1: BẢNG DANH SÁCH SẢN PHẨM (CÂN ĐỐI 5 CỘT ĐỀU ĐẶN) */}
        {/* ========================================================= */}
        {viewMode === 'table' ? (
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse min-w-[1020px] table-fixed">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="py-3.5 px-5 w-[11%]">Mã SP</th>
                    <th className="py-3.5 px-5 w-[23%] border-l border-slate-200/70">Tên Sản Phẩm</th>
                    <th className="py-3.5 px-4 w-[27%] bg-blue-50/50 border-l border-slate-200/80 text-blue-700">
                      <div className="flex items-center justify-between">
                        <span className="inline-flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-blue-600" />
                          ↓ Đầu Vào (IN)
                        </span>
                        <span className="text-[10px] font-medium text-blue-600/80 normal-case">
                          Công đoạn nhận vào
                        </span>
                      </div>
                    </th>
                    <th className="py-3.5 px-4 w-[27%] bg-emerald-50/50 border-l border-slate-200/80 text-emerald-700">
                      <div className="flex items-center justify-between">
                        <span className="inline-flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-600" />
                          ↑ Đầu Ra (OUT)
                        </span>
                        <span className="text-[10px] font-medium text-emerald-600/80 normal-case">
                          Công đoạn xuất ra
                        </span>
                      </div>
                    </th>
                    <th className="py-3.5 px-5 w-[12%] border-l border-slate-200/80 text-right">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-400 text-xs">
                        Không tìm thấy sản phẩm nào phù hợp với bộ lọc hiện tại.
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map(p => {
                      const assigns = productService.getProductAssignments(p);
                      const inAssigns = assigns.filter(a => a.ioType === 'IN');
                      const outAssigns = assigns.filter(a => a.ioType === 'OUT');

                      const isInlineEditing = inlineEditId === p.id;
                      const isQuickAssigningIn =
                        quickAssignCell?.productId === p.id && quickAssignCell?.ioType === 'IN';
                      const isQuickAssigningOut =
                        quickAssignCell?.productId === p.id && quickAssignCell?.ioType === 'OUT';

                      return (
                        <tr key={p.id} className="hover:bg-slate-50/70 transition-colors align-middle">
                          {/* 1. Mã Sản Phẩm */}
                          <td className="py-3 px-5 font-mono font-bold text-xs text-[#DE4444] whitespace-nowrap">
                            <span className="h-7 px-2.5 bg-red-50 border border-red-200 rounded-md inline-flex items-center justify-center">
                              {p.id}
                            </span>
                          </td>

                          {/* 2. Tên Sản Phẩm (Có hỗ trợ sửa nhanh trực tiếp Product Name) */}
                          <td className="py-3 px-5 border-l border-slate-100">
                            {isInlineEditing ? (
                              <div className="flex items-center gap-1.5">
                                <input
                                  type="text"
                                  autoFocus
                                  value={inlineEditName}
                                  onChange={e => setInlineEditName(e.target.value)}
                                  onKeyDown={e => {
                                    if (e.key === 'Enter') saveInlineRename(p);
                                    if (e.key === 'Escape') setInlineEditId(null);
                                  }}
                                  className="flex-1 min-w-0 h-7.5 px-2.5 text-xs font-bold text-slate-900 border border-[#DE4444] rounded-md focus:outline-none bg-white"
                                />
                                <button
                                  type="button"
                                  onClick={() => saveInlineRename(p)}
                                  className="h-7.5 px-2.5 rounded-md bg-[#DE4444] text-white text-xs font-semibold hover:bg-[#C93333] cursor-pointer shrink-0"
                                >
                                  Lưu
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setInlineEditId(null)}
                                  className="h-7.5 px-2 rounded-md border border-slate-200 text-slate-500 hover:bg-slate-100 text-xs cursor-pointer shrink-0"
                                >
                                  Hủy
                                </button>
                              </div>
                            ) : (
                              <div className="group flex items-center justify-between gap-2">
                                <span
                                  className="font-bold text-slate-900 text-xs sm:text-sm leading-snug truncate cursor-pointer hover:text-[#DE4444] transition-colors"
                                  onClick={() => startInlineRename(p)}
                                  title={`${p.name} (Bấm để sửa nhanh tên sản phẩm)`}
                                >
                                  {p.name}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => startInlineRename(p)}
                                  className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-slate-200/70 text-slate-400 hover:text-slate-700 transition-all cursor-pointer shrink-0"
                                  title="Đổi tên sản phẩm nhanh"
                                >
                                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M12 20h9" />
                                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                                  </svg>
                                </button>
                              </div>
                            )}
                          </td>

                          {/* 3. CỘT ĐẦU VÀO (IN) — Căn trái đồng nhất, nút + Gán IN neo gọn bên phải */}
                          <td className="py-3 px-4 border-l border-slate-100 bg-blue-50/10">
                            <div className="flex flex-col gap-1.5">
                              <div className="flex items-center justify-between gap-2 min-h-[28px]">
                                <div className="flex flex-wrap items-center gap-1.5 min-w-0 flex-1">
                                  {inAssigns.length === 0 ? (
                                    <span className="text-[11px] text-slate-400 italic">
                                      Chưa gán
                                    </span>
                                  ) : (
                                    inAssigns.map((a, idx) => (
                                      <div
                                        key={`in_${a.stageId}_${idx}`}
                                        className="h-7 pl-2 pr-1 rounded-md bg-blue-50 border border-blue-200/90 text-blue-900 text-xs inline-flex items-center gap-1.5 max-w-full"
                                      >
                                        <span className="font-mono font-bold text-[11px] text-blue-700 shrink-0">
                                          {a.stageId}
                                        </span>
                                        <span
                                          className="font-medium text-slate-700 truncate max-w-[140px]"
                                          title={`[${a.stageId}] ${getStageName(a.stageId)}`}
                                        >
                                          {getStageName(a.stageId)}
                                        </span>
                                        <button
                                          type="button"
                                          onClick={() => handleRemoveAssignment(p, a.stageId, 'IN')}
                                          title="Gỡ khỏi Đầu vào (IN)"
                                          className="w-4 h-4 rounded inline-flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-100 transition-colors cursor-pointer shrink-0"
                                        >
                                          ×
                                        </button>
                                      </div>
                                    ))
                                  )}
                                </div>

                                <button
                                  type="button"
                                  onClick={() => {
                                    if (isQuickAssigningIn) {
                                      setQuickAssignCell(null);
                                    } else {
                                      setQuickAssignCell({ productId: p.id, ioType: 'IN' });
                                      setQuickAssignStageId(stages[0]?.id || 'CD001');
                                    }
                                  }}
                                  className="h-7 px-2 rounded-md border border-dashed border-blue-300 bg-white/80 text-blue-700 hover:bg-blue-50 hover:border-blue-400 text-[11px] font-semibold inline-flex items-center gap-0.5 transition-colors cursor-pointer shrink-0"
                                  title="Gán thêm công đoạn Đầu vào (IN)"
                                >
                                  <span>+ Gán IN</span>
                                </button>
                              </div>

                              {isQuickAssigningIn && (
                                <div className="p-1.5 bg-white border border-blue-200 rounded-lg flex items-center gap-1.5 shadow-xs animate-in fade-in duration-150">
                                  <select
                                    value={quickAssignStageId}
                                    onChange={e => setQuickAssignStageId(e.target.value)}
                                    className="flex-1 min-w-0 h-7 px-2 border border-slate-200 rounded text-xs bg-white focus:outline-none focus:border-blue-600"
                                  >
                                    {stages.map(st => (
                                      <option key={st.id} value={st.id}>
                                        [{st.id}] {st.name}
                                      </option>
                                    ))}
                                  </select>
                                  <button
                                    type="button"
                                    onClick={() => handleQuickAssignCellSubmit(p, 'IN')}
                                    className="h-7 px-2.5 rounded bg-blue-600 text-white text-[11px] font-semibold hover:bg-blue-700 cursor-pointer shrink-0"
                                  >
                                    Lưu
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setQuickAssignCell(null)}
                                    className="h-7 px-2 rounded border border-slate-200 text-slate-500 hover:bg-slate-100 text-[11px] cursor-pointer shrink-0"
                                  >
                                    Đóng
                                  </button>
                                </div>
                              )}
                            </div>
                          </td>

                          {/* 4. CỘT ĐẦU RA (OUT) — Căn trái đồng nhất, nút + Gán OUT neo gọn bên phải */}
                          <td className="py-3 px-4 border-l border-slate-100 bg-emerald-50/10">
                            <div className="flex flex-col gap-1.5">
                              <div className="flex items-center justify-between gap-2 min-h-[28px]">
                                <div className="flex flex-wrap items-center gap-1.5 min-w-0 flex-1">
                                  {outAssigns.length === 0 ? (
                                    <span className="text-[11px] text-slate-400 italic">
                                      Chưa gán
                                    </span>
                                  ) : (
                                    outAssigns.map((a, idx) => (
                                      <div
                                        key={`out_${a.stageId}_${idx}`}
                                        className="h-7 pl-2 pr-1 rounded-md bg-emerald-50 border border-emerald-200/90 text-emerald-900 text-xs inline-flex items-center gap-1.5 max-w-full"
                                      >
                                        <span className="font-mono font-bold text-[11px] text-emerald-700 shrink-0">
                                          {a.stageId}
                                        </span>
                                        <span
                                          className="font-medium text-slate-700 truncate max-w-[140px]"
                                          title={`[${a.stageId}] ${getStageName(a.stageId)}`}
                                        >
                                          {getStageName(a.stageId)}
                                        </span>
                                        <button
                                          type="button"
                                          onClick={() => handleRemoveAssignment(p, a.stageId, 'OUT')}
                                          title="Gỡ khỏi Đầu ra (OUT)"
                                          className="w-4 h-4 rounded inline-flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-100 transition-colors cursor-pointer shrink-0"
                                        >
                                          ×
                                        </button>
                                      </div>
                                    ))
                                  )}
                                </div>

                                <button
                                  type="button"
                                  onClick={() => {
                                    if (isQuickAssigningOut) {
                                      setQuickAssignCell(null);
                                    } else {
                                      setQuickAssignCell({ productId: p.id, ioType: 'OUT' });
                                      setQuickAssignStageId(stages[0]?.id || 'CD001');
                                    }
                                  }}
                                  className="h-7 px-2 rounded-md border border-dashed border-emerald-300 bg-white/80 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-400 text-[11px] font-semibold inline-flex items-center gap-0.5 transition-colors cursor-pointer shrink-0"
                                  title="Gán thêm công đoạn Đầu ra (OUT)"
                                >
                                  <span>+ Gán OUT</span>
                                </button>
                              </div>

                              {isQuickAssigningOut && (
                                <div className="p-1.5 bg-white border border-emerald-200 rounded-lg flex items-center gap-1.5 shadow-xs animate-in fade-in duration-150">
                                  <select
                                    value={quickAssignStageId}
                                    onChange={e => setQuickAssignStageId(e.target.value)}
                                    className="flex-1 min-w-0 h-7 px-2 border border-slate-200 rounded text-xs bg-white focus:outline-none focus:border-emerald-600"
                                  >
                                    {stages.map(st => (
                                      <option key={st.id} value={st.id}>
                                        [{st.id}] {st.name}
                                      </option>
                                    ))}
                                  </select>
                                  <button
                                    type="button"
                                    onClick={() => handleQuickAssignCellSubmit(p, 'OUT')}
                                    className="h-7 px-2.5 rounded bg-emerald-600 text-white text-[11px] font-semibold hover:bg-emerald-700 cursor-pointer shrink-0"
                                  >
                                    Lưu
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setQuickAssignCell(null)}
                                    className="h-7 px-2 rounded border border-slate-200 text-slate-500 hover:bg-slate-100 text-[11px] cursor-pointer shrink-0"
                                  >
                                    Đóng
                                  </button>
                                </div>
                              )}
                            </div>
                          </td>

                          {/* 5. Thao Tác */}
                          <td className="py-3 px-5 border-l border-slate-100 text-right whitespace-nowrap">
                            <div className="inline-flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => openEditModal(p)}
                                className="h-7.5 px-2.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:text-slate-900 hover:border-slate-300 hover:bg-slate-50 inline-flex items-center gap-1 text-xs font-medium transition-colors shrink-0 cursor-pointer"
                                title="Chỉnh sửa tên sản phẩm & phân bổ Đầu vào / Đầu ra"
                              >
                                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                </svg>
                                <span>Sửa</span>
                              </button>
                              <button
                                onClick={() => openDeleteModal(p)}
                                className="w-7.5 h-7.5 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-red-600 hover:bg-red-50 hover:border-red-200 flex items-center justify-center transition-colors shrink-0 cursor-pointer"
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
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* ========================================================= */
          /* CHẾ ĐỘ 2: THEO CÔNG ĐOẠN (ĐẦU VÀO IN / ĐẦU RA OUT)        */
          /* ========================================================= */
          <div className="flex flex-col gap-4">
            {visibleStagesForBoard.map(st => {
              const inProducts = products.filter(p => productService.isProductAssignedTo(p, st.id, 'IN'));
              const outProducts = products.filter(p => productService.isProductAssignedTo(p, st.id, 'OUT'));
              const availableForIn = products.filter(p => !productService.isProductAssignedTo(p, st.id, 'IN'));
              const availableForOut = products.filter(p => !productService.isProductAssignedTo(p, st.id, 'OUT'));

              return (
                <div
                  key={st.id}
                  className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden"
                >
                  {/* Header công đoạn */}
                  <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono font-bold text-xs text-[#DE4444] bg-red-50 border border-red-200 px-2.5 py-1 rounded-md">
                        {st.id}
                      </span>
                      <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                        {st.name}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-semibold">
                        Đầu vào (IN): {inProducts.length} SP
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
                        Đầu ra (OUT): {outProducts.length} SP
                      </span>
                    </div>
                  </div>

                  {/* 2 Cột: ĐẦU VÀO (IN) & ĐẦU RA (OUT) */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
                    {/* Cột 1: ĐẦU VÀO (IN) */}
                    <div className="p-4 flex flex-col justify-between gap-3 bg-blue-50/15">
                      <div>
                        <div className="flex items-center justify-between mb-2.5">
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 uppercase tracking-wider">
                            <span className="w-2 h-2 rounded-full bg-blue-600" />
                            ↓ Sản phẩm Đầu vào (IN)
                          </span>
                          <button
                            type="button"
                            onClick={() => openAddModal(st.id, 'IN')}
                            className="text-[11px] font-semibold text-blue-700 hover:underline cursor-pointer"
                          >
                            + Tạo SP mới vào Đầu vào
                          </button>
                        </div>

                        {inProducts.length === 0 ? (
                          <div className="p-4 rounded-lg border border-dashed border-slate-200 bg-white/80 text-center text-xs text-slate-400">
                            Chưa có sản phẩm đầu vào cho công đoạn này.
                          </div>
                        ) : (
                          <div className="flex flex-col gap-2">
                            {inProducts.map(p => (
                              <div
                                key={`${st.id}_IN_${p.id}`}
                                className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-white border border-blue-200/80 shadow-2xs"
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <span className="font-mono font-bold text-[11px] text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded shrink-0">
                                    {p.id}
                                  </span>
                                  <span className="font-semibold text-slate-900 text-xs truncate" title={p.name}>
                                    {p.name}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => openEditModal(p)}
                                    className="px-2 py-1 rounded border border-slate-200 text-[11px] text-slate-600 hover:bg-slate-100 cursor-pointer"
                                    title="Sửa tên sản phẩm / cấu hình"
                                  >
                                    Sửa
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleToggleAssignmentIO(p, st.id, 'IN')}
                                    className="px-2 py-1 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 text-[11px] font-semibold cursor-pointer"
                                    title="Chuyển sang Đầu ra (OUT)"
                                  >
                                    → OUT
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveAssignment(p, st.id, 'IN')}
                                    className="w-6 h-6 rounded border border-slate-200 text-slate-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center cursor-pointer"
                                    title="Gỡ khỏi Đầu vào công đoạn này"
                                  >
                                    ×
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Gán nhanh sản phẩm có sẵn vào Đầu vào */}
                      <div className="pt-2 border-t border-slate-200/70 flex items-center gap-2">
                        <select
                          value={boardSelectedProduct[`${st.id}_IN`] || ''}
                          onChange={e =>
                            setBoardSelectedProduct(prev => ({
                              ...prev,
                              [`${st.id}_IN`]: e.target.value
                            }))
                          }
                          className="flex-1 h-8.5 px-2.5 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:border-blue-600"
                        >
                          <option value="">-- Chọn sản phẩm có sẵn gán làm Đầu vào (IN) --</option>
                          {availableForIn.map(ap => (
                            <option key={ap.id} value={ap.id}>
                              [{ap.id}] {ap.name}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          disabled={!boardSelectedProduct[`${st.id}_IN`]}
                          onClick={() => handleBoardAssignExisting(st.id, 'IN')}
                          className="h-8.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-xs font-semibold cursor-pointer shrink-0"
                        >
                          Gán Đầu vào
                        </button>
                      </div>
                    </div>

                    {/* Cột 2: ĐẦU RA (OUT) */}
                    <div className="p-4 flex flex-col justify-between gap-3 bg-emerald-50/15">
                      <div>
                        <div className="flex items-center justify-between mb-2.5">
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 uppercase tracking-wider">
                            <span className="w-2 h-2 rounded-full bg-emerald-600" />
                            ↑ Sản phẩm Đầu ra (OUT)
                          </span>
                          <button
                            type="button"
                            onClick={() => openAddModal(st.id, 'OUT')}
                            className="text-[11px] font-semibold text-emerald-700 hover:underline cursor-pointer"
                          >
                            + Tạo SP mới vào Đầu ra
                          </button>
                        </div>

                        {outProducts.length === 0 ? (
                          <div className="p-4 rounded-lg border border-dashed border-slate-200 bg-white/80 text-center text-xs text-slate-400">
                            Chưa có sản phẩm đầu ra cho công đoạn này.
                          </div>
                        ) : (
                          <div className="flex flex-col gap-2">
                            {outProducts.map(p => (
                              <div
                                key={`${st.id}_OUT_${p.id}`}
                                className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-white border border-emerald-200/80 shadow-2xs"
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <span className="font-mono font-bold text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded shrink-0">
                                    {p.id}
                                  </span>
                                  <span className="font-semibold text-slate-900 text-xs truncate" title={p.name}>
                                    {p.name}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => openEditModal(p)}
                                    className="px-2 py-1 rounded border border-slate-200 text-[11px] text-slate-600 hover:bg-slate-100 cursor-pointer"
                                    title="Sửa tên sản phẩm / cấu hình"
                                  >
                                    Sửa
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleToggleAssignmentIO(p, st.id, 'OUT')}
                                    className="px-2 py-1 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[11px] font-semibold cursor-pointer"
                                    title="Chuyển sang Đầu vào (IN)"
                                  >
                                    ← IN
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveAssignment(p, st.id, 'OUT')}
                                    className="w-6 h-6 rounded border border-slate-200 text-slate-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center cursor-pointer"
                                    title="Gỡ khỏi Đầu ra công đoạn này"
                                  >
                                    ×
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Gán nhanh sản phẩm có sẵn vào Đầu ra */}
                      <div className="pt-2 border-t border-slate-200/70 flex items-center gap-2">
                        <select
                          value={boardSelectedProduct[`${st.id}_OUT`] || ''}
                          onChange={e =>
                            setBoardSelectedProduct(prev => ({
                              ...prev,
                              [`${st.id}_OUT`]: e.target.value
                            }))
                          }
                          className="flex-1 h-8.5 px-2.5 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:border-emerald-600"
                        >
                          <option value="">-- Chọn sản phẩm có sẵn gán làm Đầu ra (OUT) --</option>
                          {availableForOut.map(ap => (
                            <option key={ap.id} value={ap.id}>
                              [{ap.id}] {ap.name}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          disabled={!boardSelectedProduct[`${st.id}_OUT`]}
                          onClick={() => handleBoardAssignExisting(st.id, 'OUT')}
                          className="h-8.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white text-xs font-semibold cursor-pointer shrink-0"
                        >
                          Gán Đầu ra
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* ========================================================= */}
      {/* MODAL THÊM / CHỈNH SỬA SẢN PHẨM (2 CỘT IN / OUT RIÊNG)    */}
      {/* ========================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
            <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <svg className="w-5 h-5 text-[#DE4444]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                </svg>
                {editingProduct ? `Chỉnh sửa sản phẩm: ${editingProduct.id}` : 'Thêm sản phẩm mới'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-7 h-7 rounded-md flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-5 flex flex-col gap-4 text-xs overflow-y-auto">
                {/* 1. Mã Sản Phẩm & Tên Sản Phẩm */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
                      placeholder="VD: SP-01, TOM001..."
                      className="w-full h-9.5 px-3 font-mono font-bold text-slate-900 border border-slate-200 rounded-lg focus:outline-none focus:border-[#DE4444] read-only:bg-slate-100 read-only:text-slate-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-slate-700 mb-1.5">
                      Tên Sản Phẩm (Product Name) <span className="text-[#DE4444]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formName}
                      onChange={e => setFormName(e.target.value)}
                      placeholder="Ví dụ: Tôm tươi sống, Tôm HLSO, Tôm thịt PD..."
                      className="w-full h-9.5 px-3 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:border-[#DE4444]"
                    />
                  </div>
                </div>

                {/* 2. Tách 2 cột riêng biệt: ĐẦU VÀO (IN) và ĐẦU RA (OUT) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Khung bên trái: Cột Đầu Vào (IN) */}
                  <div className="bg-blue-50/40 border border-blue-200 rounded-xl p-3.5 flex flex-col justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-1.5 font-bold text-blue-800 text-xs mb-1">
                        <span className="w-2 h-2 rounded-full bg-blue-600" />
                        <span>↓ Cột Đầu Vào (IN)</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mb-2.5">
                        Các công đoạn nhận sản phẩm này ở <strong>Đầu vào</strong>:
                      </p>

                      {formInStages.length === 0 ? (
                        <div className="p-3 bg-white/80 border border-dashed border-blue-200 rounded-lg text-center text-slate-400 text-[11px]">
                          Chưa gán công đoạn Đầu vào (IN)
                        </div>
                      ) : (
                        <div className="flex flex-col gap-1.5">
                          {formInStages.map(stId => (
                            <div
                              key={`modal_in_${stId}`}
                              className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg bg-white border border-blue-200 text-xs"
                            >
                              <div className="truncate">
                                <span className="font-mono font-bold text-blue-700 mr-1">[{stId}]</span>
                                <span className="font-medium text-slate-800">{getStageName(stId)}</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => setFormInStages(prev => prev.filter(x => x !== stId))}
                                className="w-5 h-5 rounded-full text-slate-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center cursor-pointer shrink-0"
                                title="Gỡ công đoạn này"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="pt-2 border-t border-blue-200/60 flex items-center gap-1.5">
                      <select
                        value={modalPickInStage}
                        onChange={e => setModalPickInStage(e.target.value)}
                        className="flex-1 min-w-0 h-8.5 px-2 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:border-blue-600"
                      >
                        {stages.map(st => (
                          <option key={st.id} value={st.id}>
                            [{st.id}] {st.name}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => {
                          if (!formInStages.includes(modalPickInStage)) {
                            setFormInStages(prev => [...prev, modalPickInStage]);
                          }
                        }}
                        className="h-8.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold cursor-pointer shrink-0"
                      >
                        + Thêm IN
                      </button>
                    </div>
                  </div>

                  {/* Khung bên phải: Cột Đầu Ra (OUT) */}
                  <div className="bg-emerald-50/40 border border-emerald-200 rounded-xl p-3.5 flex flex-col justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-1.5 font-bold text-emerald-800 text-xs mb-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-600" />
                        <span>↑ Cột Đầu Ra (OUT)</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mb-2.5">
                        Các công đoạn xuất sản phẩm này ở <strong>Đầu ra</strong>:
                      </p>

                      {formOutStages.length === 0 ? (
                        <div className="p-3 bg-white/80 border border-dashed border-emerald-200 rounded-lg text-center text-slate-400 text-[11px]">
                          Chưa gán công đoạn Đầu ra (OUT)
                        </div>
                      ) : (
                        <div className="flex flex-col gap-1.5">
                          {formOutStages.map(stId => (
                            <div
                              key={`modal_out_${stId}`}
                              className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg bg-white border border-emerald-200 text-xs"
                            >
                              <div className="truncate">
                                <span className="font-mono font-bold text-emerald-700 mr-1">[{stId}]</span>
                                <span className="font-medium text-slate-800">{getStageName(stId)}</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => setFormOutStages(prev => prev.filter(x => x !== stId))}
                                className="w-5 h-5 rounded-full text-slate-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center cursor-pointer shrink-0"
                                title="Gỡ công đoạn này"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="pt-2 border-t border-emerald-200/60 flex items-center gap-1.5">
                      <select
                        value={modalPickOutStage}
                        onChange={e => setModalPickOutStage(e.target.value)}
                        className="flex-1 min-w-0 h-8.5 px-2 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:border-emerald-600"
                      >
                        {stages.map(st => (
                          <option key={st.id} value={st.id}>
                            [{st.id}] {st.name}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => {
                          if (!formOutStages.includes(modalPickOutStage)) {
                            setFormOutStages(prev => [...prev, modalPickOutStage]);
                          }
                        }}
                        className="h-8.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold cursor-pointer shrink-0"
                      >
                        + Thêm OUT
                      </button>
                    </div>
                  </div>
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
                  {editingProduct ? 'Lưu cập nhật' : 'Thêm sản phẩm'}
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
                Bạn có chắc chắn muốn xoá sản phẩm{' '}
                <strong className="text-slate-800">"{deletingProduct.name}"</strong> ({deletingProduct.id})? Thao tác này không thể hoàn tác.
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
