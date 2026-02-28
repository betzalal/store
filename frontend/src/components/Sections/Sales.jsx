import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
    ShoppingCart, Plus, Minus, X,
    CreditCard, User, Banknote, QrCode, Phone, Truck,
    ChevronRight, Printer, AlertTriangle, Store, Package, Search, Landmark, Edit, Grid,
    LogOut, Database, FileText, Download, Tag
} from 'lucide-react';
import autoTable from 'jspdf-autotable';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

const Sales = () => {
    const { activeStore, isEmpresaMode, selectStore } = useStore();
    const { currentUser, logout } = useAuth();
    // Core State
    const [products, setProducts] = useState([]);
    const [stores, setStores] = useState([]);
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(false);
    const [config, setConfig] = useState(null);
    const [isFastSale, setIsFastSale] = useState(false);

    // UI State
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [showVendorReport, setShowVendorReport] = useState(false);
    const [vendorSales, setVendorSales] = useState([]);
    const [lastSale, setLastSale] = useState(null);
    const [autoPrint, setAutoPrint] = useState(false);
    const [editingQtyId, setEditingQtyId] = useState(null);
    const receiptRef = useRef(null);

    // Category Customization State
    const [customIcons, setCustomIcons] = useState({});
    const [editingCategory, setEditingCategory] = useState(null);
    const [showIconPicker, setShowIconPicker] = useState(false);
    const hoverTimerRef = useRef(null);

    // Checkout Form State
    const [checkoutData, setCheckoutData] = useState({
        customerName: '',
        customerNit: '',
        customerPhone: '',
        couponCode: '',
        discountAmount: 0
    });
    const [couponInput, setCouponInput] = useState('');
    const [couponMessage, setCouponMessage] = useState({ type: '', text: '' });

    // --- EFFECTS ---

    useEffect(() => {
        if (!activeStore && !isEmpresaMode) return;
        fetchProducts();

        if (currentUser?.role === 'admin') {
            fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/stores`)
                .then(res => res.json())
                .then(setStores)
                .catch(err => console.error("Error fetching stores:", err));
        }

        fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/setup/status`)
            .then(res => res.json())
            .then(data => {
                if (data.config) {
                    setConfig(data.config);
                    if (data.config.categoryIcons) {
                        try {
                            setCustomIcons(JSON.parse(data.config.categoryIcons));
                        } catch (e) {
                            console.error("Error parsing category icons", e);
                        }
                    }
                }
            })
            .catch(err => console.error("Config fetch failed", err));

        const savedFastSale = localStorage.getItem('fastSale');
        if (savedFastSale === 'true') {
            setIsFastSale(true);
        }
    }, [activeStore, isEmpresaMode]);

    // Handle Fast Sale Toggle Storage Sync
    useEffect(() => {
        const handleStorageChange = () => {
            const savedFastSale = localStorage.getItem('fastSale');
            setIsFastSale(savedFastSale === 'true');
        };
        window.addEventListener('storage', handleStorageChange);

        // Also poll just in case because local storage events don't fire on the same tab
        const interval = setInterval(() => {
            const savedFastSale = localStorage.getItem('fastSale');
            if ((savedFastSale === 'true') !== isFastSale) {
                setIsFastSale(savedFastSale === 'true');
            }
        }, 2000);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            clearInterval(interval);
        };
    }, [isFastSale]);

    useEffect(() => {
        if (lastSale && receiptRef.current) {
            setTimeout(() => {
                receiptRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
        }
    }, [lastSale]);

    const fetchProducts = () => {
        const storeId = (!isEmpresaMode && activeStore) ? activeStore.id : '';
        fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/inventory?storeId=${storeId}`)
            .then(res => res.json())
            .then(data => setProducts(data))
            .catch(err => console.error("Error fetching products:", err));
    };

    // --- DERIVED STATE ---

    const categories = useMemo(() => {
        const cats = ['All'];
        products.forEach(p => {
            if (p.category && !cats.includes(p.category)) cats.push(p.category);
        });
        return cats;
    }, [products]);

    const getCategoryIcon = (category, index) => {
        if (category === 'All') return null;
        // 1. Check custom icons first
        if (customIcons[category]) return customIcons[category];

        // 2. Fallback to algorithm
        const iconIndex = (category.length * 7 + index) % 200 + 1;
        return `/icons/CUTE PACK 2024 (${iconIndex}).ico`;
    };

    const formatCategoryName = (name) => {
        if (name === 'All') return 'Todos';
        return name.replace(/Producto/gi, '').trim();
    };

    const filteredProducts = useMemo(() => {
        return products.filter(p => {
            const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.code.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
            return matchesSearch && matchesCategory;
        });
    }, [products, searchTerm, selectedCategory]);

    const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const finalTotal = Math.max(0, cartTotal - (parseFloat(checkoutData.discountAmount) || 0));

    const inventoryAlerts = useMemo(() => {
        const lowStock = products.filter(p => p.stock <= 5).length;
        const outOfStock = products.filter(p => p.stock === 0).length;
        return { lowStock, outOfStock };
    }, [products]);

    // --- HANDLERS ---

    const fetchVendorSales = async () => {
        if (!activeStore) return;
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/products/activities?storeId=${activeStore.id}`);
            if (res.ok) {
                const activities = await res.json();
                setVendorSales(activities.filter(a => a.type === 'sale'));
                setShowVendorReport(true);
            }
        } catch (error) {
            console.error('Error fetching vendor sales', error);
        }
    };

    const exportVendorSalesPDF = () => {
        const doc = new jsPDF();
        doc.text(`Reporte de Ventas - ${activeStore?.name || 'Tienda'}`, 14, 15);

        const data = vendorSales.map(s => [
            new Date(s.rawDate).toLocaleString(),
            s.product,
            s.quantity,
            `Bs ${s.total?.toFixed(2) || '0.00'}`,
            s.user || 'Sistema',
            s.status
        ]);

        autoTable(doc, {
            startY: 20,
            head: [['Fecha', 'Producto', 'Cant.', 'Monto', 'Vendedor', 'Método']],
            body: data,
            theme: 'grid',
            headStyles: { fillColor: [37, 99, 235] }
        });
        doc.save(`reporte_ventas_${activeStore?.name?.replace(/ /g, '_')}.pdf`);
    };

    // Icon Customization Handlers
    const handleCategoryMouseEnter = (cat) => {
        if (cat === 'All') return;
        hoverTimerRef.current = setTimeout(() => {
            setEditingCategory(cat);
            setShowIconPicker(true);
        }, 10000); // 10 seconds
    };

    const handleCategoryMouseLeave = () => {
        if (hoverTimerRef.current) {
            clearTimeout(hoverTimerRef.current);
            hoverTimerRef.current = null;
        }
    };

    const handleIconSelect = async (iconUrl) => {
        const newIcons = { ...customIcons, [editingCategory]: iconUrl };
        setCustomIcons(newIcons);
        setShowIconPicker(false);
        setEditingCategory(null);

        // Persist to backend
        try {
            await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/setup/config`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ categoryIcons: newIcons })
            });
        } catch (err) {
            console.error("Failed to save icons", err);
        }
    };

    const addToCart = (product) => {
        setCart(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                return prev.map(item =>
                    item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            }
            return [...prev, { ...product, quantity: 1, originalPrice: product.price }];
        });
    };

    const updateQuantity = (id, value) => {
        const newQty = parseFloat(value);
        if (isNaN(newQty) || newQty < 0.1) return;
        setCart(prev => prev.map(item => item.id === id ? { ...item, quantity: newQty } : item));
    };

    const handleQtyInputBlur = (id, e) => {
        const val = parseFloat(e.target.value);
        if (!isNaN(val) && val > 0) {
            updateQuantity(id, val);
        }
        setEditingQtyId(null);
    };

    const removeFromCart = (id) => {
        setCart(prev => prev.filter(item => item.id !== id));
    };

    const handleApplyCoupon = async () => {
        if (!couponInput.trim()) return;
        setCouponMessage({ type: 'loading', text: 'Validando código...' });
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/promo/validate?code=${couponInput}&storeId=${activeStore?.id || ''}`);
            const data = await res.json();

            if (!res.ok || !data.valid) {
                setCouponMessage({ type: 'error', text: data.message || 'Cupón inválido' });
                setCheckoutData({ ...checkoutData, couponCode: '', discountAmount: 0 });
                return;
            }

            // Calculate discount
            let calculatedDiscount = 0;
            const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

            if (data.productIds && data.productIds.length > 0) {
                // Apply ONLY to specific items
                const eligibleSubtotal = cart
                    .filter(item => data.productIds.includes(item.id.toString()))
                    .reduce((sum, item) => sum + (item.price * item.quantity), 0);

                if (eligibleSubtotal === 0) {
                    setCouponMessage({ type: 'error', text: 'El cupón no aplica a los productos en el carrito' });
                    return;
                }

                if (data.discountType === 'percentage') {
                    calculatedDiscount = eligibleSubtotal * (data.discountValue / 100);
                } else {
                    calculatedDiscount = Math.min(data.discountValue, eligibleSubtotal);
                }
            } else {
                // Apply to entire cart
                if (data.discountType === 'percentage') {
                    calculatedDiscount = subtotal * (data.discountValue / 100);
                } else {
                    calculatedDiscount = Math.min(data.discountValue, subtotal);
                }
            }

            setCheckoutData({
                ...checkoutData,
                couponCode: couponInput.toUpperCase(),
                discountAmount: calculatedDiscount
            });
            setCouponMessage({ type: 'success', text: `¡Cupón aplicado! - Bs ${calculatedDiscount.toFixed(2)}` });

        } catch (error) {
            setCouponMessage({ type: 'error', text: 'Error al conectar' });
        }
    };

    // Convert number to literal (es-BO)
    const numberToWords = (num) => {
        const unidades = ["", "UN", "DOS", "TRES", "CUATRO", "CINCO", "SEIS", "SIETE", "OCHO", "NUEVE"];
        const decenas = ["", "DIEZ", "VEINTE", "TREINTA", "CUARENTA", "CINCUENTA", "SESENTA", "SETENTA", "OCHENTA", "NOVENTA"];
        const especiales = {
            11: "ONCE", 12: "DOCE", 13: "TRECE", 14: "CATORCE", 15: "QUINCE",
            16: "DIECISEIS", 17: "DIECISIETE", 18: "DIECIOCHO", 19: "DIECINUEVE",
            21: "VEINTIUN", 22: "VEINTIDOS", 23: "VEINTITRES", 24: "VEINTICUATRO",
            25: "VEINTICINCO", 26: "VEINTISEIS", 27: "VEINTISIETE", 28: "VEINTIOCHO", 29: "VEINTINUEVE"
        };
        const centenas = ["", "CIENTO", "DOSCIENTOS", "TRESCIENTOS", "CUATROCIENTOS", "QUINIENTOS", "SEISCIENTOS", "SETECIENTOS", "OCHOCIENTOS", "NOVECIENTOS"];

        if (num === 0) return "CERO";
        if (num === 100) return "CIEN";

        let str = "";
        let c = Math.floor(num / 100);
        let d = Math.floor((num % 100) / 10);
        let u = num % 10;
        let p = num % 100;

        if (c > 0) str += centenas[c] + " ";

        if (especiales[p]) {
            str += especiales[p];
        } else {
            if (d > 0) str += decenas[d] + (u > 0 && d > 2 ? " Y " : "");
            if (u > 0 && d !== 1 && d !== 2) str += unidades[u];
        }

        // Handle miles (up to 9999 for this scope)
        if (num >= 1000) {
            let m = Math.floor(num / 1000);
            let rest = num % 1000;
            let mStr = m === 1 ? "MIL " : numberToWords(m) + " MIL ";
            return mStr + (rest > 0 ? numberToWords(rest) : "");
        }

        return str.trim();
    };

    const printReceipt = (data) => {
        const totalInt = Math.floor(data.total);
        const totalDec = Math.round((data.total - totalInt) * 100).toString().padStart(2, '0');
        const literalTotal = `${numberToWords(totalInt)} ${totalDec}/100 BOLIVIANOS`;

        const getReceiptHTML = () => {
            let itemsHtml = '';
            cart.forEach(item => {
                const totalItem = (item.price * item.quantity).toFixed(2);
                itemsHtml += `
                    <tr>
                        <td class="left">${item.quantity}</td>
                        <td class="left">${item.name}</td>
                        <td class="right">${totalItem}</td>
                    </tr>
                `;
            });

            const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2);

            let html = `
            <!DOCTYPE html>
            <html>
                <head>
                    <title>Recibo</title>
                    <style>
                        body {
                            margin: 0;
                            padding: 0;
                            font-family: monospace;
                            font-size: 11px;
                            color: #000;
                            width: 100%;
                        }
                        .ticket {
                            width: 58mm;
                            margin: 0 auto;
                        }
                        .center { text-align: center; }
                        .left { text-align: left; }
                        .right { text-align: right; }
                        .bold { font-weight: bold; }
                        .line { border-top: 1px dashed black; margin: 4px 0; }
                        
                        table { width: 100%; border-collapse: collapse; }
                        td { padding: 2px 0; vertical-align: top; }
                        
                        .header { margin-bottom: 8px; }
                        .header h2 { margin: 0; font-size: 16px; }
                        .header p { margin: 2px 0; }
                        
                        .footer { margin-top: 10px; font-size: 10px; }
                        .footer p { margin: 2px 0; }
                    </style>
                </head>
                <body>
                    <div class="ticket">
                        <!-- Cabecera -->
                        <div class="header center">
                            <h2>${config?.companyName || 'Mi Empresa'}</h2>
                            <p class="bold">${config?.slogan || 'Slogan'}</p>
                            <p>NIT: ${config?.nit || '000000000'}</p>
                            <p>---------------------------------</p>
                            <p>${data.date}</p>
                            <p>${data.store}</p>
                            <p class="bold">PEDIDO #${data.id}</p>
                        </div>

                        <!-- Detalles de Cliente -->
                        <div class="left">
                            <p style="margin:2px 0;">Cliente: ${data.customer}</p>
                            ${data.customerNit ? `<p style="margin:2px 0;">NIT/CI: ${data.customerNit}</p>` : ''}
                            ${data.orderType !== 'En Tienda' ? `<p style="margin:2px 0;" class="bold">TIPO: ${data.orderType}</p>` : ''}
                        </div>

                        <div class="line"></div>

                        <!-- Items -->
                        <table>
                            <thead>
                                <tr>
                                    <th class="left">Cant</th>
                                    <th class="left">Producto</th>
                                    <th class="right">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${itemsHtml}
                            </tbody>
                        </table>

                        <div class="line"></div>

                        <!-- Totales -->
                         <table style="margin-top:4px;">
                            <tr>
                                <td class="left bold">Subtotal:</td>
                                <td class="right">Bs ${subtotal}</td>
                            </tr>
                            ${data.discount > 0 ? `
                            <tr>
                                <td class="left">Descuento:</td>
                                <td class="right">-Bs ${parseFloat(data.discount).toFixed(2)}</td>
                            </tr>
                            ${data.couponCode ? `
                            <tr>
                                <td class="left" colspan="2" style="font-size:9px;">(Cupón: ${data.couponCode})</td>
                            </tr>` : ''}
                            ` : ''}
                            <tr>
                                <td class="left bold" style="font-size: 14px; padding-top:4px;">TOTAL:</td>
                                <td class="right bold" style="font-size: 14px; padding-top:4px;">Bs ${parseFloat(data.total).toFixed(2)}</td>
                            </tr>
                        </table>

                        <div class="left" style="margin-top: 6px;">
                            <p style="margin:0;">Metodo: ${data.paymentMethod}</p>
                            <p style="margin:2px 0;">Son: ${literalTotal}</p>
                        </div>

                        <div class="line"></div>

                        <!-- Pie de Ticket -->
                        <div class="footer center">
                            <p>Le Atendió: ${data.user}</p>
                            <p class="bold" style="margin-top:6px;">¡Gracias por su compra!</p>
                            <p style="margin-top:6px;">Visita nuestras otras tiendas:</p>
                            ${stores.filter(s => s.id !== data.storeId).map(s => `<p>${s.name}</p>`).join('')}
                        </div>
                    </div>
                    <script>
                        window.onload = () => {
                            window.print();
                            window.onafterprint = () => window.close();
                        };
                    </script>
                </body>
            </html>
            `;
            return html;
        };

        const printWindow = window.open('', '_blank', 'width=400,height=600');
        if (printWindow) {
            printWindow.document.open();
            printWindow.document.write(getReceiptHTML());
            printWindow.document.close();
        } else {
            alert('Por favor, permite las ventanas emergentes (pop-ups) para imprimir recibos.');
        }
    };

    const handleCheckout = async (fastCheckout = false) => {
        if (!activeStore) return alert('Seleccione una sucursal');
        if (cart.length === 0) return;

        setLoading(true);

        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const finalTotalStr = (subtotal - (checkoutData.discountAmount || 0)).toFixed(2);

        const payload = {
            storeId: activeStore.id,
            total: finalTotalStr,
            items: cart.map(i => ({ id: i.id, quantity: i.quantity, price: i.price })),
            customerName: checkoutData.customerName || 'Cliente General',
            customerNit: checkoutData.customerNit,
            customerWhatsapp: checkoutData.customerPhone,
            orderType: checkoutData.deliveryType,
            paymentMethod: checkoutData.paymentMethod,
            couponCode: checkoutData.couponCode,
            discount: checkoutData.discountAmount,
            userId: currentUser?.id
        };
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/sales`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                const saleData = await res.json();
                setLastSale({
                    ...saleData,
                    items: cart,
                    total: parseFloat(finalTotalStr),
                    date: new Date().toLocaleString(),
                    customerPhone: checkoutData.customerPhone,
                    deliveryType: checkoutData.deliveryType,
                    paymentMethod: checkoutData.paymentMethod
                });

                if (autoPrint && !fastCheckout) {
                    setTimeout(() => window.print(), 500);
                }

                if (!fastCheckout) {
                    printReceipt({
                        id: saleData.id,
                        total: parseFloat(finalTotalStr),
                        orderType: checkoutData.deliveryType,
                        paymentMethod: checkoutData.paymentMethod,
                        customer: checkoutData.customerName || 'Cliente General',
                        store: activeStore?.name,
                        user: currentUser?.username,
                        date: new Date().toLocaleString('es-ES'),
                        couponCode: checkoutData.couponCode,
                        discount: checkoutData.discountAmount
                    });
                }

                setCart([]);
                setCheckoutData({ deliveryType: 'En Tienda', paymentMethod: 'Cash', customerName: '', customerNit: '', customerPhone: '', couponCode: '', discountAmount: 0 });
                setCouponInput('');
                setCouponMessage({ type: '', text: '' });
                setIsCheckoutOpen(false);

                fetchProducts();
            } else {
                console.error('Error processing sale');
            }
        } catch (error) {
            console.error("Checkout error:", error);
        } finally {
            setLoading(false);
        }
    };

    const getTrafficLight = () => {
        if (inventoryAlerts.outOfStock > 0) return 'bg-red-500';
        if (inventoryAlerts.lowStock > 0) return 'bg-yellow-500';
        return 'bg-emerald-500';
    };

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Enter' && isFastSale && cart.length > 0 && !isCheckoutOpen) {
                // Ignore if we are typing in an input field (like search or qty)
                if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                    // Only prevent if it's the search bar, allow Enter on Qty fields to close them and we don't accidentally checkout
                    if (e.target.placeholder === "Buscar productos...") return;
                    if (e.target.tagName === 'INPUT') return;
                }

                handleCheckout(true);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isFastSale, cart, isCheckoutOpen, activeStore, checkoutData]);

    const bgUrl = config?.backgroundUrl
        ? (config.backgroundUrl.startsWith('/uploads') ? `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}${config.backgroundUrl}` : config.backgroundUrl)
        : 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2940&auto=format&fit=crop';

    return (
        <>
            {/* PRINTABLE RECEIPT (Hidden on Screen) */}
            <div className="hidden print:block font-mono text-black bg-white print:w-full">
                <style>
                    {`
                        @media print {
                            @page { size: 80mm auto; margin: 0mm; }
                            body { margin: 0; padding: 0; }
                            /* Hide browser default header/footer if supported by browser settings, 
                               but @page margin 0 usually handles it */
                        }
                    `}
                </style>
                {lastSale && (
                    <div className="w-[80mm] max-w-full mx-auto text-[10px] leading-tight pt-2 px-1 pb-10">
                        <div className="text-center mb-2">
                            {config?.logoUrl && <img src={`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}${config.logoUrl}`} alt="Logo" className="w-10 h-10 object-contain mx-auto mb-1 grayscale" />}
                            <h1 className="font-bold text-sm uppercase">{config?.companyName || 'Mi Empresa'}</h1>
                            <p className="text-[9px]">NIT: {config?.nit || '000000000'}</p>
                            <p className="text-[9px]">{activeStore?.name || 'Tienda Principal'}</p>
                            <p className="text-[9px]">{lastSale.date}</p>
                            <p className="mt-1 font-bold">Venta #{lastSale.id}</p>
                        </div>

                        <div className="border-t border-b border-black border-dashed py-1 mb-2">
                            <p><strong>Cli:</strong> <span className="uppercase">{lastSale.customerName || 'S/N'}</span></p>
                            <p><strong>NIT:</strong> {lastSale.customerNit || '0'}</p>
                            {lastSale.customerPhone && <p><strong>Tel:</strong> {lastSale.customerPhone}</p>}
                            <p><strong>Ent:</strong> {lastSale.deliveryType}</p>
                        </div>

                        <table className="w-full mb-2 border-collapse">
                            <thead>
                                <tr className="border-b border-black text-left text-[9px]">
                                    <th className="py-0.5 w-[10%]">Cant</th>
                                    <th className="py-0.5 w-[60%]">Detalle</th>
                                    <th className="py-0.5 w-[30%] text-right">Subt.</th>
                                </tr>
                            </thead>
                            <tbody className="text-[9px]">
                                {lastSale.items && lastSale.items.map((item, i) => (
                                    <tr key={i}>
                                        <td className="py-0.5 align-top text-center">{item.quantity}</td>
                                        <td className="py-0.5 align-top truncate max-w-[40mm]">{item.name}</td>
                                        <td className="py-0.5 align-top text-right">${(item.price * item.quantity).toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <div className="border-t border-black border-dashed pt-1 mb-4">
                            <div className="flex justify-between font-bold text-xs">
                                <span>TOTAL</span>
                                <span>${lastSale.total.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-[9px] mt-0.5">
                                <span>Pago:</span>
                                <span>{lastSale.paymentMethod === 'Cash' ? 'Efectivo' : lastSale.paymentMethod === 'Deposit' ? 'Depósito' : 'QR'}</span>
                            </div>
                        </div>

                        <div className="text-center text-[8px] mt-4">
                            <p>¡Gracias por su compra!</p>
                            <p className="mt-1 italic">"{config?.slogan || 'Slogan'}"</p>
                        </div>
                    </div>
                )}
            </div>

            {/* SCREEN UI (Hidden on Print) */}
            <div className="h-screen w-screen bg-transparent overflow-hidden flex font-sans text-gray-900 dark:text-white relative print:hidden">

                {/* LEFT PANEL: MARKETPLACE (65%) */}
                <div className="w-full lg:w-[65%] h-full flex flex-col p-4 md:p-6 relative z-10 overflow-hidden">

                    {/* 1. HEADER */}
                    <header className="flex justify-between items-center mb-4">
                        <div className="flex flex-col">
                            <Link to="/" className="group flex items-center gap-3 hover:opacity-80 transition-opacity">
                                <div className="w-8 h-8 bg-white/10 backdrop-blur-md rounded-lg flex items-center justify-center border border-white/20 shadow-md">
                                    {config?.logoUrl ? (
                                        <img src={`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}${config.logoUrl}`} alt="Logo" className="w-5 h-5 object-contain" />
                                    ) : (
                                        <Store className="w-4 h-4 text-white" />
                                    )}
                                </div>
                                <div>
                                    <h1 className="text-base font-black tracking-tighter leading-none text-gray-900 dark:text-white">
                                        {config?.companyName || 'POS System'}
                                    </h1>
                                </div>
                            </Link>
                            {currentUser?.role === 'admin' && stores.length > 0 ? (
                                <select
                                    value={activeStore?.id || ''}
                                    onChange={(e) => {
                                        const store = stores.find(s => s.id === parseInt(e.target.value));
                                        if (store) selectStore(store);
                                    }}
                                    className="mt-1 ml-11 text-[8px] bg-transparent border-none font-bold text-blue-500 hover:text-blue-600 uppercase tracking-[0.2em] outline-none cursor-pointer p-0 appearance-none"
                                >
                                    {stores.map(store => (
                                        <option key={store.id} value={store.id} className="text-gray-900 dark:bg-gray-800">
                                            {store.name} ▾
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <p className="mt-1 lg:ml-11 text-[8px] font-bold text-gray-500 uppercase tracking-[0.2em]">
                                    {activeStore?.name || 'Tienda Principal'}
                                </p>
                            )}
                        </div>

                        <div className="flex items-center gap-3">
                            {currentUser?.role === 'admin' ? (
                                <Link to="/memory" className="px-3 py-1.5 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-xl text-xs font-bold text-gray-900 dark:text-white transition-all flex items-center gap-2 border border-black/10 dark:border-white/20 shadow-sm">
                                    <Database className="w-4 h-4" />
                                    <span className="hidden sm:inline">Memorias</span>
                                </Link>
                            ) : (
                                <button onClick={fetchVendorSales} className="px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 backdrop-blur-md rounded-xl text-xs font-bold text-blue-600 dark:text-blue-400 transition-all flex items-center gap-2 border border-blue-500/20 shadow-sm">
                                    <FileText className="w-4 h-4" />
                                    <span className="hidden sm:inline">Reporte Tienda</span>
                                </button>
                            )}
                            <button onClick={logout} className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 backdrop-blur-md rounded-xl text-xs font-bold text-red-600 dark:text-red-400 transition-all flex items-center gap-2 border border-red-500/20 shadow-sm">
                                <LogOut className="w-4 h-4" />
                                <span className="hidden sm:inline">Salir</span>
                            </button>
                            <button onClick={() => setIsCartOpen(true)} className="lg:hidden relative px-3 py-1.5 bg-green-500/10 hover:bg-green-500/20 backdrop-blur-md rounded-xl text-xs font-bold text-green-600 dark:text-green-400 transition-all flex items-center justify-center border border-green-500/20 shadow-sm">
                                <ShoppingCart className="w-4 h-4" />
                                {cart.length > 0 && <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white font-bold shadow-md">{cart.length}</span>}
                            </button>
                        </div>
                    </header>

                    {/* 2. HERO SECTION */}
                    <div className="flex flex-col items-center justify-center mb-6 text-center space-y-3">
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-1"
                        >
                            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-blue-500">
                                {config?.companyName || 'Bienvenido'}
                            </p>
                            <h2 className="text-xl md:text-2xl font-black italic tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent max-w-lg leading-tight">
                                "Los buenos vendedores son los que cuentan historias"
                            </h2>
                        </motion.div>

                        <div className="relative group w-full max-w-md">
                            <div className="absolute inset-0 bg-blue-500/10 blur-xl rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
                            <input
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Buscar productos..."
                                className="relative w-full bg-white dark:bg-white/10 backdrop-blur-xl border border-gray-200 dark:border-white/10 focus:border-blue-500 rounded-full py-2.5 pl-5 pr-10 outline-none font-bold text-sm shadow-lg transition-all"
                                autoFocus
                            />
                            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center shadow-md">
                                <Search className="w-3.5 h-3.5 text-white" />
                            </div>
                        </div>
                    </div>

                    {/* 3. CATEGORIES */}
                    <div className="mb-4 flex justify-center">
                        <div className="flex gap-3 overflow-x-auto pb-4 pt-2 px-4 no-scrollbar perspective-1000 max-w-full">
                            {categories.map((cat, idx) => (
                                <motion.button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    // HOVER LOGIC FOR ICON CUSTOMIZATION
                                    onMouseEnter={() => handleCategoryMouseEnter(cat)}
                                    onMouseLeave={handleCategoryMouseLeave}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: idx * 0.05 }}
                                    whileHover={{ scale: 1.05, rotate: 2 }}
                                    whileTap={{ scale: 0.95 }}
                                    className={`
                                        w-20 h-20 flex-shrink-0 rounded-[1.2rem] flex flex-col items-center justify-center gap-1.5 relative transition-all duration-300 shadow-md group
                                        ${selectedCategory === cat
                                            ? 'bg-blue-600 text-white shadow-blue-500/40 translate-y-[-3px]'
                                            : 'bg-white dark:bg-dark-card text-gray-500 dark:text-gray-400 hover:shadow-lg hover:bg-gray-50 dark:hover:bg-[#2e3e54]'}
                                    `}
                                >
                                    {cat === 'All' ? (
                                        <Store className={`w-6 h-6 ${selectedCategory === cat ? 'text-white' : 'text-gray-400'}`} />
                                    ) : (
                                        <img
                                            src={getCategoryIcon(cat, idx)}
                                            onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block' }}
                                            className="w-8 h-8 object-contain drop-shadow-sm group-hover:scale-110 transition-transform"
                                            alt={cat}
                                        />
                                    )}
                                    <Package className="w-6 h-6 hidden" />

                                    {/* RENAMED: Remove 'Producto' */}
                                    <span className={`text-[8px] font-black uppercase tracking-wider truncate max-w-[90%] ${selectedCategory === cat ? 'text-blue-100' : ''}`}>
                                        {formatCategoryName(cat)}
                                    </span>
                                </motion.button>
                            ))}
                        </div>
                    </div>

                    {/* Product Grid */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 rounded-3xl">
                        <div className="grid grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 pb-20">
                            <AnimatePresence>
                                {filteredProducts.map((product) => (
                                    <motion.div
                                        key={product.id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        onClick={() => addToCart(product)}
                                        className="group bg-white dark:bg-dark-card rounded-[1.2rem] p-2 cursor-pointer border border-transparent hover:border-blue-500/30 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 relative overflow-hidden flex flex-col"
                                    >
                                        <div className="aspect-[4/3] rounded-[0.8rem] bg-gray-100 dark:bg-black/20 mb-2 overflow-hidden relative">
                                            {product.imageUrl ? (
                                                <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                    <Package className="w-5 h-5 opacity-50" />
                                                </div>
                                            )}

                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                <div className="bg-white text-black rounded-full p-1.5 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                                    <Plus className="w-3.5 h-3.5" />
                                                </div>
                                            </div>

                                            <div className={`absolute top-1 right-1 px-1.5 py-0.5 rounded-md text-xs font-black backdrop-blur-md shadow-sm ${product.stock > 10 ? 'bg-emerald-500/90 text-white' : product.stock > 0 ? 'bg-yellow-500/90 text-white' : 'bg-red-500/90 text-white'}`}>
                                                {product.stock}
                                            </div>
                                        </div>

                                        <div className="px-1 flex-1 flex flex-col justify-between">
                                            <h3 className="font-bold text-[10px] leading-tight line-clamp-2 mb-1 h-7">{product.name}</h3>
                                            <div className="flex items-center justify-between">
                                                <span className="text-[8px] text-gray-400 font-bold max-w-[50%] truncate">{product.code}</span>
                                                <span className="text-sm font-black text-blue-600 dark:text-blue-400">${product.price}</span>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>

                {/* RIGHT PANEL: CART & OPERATIONS (35%) */}
                {/* Mobile Cart Overlay */}
                {isCartOpen && (
                    <div
                        className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[40]"
                        onClick={() => setIsCartOpen(false)}
                    />
                )}
                <div className={`fixed lg:relative inset-y-0 right-0 w-full sm:w-96 lg:w-[35%] h-full bg-white/95 dark:bg-dark-bg/95 backdrop-blur-3xl border-l border-white/20 z-[50] lg:z-20 flex flex-col shadow-2xl transition-transform duration-300 ${isCartOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}`}>

                    {/* Cart Header */}
                    <div className="p-5 pb-2 shrink-0">
                        <div className="flex justify-between items-center mb-3">
                            <h2 className="text-xl font-black tracking-tight flex items-center gap-2">
                                <div className="w-8 h-8 bg-gray-900 dark:bg-white rounded-lg flex items-center justify-center text-white dark:text-black shadow-md">
                                    <ShoppingCart className="w-4 h-4" />
                                </div>
                                Orden
                            </h2>
                            <button onClick={() => setIsCartOpen(false)} className="lg:hidden p-2 text-gray-500 hover:text-gray-900 dark:hover:text-white rounded-full bg-gray-100 dark:bg-white/10 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent opacity-50" />
                    </div>

                    {/* Cart Items */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar px-5 py-2 space-y-2.5 pb-32">
                        {cart.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 opacity-30 select-none">
                                <ShoppingCart className="w-16 h-16 mb-4 stroke-1" />
                                <p className="text-sm font-black uppercase tracking-widest">Carrito Vacío</p>
                            </div>
                        ) : (
                            <AnimatePresence>
                                {cart.map((item) => (
                                    <motion.div
                                        key={item.id}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="bg-white dark:bg-dark-card rounded-xl p-2.5 shadow-sm border border-gray-100 dark:border-white/5 flex gap-3 group hover:shadow-md transition-all"
                                    >
                                        <div className="w-12 h-12 rounded-lg bg-gray-50 dark:bg-black/20 shrink-0 overflow-hidden">
                                            {item.imageUrl && <img src={item.imageUrl} className="w-full h-full object-cover" />}
                                        </div>
                                        <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                                            <div className="flex justify-between items-start gap-2">
                                                <h4 className="font-bold text-xs leading-tight line-clamp-1">{item.name}</h4>
                                                <button onClick={() => removeFromCart(item.id)} className="text-gray-300 hover:text-red-500 transition-colors">
                                                    <X className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                            <div className="flex justify-between items-end mt-1">
                                                <div className="flex items-center space-x-1.5 bg-gray-100 dark:bg-black/30 rounded-md p-0.5">
                                                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-0.5 hover:bg-white dark:hover:bg-gray-700 rounded-md transition-shadow">
                                                        <Minus className="w-3 h-3" />
                                                    </button>

                                                    <div className="w-8 flex justify-center">
                                                        {editingQtyId === item.id ? (
                                                            <input
                                                                autoFocus
                                                                defaultValue={item.quantity}
                                                                onBlur={(e) => handleQtyInputBlur(item.id, e)}
                                                                onKeyDown={(e) => e.key === 'Enter' && handleQtyInputBlur(item.id, e)}
                                                                className="w-full bg-white dark:bg-gray-700 text-center text-[10px] font-black rounded outline-none border border-blue-500 p-0"
                                                            />
                                                        ) : (
                                                            <span
                                                                onClick={() => setEditingQtyId(item.id)}
                                                                className="text-[10px] font-black font-mono cursor-pointer hover:text-blue-500 transition-colors"
                                                            >
                                                                {item.quantity}
                                                            </span>
                                                        )}
                                                    </div>

                                                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-0.5 hover:bg-white dark:hover:bg-gray-700 rounded-md transition-shadow">
                                                        <Plus className="w-3 h-3" />
                                                    </button>
                                                </div>
                                                <p className="text-sm font-black text-blue-600 dark:text-blue-400">${(item.price * item.quantity).toFixed(2)}</p>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        )}
                        <div className="h-4" />
                    </div>

                    {/* Operations */}
                    <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-dark-bg border-t border-gray-100 dark:border-white/10 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] z-30 p-5 pb-6">
                        <div className="flex gap-2 mb-3">
                            <div className={`h-1 flex-1 rounded-full ${getTrafficLight()} opacity-60 shadow-lg`} />
                        </div>

                        <div className="space-y-3">
                            <div className="space-y-3">
                                {checkoutData.discountAmount > 0 && (
                                    <div className="flex justify-between items-end text-emerald-500">
                                        <span className="text-xs font-bold uppercase tracking-widest mb-1 flex items-center gap-1">
                                            <Tag className="w-3 h-3" /> Descuento ({checkoutData.couponCode})
                                        </span>
                                        <span className="text-lg font-black tracking-tighter">-Bs {checkoutData.discountAmount.toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between items-end">
                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Total a Pagar</span>
                                    <span className="text-3xl font-black tracking-tighter text-gray-900 dark:text-white">
                                        Bs {(finalTotal - checkoutData.discountAmount).toFixed(2)}
                                    </span>
                                </div>

                                <button
                                    onClick={() => isFastSale ? handleCheckout(true) : setIsCheckoutOpen(true)}
                                    disabled={cart.length === 0}
                                    className={`w-full py-3.5 ${isFastSale ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-400 hover:to-red-400 shadow-orange-500/30' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-blue-600/30'} active:scale-[0.98] text-white rounded-xl font-black uppercase tracking-[0.2em] shadow-xl disabled:opacity-50 disabled:grayscale transition-all flex items-center justify-center gap-3 text-xs group`}
                                >
                                    <span>{isFastSale ? 'Venta Rápida (Enter)' : 'Cobrar'}</span>
                                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>

                            {lastSale && (
                                <motion.div
                                    ref={receiptRef}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mt-3 pt-3 border-t border-dashed border-gray-200 dark:border-white/10 text-center"
                                >
                                    <div className="inline-flex items-center gap-2 bg-green-50 dark:bg-green-500/10 px-3 py-1.5 rounded-lg text-green-700 dark:text-green-400 mx-auto">
                                        <span className="text-[10px] font-bold">#{lastSale.id}</span>
                                        <span className="text-sm font-black">${lastSale.total.toFixed(2)}</span>
                                        <button onClick={() => window.print()} className="ml-2 p-2 bg-green-200 dark:bg-green-800 rounded-full hover:bg-green-300 dark:hover:bg-green-700 transition-colors shadow-sm">
                                            <Printer className="w-6 h-6 stroke-2" />
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    </div>

                    {/* CHECKOUT MODAL */}
                    {isCheckoutOpen && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
                            <div className="bg-white dark:bg-dark-bg w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/10 flex flex-col max-h-[90vh]">
                                <div className="p-6 border-b border-gray-100 dark:border-white/5 flex justify-between items-center bg-gray-50 dark:bg-white/5">
                                    <h2 className="text-xl font-black uppercase tracking-tight">Datos de Venta</h2>
                                    <button onClick={() => setIsCheckoutOpen(false)} className="p-2 hover:bg-white dark:hover:bg-white/10 rounded-full transition-colors">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="p-4 md:p-6 space-y-4 md:space-y-6 overflow-y-auto custom-scrollbar">
                                    {/* DELIVERY & CUSTOMER FIELDS REMAIN SAME */}
                                    <div className="flex p-1 bg-gray-100 dark:bg-black/20 rounded-xl">
                                        {['En Tienda', 'Envio'].map((type) => (
                                            <button
                                                key={type}
                                                onClick={() => setCheckoutData({ ...checkoutData, deliveryType: type })}
                                                className={`flex-1 py-3 rounded-lg text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2
                                                ${checkoutData.deliveryType === type
                                                        ? 'bg-white dark:bg-gray-700 shadow-md text-blue-600 dark:text-blue-400'
                                                        : 'text-gray-400 hover:text-gray-600'}`
                                                }
                                            >
                                                {type === 'En Tienda' ? <Store className="w-4 h-4" /> : <Truck className="w-4 h-4" />}
                                                {type}
                                            </button>
                                        ))}
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Cliente</label>
                                        <div className="grid grid-cols-1 gap-3">
                                            <div className="flex items-center bg-gray-50 dark:bg-black/20 rounded-xl px-4 py-3 border border-transparent focus-within:border-blue-500 transition-colors">
                                                <User className="w-4 h-4 text-gray-400 mr-3" />
                                                <input
                                                    value={checkoutData.customerName}
                                                    onChange={e => setCheckoutData({ ...checkoutData, customerName: e.target.value })}
                                                    placeholder="Nombre Completo"
                                                    className="bg-transparent border-none outline-none text-xs font-bold w-full"
                                                />
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                <div className="flex items-center bg-gray-50 dark:bg-black/20 rounded-xl px-4 py-3 border border-transparent focus-within:border-blue-500 transition-colors">
                                                    <CreditCard className="w-4 h-4 text-gray-400 mr-3" />
                                                    <input
                                                        value={checkoutData.customerNit}
                                                        onChange={e => setCheckoutData({ ...checkoutData, customerNit: e.target.value })}
                                                        placeholder="NIT / CI"
                                                        className="bg-transparent border-none outline-none text-xs font-bold w-full"
                                                    />
                                                </div>
                                                <div className="flex items-center bg-gray-50 dark:bg-black/20 rounded-xl px-4 py-3 border border-transparent focus-within:border-blue-500 transition-colors">
                                                    <Phone className="w-4 h-4 text-gray-400 mr-3" />
                                                    <input
                                                        value={checkoutData.customerPhone}
                                                        onChange={e => setCheckoutData({ ...checkoutData, customerPhone: e.target.value })}
                                                        placeholder="Celular"
                                                        className="bg-transparent border-none outline-none text-xs font-bold w-full"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* COUPON CODE */}
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Código Promocional</label>
                                        <div className="flex gap-2">
                                            <div className="flex-1 flex items-center bg-gray-50 dark:bg-black/20 rounded-xl px-4 py-3 border border-transparent focus-within:border-emerald-500 transition-colors">
                                                <Tag className="w-4 h-4 text-emerald-400 mr-3" />
                                                <input
                                                    value={couponInput}
                                                    onChange={e => setCouponInput(e.target.value.toUpperCase())}
                                                    placeholder="Ej: VERANO26"
                                                    className="bg-transparent border-none outline-none text-xs font-bold w-full uppercase"
                                                    disabled={checkoutData.discountAmount > 0}
                                                />
                                            </div>
                                            {checkoutData.discountAmount > 0 ? (
                                                <button
                                                    onClick={() => {
                                                        setCheckoutData({ ...checkoutData, couponCode: '', discountAmount: 0 });
                                                        setCouponInput('');
                                                        setCouponMessage({ type: '', text: '' });
                                                    }}
                                                    className="px-4 bg-red-500/10 text-red-500 rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-red-500/20"
                                                >
                                                    Quitar
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={handleApplyCoupon}
                                                    className="px-4 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-emerald-500/20 shadow-sm"
                                                >
                                                    Aplicar
                                                </button>
                                            )}
                                        </div>
                                        {couponMessage.text && (
                                            <p className={`text-[10px] font-bold uppercase tracking-widest pl-2 ${couponMessage.type === 'success' ? 'text-emerald-500' :
                                                couponMessage.type === 'error' ? 'text-red-500' : 'text-blue-500'
                                                }`}>
                                                {couponMessage.text}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Pago</label>
                                        <div className="grid grid-cols-3 gap-3">
                                            {[
                                                { id: 'Cash', icon: Banknote, label: 'Efectivo', color: 'emerald' },
                                                { id: 'QR', icon: QrCode, label: 'QR', color: 'purple' },
                                                { id: 'Deposit', icon: Landmark, label: 'Depósito', color: 'blue' }
                                            ].map((method) => (
                                                <button
                                                    key={method.id}
                                                    onClick={() => setCheckoutData({ ...checkoutData, paymentMethod: method.id })}
                                                    className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all 
                                                    ${checkoutData.paymentMethod === method.id
                                                            ? `border-${method.color}-500 bg-${method.color}-500/10 text-${method.color}-500`
                                                            : 'border-transparent bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:bg-gray-100'}`
                                                    }
                                                >
                                                    <method.icon className="w-6 h-6" />
                                                    <span className="text-[10px] font-black uppercase">{method.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 border-t border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/5">
                                    <button
                                        onClick={handleCheckout}
                                        disabled={loading}
                                        className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] text-white rounded-xl font-black uppercase tracking-widest shadow-xl shadow-emerald-500/20 transition-all flex items-center justify-center gap-3 text-xs"
                                    >
                                        {loading ? '...' : 'Confirmar Venta'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ICON PICKER MODAL */}
                    {showIconPicker && (
                        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
                            <div className="bg-white dark:bg-dark-bg w-full max-w-4xl rounded-[2rem] shadow-2xl overflow-hidden border border-white/10 flex flex-col h-[80vh]">
                                <div className="p-6 border-b border-gray-100 dark:border-white/5 flex justify-between items-center bg-gray-50 dark:bg-white/5">
                                    <div>
                                        <h2 className="text-xl font-black uppercase tracking-tight">Cambiar Icono</h2>
                                        <p className="text-xs text-gray-400 font-bold mt-1">Categoría: {editingCategory}</p>
                                    </div>
                                    <button onClick={() => setShowIconPicker(false)} className="p-2 hover:bg-white dark:hover:bg-white/10 rounded-full transition-colors">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                                    <div className="grid grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3">
                                        {Array.from({ length: 297 }, (_, i) => i + 1).map((num) => {
                                            const iconUrl = `/icons/CUTE PACK 2024 (${num}).ico`;
                                            return (
                                                <button
                                                    key={num}
                                                    onClick={() => handleIconSelect(iconUrl)}
                                                    className="aspect-square bg-gray-50 dark:bg-black/20 rounded-xl flex items-center justify-center p-2 hover:bg-blue-500/10 hover:border-blue-500 border-2 border-transparent transition-all group"
                                                >
                                                    <img
                                                        src={iconUrl}
                                                        className="w-8 h-8 object-contain group-hover:scale-110 transition-transform"
                                                        alt={`Icon ${num}`}
                                                        loading="lazy"
                                                    />
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    {/* VENDOR SALES REPORT MODAL */}
                    <AnimatePresence>
                        {showVendorReport && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 z-[70] flex justify-center items-center bg-black/60 backdrop-blur-sm p-4"
                            >
                                <motion.div
                                    initial={{ y: 50, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    exit={{ y: 50, opacity: 0 }}
                                    className="bg-white dark:bg-dark-card w-full max-w-4xl rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border border-gray-200 dark:border-white/10"
                                >
                                    <div className="p-6 border-b border-gray-100 dark:border-white/5 flex justify-between items-center bg-gray-50/50 dark:bg-white/5">
                                        <div>
                                            <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
                                                <FileText className="w-5 h-5 text-blue-500" /> Reporte de Ventas
                                            </h2>
                                            <p className="text-xs text-gray-500 font-bold tracking-widest mt-1 uppercase">
                                                {activeStore?.name}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <button onClick={exportVendorSalesPDF} className="flex items-center gap-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-4 py-2 rounded-xl text-xs font-bold tracking-widest uppercase transition-colors">
                                                <Download className="w-4 h-4" /> Exportar PDF
                                            </button>
                                            <button onClick={() => setShowVendorReport(false)} className="p-2 hover:bg-gray-200 dark:hover:bg-white/10 rounded-full transition-colors">
                                                <X className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex-1 overflow-auto p-0">
                                        <table className="w-full text-left border-collapse text-sm">
                                            <thead>
                                                <tr className="bg-gray-50 dark:bg-white/5 border-b border-light-border dark:border-white/5 text-xs uppercase tracking-widest text-gray-500">
                                                    <th className="p-4 font-black">Fecha</th>
                                                    <th className="p-4 font-black">Producto</th>
                                                    <th className="p-4 font-black text-center">Cant.</th>
                                                    <th className="p-4 font-black text-right">Monto</th>
                                                    <th className="p-4 font-black">Vendedor</th>
                                                    <th className="p-4 font-black">Método</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {vendorSales.length === 0 ? (
                                                    <tr>
                                                        <td colSpan="6" className="p-8 text-center text-gray-500 italic">No hay ventas registradas en esta tienda.</td>
                                                    </tr>
                                                ) : (
                                                    vendorSales.map(s => (
                                                        <tr key={s.id} className="border-b border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5">
                                                            <td className="p-4 font-medium text-gray-500 whitespace-nowrap">{new Date(s.rawDate).toLocaleString()}</td>
                                                            <td className="p-4 font-black">{s.product}</td>
                                                            <td className="p-4 font-bold text-center">{s.quantity}</td>
                                                            <td className="p-4 font-black text-emerald-600 dark:text-emerald-400 text-right">Bs {s.total?.toFixed(2) || '0.00'}</td>
                                                            <td className="p-4 text-xs font-bold uppercase tracking-wider text-gray-500">{s.user || 'Sistema'}</td>
                                                            <td className="p-4 text-xs font-bold uppercase tracking-wider">{s.status} / {s.saleStatus}</td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="p-6 border-t border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/5 flex justify-end">
                                        <div className="text-right">
                                            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Total Ventas</p>
                                            <p className="text-2xl font-black text-emerald-500">
                                                Bs {vendorSales.reduce((acc, sale) => acc + (sale.total || 0), 0).toFixed(2)}
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </>
    );
};

export default Sales;
