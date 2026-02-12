/**
 * Функция для расчета выручки
 * @param purchase запись о покупке
 * @param _product карточка товара
 * @returns {number}
 */
function calculateSimpleRevenue(purchase, _product) {
   // @TODO: Расчет выручки от операции
    const { discount, sale_price, quantity } = purchase;
    const discountMultiplier = 1 - (purchase.discount / 100);
    return sale_price * quantity * discountMultiplier;
}

/**
 * Функция для расчета бонусов
 * @param index порядковый номер в отсортированном массиве
 * @param total общее число продавцов
 * @param seller карточка продавца
 * @returns {number}
 */
function calculateBonusByProfit(index, total, seller) {
    // @TODO: Расчет бонуса от позиции в рейтинге
    const {profit} = seller;
    total = total.length;
    if (index === 0) {
        return profit * 0.15;
    }
    if (index === 1 || index === 2) {
        return profit * 0.1;
    }
    if (index === total - 1) {
        return 0;   
    } else {
        return profit * 0.05;
    }
}

/**
 * Функция для анализа данных продаж
 * @param data
 * @param options
 * @returns {{revenue, top_products, bonus, name, sales_count, profit, seller_id}[]}
 */
function analyzeSalesData(data, options) {
    // @TODO: Проверка входных данных
    if (!data || !Array.isArray(data.sellers, data.products, data.purchase_records) || 
data.sellers.length === 0, data.products.length === 0, data.purchase_records.length === 0) {
    throw new Error('Некорректные входные данные');
}

    // @TODO: Проверка наличия опций
    if (typeof options !== 'object') {
        throw new Error('Параметр options должен быть объектом');
    }
    const { calculateRevenue, calculateBonus } = options;

    if (typeof calculateRevenue !== 'function') {
        throw new Error('options.calculateRevenue должна быть функцией');
    }
    if (typeof calculateBonus !== 'function') {
        throw new Error('options.calculateBonus должна быть функцией');
    }

    // @TODO: Подготовка промежуточных данных для сбора статистики
        const sellerStats = data.sellers.map(seller => ({
    
            id: seller.id,
            name: `${seller.first_name} ${seller.last_name}`,
            revenue: 0,
            profit: 0,
            sales_count: 0,
        products_sold: {}
    }));

    // @TODO: Индексация продавцов и товаров для быстрого доступа
    // преобразовали продавцов в обьекты с индексами
    const sellerIndex = Object.fromEntries(sellerStats.map(seller => [seller.id, seller]));

    // преобразовали продукты в обьекты с индексами
    const productIndex = Object.fromEntries(data.products.map(product => [product.sku, product]));

    // @TODO: Расчет выручки и прибыли для каждого продавца
    data.purchase_records.forEach(record => {
    const seller = sellerIndex[record.seller_id];
    if (seller) {
        seller.sales_count += 1; // счетчик количесва продаж
    }

    if (seller) {
        seller.revenue += record.total_amount; // счетчик общей прибыли продавцов
    }

    record.items.forEach(item => {
        const product = productIndex[item.sku];

        const cost = product.purchase_price * item.quantity; // считаем себестоимость проданных товаров

        const revenue = calculateSimpleRevenue(item);

        const profit = revenue - cost; // расчет чистой прибыли

        seller.profit += profit; //увеличить прибыль у продавцов

        if (!seller.products_sold[item.sku]) {
            seller.products_sold[item.sku] = 0;
        }

        seller.products_sold[item.sku] += 1;//увеличиваем счетчик проданных товаров 
    }) 
})

    // @TODO: Сортировка продавцов по прибыли
    sellerStats.sort((a, b) => b.profit - a.profit);

    // @TODO: Назначение премий на основе ранжирования
    sellerStats.forEach((seller, index) => {
        seller.bonus = calculateBonusByProfit(index, sellerStats, seller) // Считаем бонус
        seller.top_products = Object.entries(seller.products_sold)
        .map(([sku, quantity]) => ([{sku, quantity}]))
        .sort((a, b) => (b.quantity - a.quantity))
        .slice(0, 10); // Формируем топ-10 товаров
});

    // @TODO: Подготовка итоговой коллекции с нужными полями
    return sellerStats.map(seller => ({
        seller_id: seller.id, // Строка, идентификатор продавца
        name: seller.name, // Строка, имя продавца
        revenue: +seller.revenue.toFixed(2),// Число с двумя знаками после точки, выручка продавца
        profit: +seller.profit.toFixed(2),// Число с двумя знаками после точки, прибыль продавца
        sales_count: seller.sales_count,// Целое число, количество продаж продавца
        top_products: seller.top_products,// Массив объектов вида: { "sku": "SKU_008","quantity": 10}, топ-10 товаров продавца
        bonus: +seller.bonus.toFixed(2)// Число с двумя знаками после точки, бонус продавца
}));
}



















