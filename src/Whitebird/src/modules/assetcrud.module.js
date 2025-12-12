/**
 * Asset CRUD Module - Handles add/edit asset page
 * Matches assetcrud.html structure
 */

import { whitebirdAPI } from '../services/api/whitebird-api.service.js';

export class AssetCrudModule {
    constructor() {
        this.mode = 'create'; // 'create' or 'update'
        this.assetId = null;
        this.asset = null;
        this.categories = [];
    }

    /**
     * Initialize CRUD page
     */
    async initialize() {
        console.log('📝 Asset CRUD Page Initializing...');
        
        try {
            // Get mode from sessionStorage
            this.mode = sessionStorage.getItem('crudMode') || 'create';
            this.assetId = sessionStorage.getItem('crudId');

            console.log(`Mode: ${this.mode}, ID: ${this.assetId}`);

            // Load categories for dropdown
            await this.loadCategories();

            this.setupEventListeners();
            this.updatePageTitle();
            
            if (this.mode === 'update' && this.assetId) {
                await this.loadAsset(parseInt(this.assetId));
            }

            console.log('✅ Asset CRUD page initialized');
        } catch (error) {
            console.error('❌ Asset CRUD initialization error:', error);
        }
    }

    /**
     * Load categories for dropdown
     */
    async loadCategories() {
        try {
            const response = await whitebirdAPI.getActiveCategories();
            if (response && response.success && response.data) {
                this.categories = response.data;
                this.populateCategoryDropdown();
            }
        } catch (error) {
            console.error('❌ Failed to load categories:', error);
        }
    }

    /**
     * Populate category dropdown
     */
    populateCategoryDropdown() {
        const select = document.getElementById('categoryId');
        if (!select) return;

        // Clear existing options except first
        select.innerHTML = '<option value="">Select Category</option>';

        this.categories.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat.categoryId;
            option.textContent = cat.categoryName;
            select.appendChild(option);
        });
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        const form = document.getElementById('assetForm');
        const btnSave = document.getElementById('btnSaveAsset');
        const btnCancel = document.getElementById('btnCancelAsset');
        const btnBack = document.getElementById('btnBackToAssets');

        if (!form) {
            console.error('❌ Asset form not found!');
            return;
        }

        // Form submit
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmit();
        });

        // Cancel button
        if (btnCancel) {
            btnCancel.addEventListener('click', () => {
                this.handleCancel();
            });
        }

        // Back button
        if (btnBack) {
            btnBack.addEventListener('click', () => {
                this.handleCancel();
            });
        }

        console.log('✅ Event listeners attached');
    }

    /**
     * Update page title and breadcrumb
     */
    updatePageTitle() {
        const titleEl = document.getElementById('crudTitle');
        const breadcrumbEl = document.getElementById('breadcrumbAction');

        if (this.mode === 'update') {
            if (titleEl) {
                titleEl.innerHTML = '<i class="fas fa-box me-2"></i>Edit Asset';
            }
            if (breadcrumbEl) {
                breadcrumbEl.textContent = 'Edit';
            }
        } else {
            if (titleEl) {
                titleEl.innerHTML = '<i class="fas fa-box me-2"></i>Add New Asset';
            }
            if (breadcrumbEl) {
                breadcrumbEl.textContent = 'Add New';
            }
        }
    }

    /**
     * Load asset data for edit mode
     */
    async loadAsset(id) {
        try {
            console.log(`📡 Loading asset ${id} from API...`);
            
            const response = await whitebirdAPI.getAsset(id);
            
            if (response && response.success && response.data) {
                this.asset = response.data;
                this.populateForm(this.asset);
                console.log('✅ Asset data loaded');
            } else {
                throw new Error('Failed to load asset');
            }
        } catch (error) {
            console.error('❌ Failed to load asset:', error);
            alert('Failed to load asset data. Please try again.');
            this.handleCancel();
        }
    }

    /**
     * Populate form with asset data
     */
    populateForm(asset) {
        document.getElementById('assetName').value = asset.assetName || '';
        document.getElementById('serialNumber').value = asset.serialNumber || '';
        document.getElementById('categoryId').value = asset.categoryId || '';
        document.getElementById('condition').value = asset.condition || '';
        
        if (asset.purchaseDate) {
            document.getElementById('purchaseDate').value = asset.purchaseDate.split('T')[0];
        }
        
        document.getElementById('purchasePrice').value = asset.purchasePrice || '';
    }

    /**
     * Get form data
     */
    getFormData() {
        const data = {
            assetName: document.getElementById('assetName').value.trim(),
            categoryId: parseInt(document.getElementById('categoryId').value),
            serialNumber: document.getElementById('serialNumber').value.trim() || null,
            condition: document.getElementById('condition').value || null
        };

        const purchaseDate = document.getElementById('purchaseDate').value;
        if (purchaseDate) {
            data.purchaseDate = new Date(purchaseDate).toISOString();
        }

        const purchasePrice = document.getElementById('purchasePrice').value;
        if (purchasePrice) {
            data.purchasePrice = parseFloat(purchasePrice);
        }

        return data;
    }

    /**
     * Validate form data
     */
    validateFormData(data) {
        if (!data.assetName) {
            alert('Asset Name is required');
            return false;
        }

        if (!data.categoryId) {
            alert('Category is required');
            return false;
        }

        return true;
    }

    /**
     * Handle form submit
     */
    async handleSubmit() {
        const btnSave = document.getElementById('btnSaveAsset');
        
        try {
            // Get form data
            const formData = this.getFormData();

            // Validate
            if (!this.validateFormData(formData)) {
                return;
            }

            // Disable button
            const originalText = btnSave.innerHTML;
            btnSave.disabled = true;
            btnSave.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Saving...';

            let response;
            if (this.mode === 'update') {
                console.log(`📤 Updating asset ${this.assetId}...`);
                response = await whitebirdAPI.updateAsset(this.assetId, formData);
            } else {
                console.log('📤 Creating new asset...');
                response = await whitebirdAPI.createAsset(formData);
            }

            if (response && response.success) {
                console.log('✅ Asset saved successfully');
                alert(this.mode === 'update' ? 'Asset updated successfully!' : 'Asset created successfully!');
                
                // Navigate back to assets list
                if (window.router) {
                    window.router.navigate('assets');
                } else {
                    window.location.href = '/assets';
                }
            } else {
                throw new Error(response.message || 'Failed to save asset');
            }
        } catch (error) {
            console.error('❌ Failed to save asset:', error);
            alert('Failed to save asset. Please try again.');
            
            // Re-enable button
            btnSave.disabled = false;
            btnSave.innerHTML = '<i class="fas fa-save me-2"></i>Save Asset';
        }
    }

    /**
     * Handle cancel
     */
    handleCancel() {
        if (window.router) {
            window.router.navigate('assets');
        } else {
            window.location.href = '/assets';
        }
    }
}

// Export instance
export const assetCrudModule = new AssetCrudModule();
