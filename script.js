// Данные для калькулятора
const PRICES = {
    cake: {
        bases: { vanilla: 800, chocolate: 900, 'red-velvet': 950 },
        fillings: { 'cream-cheese': 300, 'chocolate-ganache': 350, berry: 400, caramel: 350 },
        decors: { none: 0, berries: 500, macarons: 700, flowers: 1000, fondant: 1500 },
        options: { 'two-tiers': 2000, inscription: 300, figurines: 500 },
        unit: 'кг',
        min: 1,
        max: 10,
        label: 'Вес'
    },
    cupcakes: {
        bases: { vanilla: 150, chocolate: 160, 'red-velvet': 170 },
        fillings: { 'cream-cheese': 50, 'chocolate-ganache': 60, berry: 70, caramel: 60 },
        decors: { none: 0, berries: 200, macarons: 300, flowers: 400, fondant: 500 },
        options: { 'two-tiers': 0, inscription: 300, figurines: 500 },
        unit: 'шт',
        min: 6,
        max: 24,
        label: 'Количество'
    },
    bento: {
        bases: { vanilla: 1200, chocolate: 1300, 'red-velvet': 1400 },
        fillings: { 'cream-cheese': 200, 'chocolate-ganache': 250, berry: 300, caramel: 250 },
        decors: { none: 0, berries: 300, macarons: 400, flowers: 500, fondant: 600 },
        options: { 'two-tiers': 0, inscription: 300, figurines: 500 },
        unit: 'шт',
        min: 1,
        max: 10,
        label: 'Количество'
    }
};

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('cake-form');
    const priceValue = document.getElementById('price-value');
    const priceDetails = document.getElementById('price-details');
    const weightInput = document.getElementById('weight');
    const weightValue = document.getElementById('weight-value');
    const weightUnit = document.getElementById('weight-unit');
    const weightLabel = document.getElementById('weight-label');
    const productTypeSelect = document.getElementById('product-type');
    const burger = document.getElementById('burger');
    const nav = document.getElementById('nav');
    const navOverlay = document.getElementById('nav-overlay');
    const useCalcBtn = document.getElementById('use-calc');
    const orderMessage = document.getElementById('customer-message');

    if (!form || !priceValue || !priceDetails || !weightInput || !weightValue) {
        console.error('Ошибка: не найдены необходимые элементы калькулятора.');
        return;
    }

    // Мобильное меню
    function toggleMenu() {
        burger.classList.toggle('active');
        nav.classList.toggle('active');
        navOverlay.classList.toggle('active');
        document.body.style.overflow = nav.classList.contains('active') ? 'hidden' : '';
    }

    if (burger && nav && navOverlay) {
        burger.addEventListener('click', toggleMenu);

        navOverlay.addEventListener('click', toggleMenu);

        document.querySelectorAll('.nav__link').forEach(link => {
            link.addEventListener('click', () => {
                burger.classList.remove('active');
                nav.classList.remove('active');
                navOverlay.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
    }

    let currentDisplayedPrice = 0;

    function animatePrice(start, end, duration = 400) {
        const startTime = performance.now();
        const difference = end - start;

        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.round(start + difference * eased);

            priceValue.textContent = current.toLocaleString('ru-RU') + ' ₽';

            if (progress < 1) {
                requestAnimationFrame(update);
            }
        }

        requestAnimationFrame(update);
    }

    function getCalculatorData() {
        const productType = productTypeSelect.value;
        const base = document.getElementById('base').value;
        const filling = document.getElementById('filling').value;
        const decor = document.getElementById('decor').value;
        const quantity = parseFloat(weightInput.value);

        const options = [];
        if (document.getElementById('two-tiers').checked) options.push('two-tiers');
        if (document.getElementById('inscription').checked) options.push('inscription');
        if (document.getElementById('figurines').checked) options.push('figurines');

        const priceData = PRICES[productType];

        const basePricePerUnit = priceData.bases[base];
        const fillingPricePerUnit = priceData.fillings[filling];
        const decorPrice = priceData.decors[decor];
        const baseTotal = (basePricePerUnit + fillingPricePerUnit) * quantity;
        const optionsTotal = options.reduce((sum, opt) => sum + priceData.options[opt], 0);
        const total = baseTotal + decorPrice + optionsTotal;

        return { productType, base, filling, decor, quantity, baseTotal, decorPrice, optionsTotal, total };
    }

    function updatePrice() {
        const data = getCalculatorData();
        priceDetails.innerHTML = `
            Базовая цена: ${data.baseTotal.toLocaleString('ru-RU')} ₽<br>
            Декор: ${data.decorPrice.toLocaleString('ru-RU')} ₽<br>
            Дополнительно: ${data.optionsTotal.toLocaleString('ru-RU')} ₽
        `;
        animatePrice(currentDisplayedPrice, data.total);
        currentDisplayedPrice = data.total;
    }

    function updateProductType() {
        const productType = productTypeSelect.value;
        const data = PRICES[productType];
        weightInput.min = data.min;
        weightInput.max = data.max;
        weightInput.value = Math.min(Math.max(weightInput.value, data.min), data.max);
        weightLabel.textContent = data.label;
        weightUnit.textContent = data.unit;
        weightValue.textContent = weightInput.value;
        updatePrice();
    }

    const inputs = form.querySelectorAll('select, input[type="range"], input[type="checkbox"]');
    inputs.forEach(input => {
        input.addEventListener('input', updatePrice);
        input.addEventListener('change', updatePrice);
    });

    productTypeSelect.addEventListener('change', updateProductType);

    weightInput.addEventListener('input', () => {
        weightValue.textContent = weightInput.value;
    });

    form.addEventListener('submit', (e) => e.preventDefault());

    function init() {
        updateProductType();
        weightValue.textContent = weightInput.value;
    }

    init();

    if (useCalcBtn && orderMessage) {
        useCalcBtn.addEventListener('click', function() {
            const data = getCalculatorData();
            const baseName = document.getElementById('base').options[document.getElementById('base').selectedIndex].text;
            const fillingName = document.getElementById('filling').options[document.getElementById('filling').selectedIndex].text;
            const decorName = document.getElementById('decor').options[document.getElementById('decor').selectedIndex].text;
            const productTypeName = productTypeSelect.options[productTypeSelect.selectedIndex].text;

            let message = `Мой расчёт:\n`;
            message += `Тип изделия: ${productTypeName}\n`;
            message += `Основа: ${baseName}\n`;
            message += `${PRICES[data.productType].label}: ${data.quantity} ${PRICES[data.productType].unit}\n`;
            message += `Начинка: ${fillingName}\n`;
            message += `Декор: ${decorName}\n`;
            if (document.getElementById('two-tiers').checked) message += `Два яруса: да\n`;
            if (document.getElementById('inscription').checked) message += `Надпись: да\n`;
            if (document.getElementById('figurines').checked) message += `Фигурки: да\n`;
            message += `\nИтого: ${data.total.toLocaleString('ru-RU')} ₽\n`;
            message += `(Базовая цена: ${data.baseTotal.toLocaleString('ru-RU')} ₽, декор: ${data.decorPrice.toLocaleString('ru-RU')} ₽, доп: ${data.optionsTotal.toLocaleString('ru-RU')} ₽)`;

            orderMessage.value = message;
            document.getElementById('order').scrollIntoView({ behavior: 'smooth' });
        });
    }

    const sections = document.querySelectorAll('section');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    sections.forEach(section => observer.observe(section));
});