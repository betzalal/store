import { useStore } from '../../context/StoreContext';

const Sales = () => {
    const { activeStore, isEmpresaMode } = useStore();
    const [sales, setSales] = useState([]);

    useEffect(() => {
        const storeId = (!isEmpresaMode && activeStore) ? activeStore.id : '';
        fetch(`http://localhost:3001/api/sales?storeId=${storeId}`)
            .then(res => res.json())
            .then(data => setSales(data))
            .catch(err => console.error(err));
    }, [activeStore, isEmpresaMode]);

    return (
        <div className="bg-white dark:bg-dark-card p-6 rounded-2xl shadow">
            <h2 className="text-2xl font-bold mb-4">
                {isEmpresaMode ? 'Registro Global de Ventas' : `Ventas - ${activeStore?.name || 'Cargando...'}`}
            </h2>
            <div className="space-y-4">
                {sales.map((sale) => (
                    <div key={sale.id} className="border-b border-gray-200 dark:border-gray-700 pb-4">
                        <div className="flex justify-between items-center mb-2">
                            <span className="font-bold text-lg">Venta #{sale.id}</span>
                            <span className="text-sm text-gray-500">{new Date(sale.date).toLocaleString()}</span>
                        </div>
                        <div className="text-gray-600 dark:text-gray-300">
                            Tienda: {sale.store?.name}
                        </div>
                        <div className="mt-2">
                            {sale.items?.map((item) => (
                                <div key={item.id} className="flex justify-between text-sm">
                                    <span>{item.quantity}x {item.product?.name}</span>
                                    <span>${item.price * item.quantity}</span>
                                </div>
                            ))}
                        </div>
                        <div className="mt-2 text-right font-bold text-green-600 dark:text-green-400">
                            Total: ${sale.total}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Sales;
