/**
 * API Configuration
 */

export const API_CONFIG = {
    // ⭐ AUTO-DETECT: Gunakan relative path untuk production
    BASE_URL: import.meta.env.PROD ? '' : 'http://localhost:5000',
    
    TIMEOUT: 30000,
    
    DEBUG: import.meta.env.DEV || true,
    
    ENDPOINTS: {
        LOGIN: '/api/auth/login',
        LOGOUT: '/api/auth/logout',
        ME: '/api/auth/me',
        CHANGE_PASSWORD: '/api/auth/change-password',
        FORGOT_PASSWORD: '/api/auth/forgot-password',
        RESET_PASSWORD: '/api/auth/reset-password',
        
        EMPLOYEES: '/api/employee',
        EMPLOYEES_GRID: '/api/employee/grid',
        EMPLOYEES_ACTIVE: '/api/employee/active',
        
        ASSETS: '/api/asset',
        ASSETS_GRID: '/api/asset/grid',
        
        CATEGORIES: '/api/category',
        CATEGORIES_ACTIVE: '/api/category/active',
        
        TRANSACTIONS: '/api/assettransactions',
        TRANSACTIONS_BY_ASSET: '/api/assettransactions/asset',
        
        HEALTH: '/health'
    }
};

if (typeof window !== 'undefined') {
    window.API_CONFIG = API_CONFIG;
    console.log('✅ API Config loaded:', API_CONFIG.BASE_URL);
    console.log('✅ Environment:', import.meta.env.MODE);
    console.log('✅ Is Production:', import.meta.env.PROD);
}