/**
 * Settings Menu Module - CORRECT IMPLEMENTATION
 * Matches actual HTML IDs and prevents form submit
 */

import { confirmModal } from '../components/confirm-modal.component.js';

export class SettingsMenu {
    constructor() {
        this.settings = this.loadSettings();
    }

    /**
     * Initialize settings page
     */
    initialize() {
        console.log('🎯 Settings Menu Initializing...');
        this.setupEventListeners();
        this.populateForm();
        console.log('✅ Settings Menu Initialized!');
    }

    /**
     * Load settings from localStorage
     */
    loadSettings() {
        const saved = localStorage.getItem('appSettings');
        return saved ? JSON.parse(saved) : {
            appName: 'RedAdmin Pro',
            timeZone: 'UTC-5 (EST)',
            language: 'English',
            currency: 'USD',
            emailNotif: true,
            pushNotif: true,
            smsNotif: false,
            twoFactor: false,
            loginAlerts: true,
            sessionTimeout: '30'
        };
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // PREVENT FORM SUBMIT!
        const form = document.getElementById('settingsForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault(); // STOP FORM SUBMIT!
                console.log('⛔ Form submit prevented!');
                this.handleSave();
                return false; // Extra safety
            });
            console.log('✅ Form submit listener attached');
        }

        // SAVE BUTTON CLICK
        const saveBtn = document.getElementById('saveSettingsBtn');
        if (saveBtn) {
            saveBtn.addEventListener('click', (e) => {
                e.preventDefault(); // STOP BUTTON DEFAULT
                console.log('💾 Save button clicked!');
                this.handleSave();
            });
            console.log('✅ Save button listener attached');
        }

        // RESET BUTTON (changed from Cancel)
        const resetBtn = document.getElementById('cancelSettingsBtn');
        if (resetBtn) {
            // Change button text
            resetBtn.innerHTML = '<i class="fas fa-redo me-2"></i>Reset to Saved';
            
            resetBtn.addEventListener('click', async () => {
                const confirmed = await confirmModal.show({
                    type: 'warning',
                    title: 'Reset Settings',
                    message: 'Discard all changes and reset to last saved settings?',
                    okText: 'Reset',
                    cancelText: 'Keep Changes',
                    okClass: 'btn-warning'
                });
                
                if (confirmed) {
                    this.populateForm();
                    this.showNotification('info', 'Changes discarded');
                }
            });
        }
    }

    /**
     * Populate form with settings
     */
    populateForm() {
        this.setInputValue('appName', this.settings.appName);
        this.setInputValue('timeZone', this.settings.timeZone);
        this.setInputValue('language', this.settings.language);
        this.setInputValue('currency', this.settings.currency);
        
        this.setCheckboxValue('emailNotif', this.settings.emailNotif);
        this.setCheckboxValue('pushNotif', this.settings.pushNotif);
        this.setCheckboxValue('smsNotif', this.settings.smsNotif);
        this.setCheckboxValue('twoFactor', this.settings.twoFactor);
        this.setCheckboxValue('loginAlerts', this.settings.loginAlerts);
        
        this.setInputValue('sessionTimeout', this.settings.sessionTimeout);
    }

    /**
     * Set input value safely
     */
    setInputValue(id, value) {
        const el = document.getElementById(id);
        if (el) el.value = value || '';
    }

    /**
     * Set checkbox value safely
     */
    setCheckboxValue(id, value) {
        const el = document.getElementById(id);
        if (el) el.checked = Boolean(value);
    }

    /**
     * Get input value safely
     */
    getInputValue(id) {
        const el = document.getElementById(id);
        return el ? el.value : '';
    }

    /**
     * Get checkbox value safely
     */
    getCheckboxValue(id) {
        const el = document.getElementById(id);
        return el ? el.checked : false;
    }

    /**
     * Handle save - WITH MODAL CONFIRMATION!
     */
    async handleSave() {
        console.log('💾 handleSave called!');
        
        try {
            // Show confirmation using MODAL (not alert!)
            const confirmed = await confirmModal.show({
                type: 'confirm',
                title: 'Save Settings',
                message: 'Save these settings? This will update your application preferences.',
                okText: 'Save Settings',
                cancelText: 'Cancel',
                okClass: 'btn-primary'
            });
            
            if (!confirmed) {
                console.log('⛔ User cancelled save');
                return;
            }

            // Collect form data
            this.settings = {
                appName: this.getInputValue('appName'),
                timeZone: this.getInputValue('timeZone'),
                language: this.getInputValue('language'),
                currency: this.getInputValue('currency'),
                emailNotif: this.getCheckboxValue('emailNotif'),
                pushNotif: this.getCheckboxValue('pushNotif'),
                smsNotif: this.getCheckboxValue('smsNotif'),
                twoFactor: this.getCheckboxValue('twoFactor'),
                loginAlerts: this.getCheckboxValue('loginAlerts'),
                sessionTimeout: this.getInputValue('sessionTimeout')
            };

            // Save to localStorage
            localStorage.setItem('appSettings', JSON.stringify(this.settings));
            console.log('✅ Settings saved to localStorage!');

            // Show success
            this.showNotification('success', '✅ Settings saved successfully!');
        } catch (error) {
            console.error('❌ Save error:', error);
            this.showNotification('danger', '❌ Failed to save settings');
        }
    }

    /**
     * Show notification
     */
    showNotification(type, message) {
        // Use RedAdminUtils if available
        if (typeof RedAdminUtils !== 'undefined' && RedAdminUtils.showNotification) {
            RedAdminUtils.showNotification(type, message);
        } else {
            // Fallback to alert
            alert(message);
        }
    }
}

// Export singleton
export const settingsMenu = new SettingsMenu();
