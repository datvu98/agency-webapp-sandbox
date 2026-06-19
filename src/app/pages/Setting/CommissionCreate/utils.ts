export const options = [
    { value: 'nmv', label: 'Doanh thu thành công' },
    { value: 'budget_percentage', label: '% Ngân sách' },
    { value: 'plan_completion_rate', label: 'Tỷ lệ hoàn thành Plan' },
    { value: 'marketing_budget', label: 'Ngân sách MKT' },
];

export const optionsFulfillment = [
    { value: 'nmv', label: 'Doanh thu thành công' },
];

export const optionsOperator = [
    { value: '<', label: 'Nhỏ hơn' },
    { value: '<=', label: 'Nhỏ hơn hoặc bằng' },
    { value: '=', label: 'Bằng' },
    { value: '>', label: 'Lớn hơn' },
    { value: '>=', label: 'Lớn hơn hoặc bằng' },
];

export const checkDuplicateStores = (configs: Array<any>) => {
    const storeSet = new Set();
    for (let config of configs) {
        if (config?.length > 1 && !config?.groups[0]?.stores?.length) {
            return true
        }
        for (let store of config?.groups[0]?.stores) {
            if (storeSet.has(store)) {
                return true;
            }
            storeSet.add(store);
        }
    }
    return false;
};

export const checkDuplicateStoresFFM = (configs: Array<any>) => {
    const storeSet = new Set();
    for (let config of configs) {
        if (!config?.stores?.length) {
            return true
        }
        for (let store of config?.stores) {
            if (storeSet.has(store)) {
                return true;
            }
            storeSet.add(store);
        }
    }
    return false;
};

export const validateFormula = (formula: string) => {
    if (formula?.trim().length == 0) {
        return false;
    }
    let stack: string[] = [];
    for (let i = 0; i < formula.length; i++) {
        let char = formula[i];

        if (char === '(') {
            stack.push(char);
        } else if (char === ')') {
            if (stack.length === 0) {
                return false;
            }

            if (formula[i - 1] === '(') {
                return false;
            }

            stack.pop();
        }
    }
    if (stack.length !== 0) {
        return false;
    }

    const operatorRegex = /[+\-*/]/;
    const parts = formula.split(operatorRegex);
    for (let part of parts) {
        if (part.trim() === '') {
            return false;
        }
    }

    if (/([+\-*/]{2,})|(\.\.)/.test(formula)) {
        return false;
    }

    if (/\)\(/.test(formula)) {
        return false;
    }

    const tagLabels = options.map((tag: any) => tag.value).join('|');
    console.log(formula)
    const consecutiveTagsRegex = new RegExp(`\\{(${tagLabels})\\}\\{(${tagLabels})\\}`);
    if (consecutiveTagsRegex.test(formula)) {
        return false;
    }

    return true;
};

export const removeTypename = (obj: any) => {
    if (Array.isArray(obj)) {
        obj.forEach(removeTypename);
    } else if (typeof obj === 'object' && obj !== null) {
        delete obj.__typename;
        Object.values(obj).forEach(removeTypename);
    }
};