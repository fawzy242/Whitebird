/**
 * Profile Menu Module - CORRECT IMPLEMENTATION
 * Handles change avatar and change password actions
 */

export class ProfileMenu {
  constructor() {
    this.currentUser = this.loadUserData();
  }

  /**
   * Initialize profile module
   */
  initialize() {
    console.log('🎯 Profile Menu Initializing...');
    this.setupEventListeners();
    console.log('✅ Profile Menu Initialized!');
  }

  /**
   * Load user data from localStorage
   */
  loadUserData() {
    const saved = localStorage.getItem('currentUser');
    return saved
      ? JSON.parse(saved)
      : {
          name: 'John Doe',
          email: 'john.doe@company.com',
          avatar: null,
        };
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Change Avatar button
    const changeAvatarBtn = document.getElementById('changeAvatarBtn');
    if (changeAvatarBtn) {
      changeAvatarBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.handleChangeAvatar();
      });
      console.log('   ✅ Change Avatar button listener attached');
    } else {
      console.warn('   ⚠️ Change Avatar button not found!');
    }

    // Change Password button
    const changePasswordBtn = document.getElementById('changePasswordBtn');
    if (changePasswordBtn) {
      changePasswordBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.handleChangePassword();
      });
      console.log('   ✅ Change Password button listener attached');
    } else {
      console.warn('   ⚠️ Change Password button not found!');
    }

    // Profile Form Submit
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
      profileForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleSaveProfile();
      });
      console.log('   ✅ Profile form submit listener attached');
    }

    // Reset Form button
    const resetFormBtn = document.getElementById('resetFormBtn');
    if (resetFormBtn) {
      resetFormBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.handleResetForm();
      });
      console.log('   ✅ Reset form button listener attached');
    }

    // Cancel Profile button
    const cancelProfileBtn = document.getElementById('cancelProfileBtn');
    if (cancelProfileBtn) {
      cancelProfileBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.handleCancel();
      });
      console.log('   ✅ Cancel button listener attached');
    }
  }

  /**
   * Handle change avatar click
   */
  handleChangeAvatar() {
    console.log('📷 Change Avatar clicked!');

    // Create hidden file input
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.style.display = 'none';

    input.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        this.previewAvatar(file);
      }
    });

    document.body.appendChild(input);
    input.click();
    document.body.removeChild(input);
  }

  /**
   * Preview avatar
   */
  previewAvatar(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      // Find avatar image and update
      const avatarImg = document.querySelector('.profile-avatar img');
      if (avatarImg) {
        avatarImg.src = e.target.result;
        this.currentUser.avatar = e.target.result;
        localStorage.setItem('currentUser', JSON.stringify(this.currentUser));

        this.showNotification('success', '✅ Avatar updated!');
      }
    };
    reader.readAsDataURL(file);
  }

  /**
   * Handle change password click - REDIRECT TO PAGE
   */
  handleChangePassword() {
    console.log('🔑 Change Password clicked - redirecting...');

    // Redirect to reset-password page using router
    if (window.router) {
      window.router.navigate('reset-password');
    } else {
      window.location.href = '/reset-password';
    }
  }

  /**
   * Handle save profile
   */
  handleSaveProfile() {
    console.log('💾 Saving profile...');

    // Get form values
    const formData = {
      firstName: document.getElementById('firstName')?.value,
      lastName: document.getElementById('lastName')?.value,
      email: document.getElementById('profileEmail')?.value,
      phone: document.getElementById('profilePhone')?.value,
      bio: document.getElementById('profileBio')?.value,
      department: document.getElementById('profileDepartment')?.value,
      position: document.getElementById('profilePosition')?.value,
      location: document.getElementById('profileLocation')?.value,
      language: document.getElementById('profileLanguage')?.value,
      timezone: document.getElementById('profileTimezone')?.value,
    };

    // Simple validation
    if (!formData.firstName || !formData.lastName || !formData.email) {
      this.showNotification('danger', '❌ Please fill in all required fields');
      return;
    }

    // Simulate saving (in real app, send to API)
    console.log('Profile data:', formData);

    // Show loading state
    const saveBtn = document.getElementById('saveProfileBtn');
    if (saveBtn) {
      const originalText = saveBtn.innerHTML;
      saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Saving...';
      saveBtn.disabled = true;

      // Simulate API call
      setTimeout(() => {
        saveBtn.innerHTML = originalText;
        saveBtn.disabled = false;
        this.showNotification('success', '✅ Profile updated successfully!');
      }, 1000);
    }
  }

  /**
   * Handle reset form
   */
  handleResetForm() {
    console.log('🔄 Resetting form...');

    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
      profileForm.reset();
      this.showNotification('info', '↻ Form reset to default values');
    }
  }

  /**
   * Handle cancel
   */
  handleCancel() {
    console.log('❌ Cancel clicked...');

    // Navigate back to dashboard using router
    if (window.router) {
      window.router.navigate('dashboard');
    } else {
      window.location.href = '/dashboard';
    }
  }

  /**
   * Handle save password
   */
  handleSavePassword(modal) {
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      this.showNotification('danger', '❌ Please fill in all fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      this.showNotification('danger', '❌ Passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      this.showNotification('danger', '❌ Password must be at least 8 characters');
      return;
    }

    // Close modal
    modal.hide();

    // Show success
    this.showNotification('success', '✅ Password changed successfully!');
  }

  /**
   * Show notification
   */
  showNotification(type, message) {
    if (typeof RedAdminUtils !== 'undefined' && RedAdminUtils.showNotification) {
      RedAdminUtils.showNotification(type, message);
    } else {
      alert(message);
    }
  }
}

// Export singleton
export const profileMenu = new ProfileMenu();
