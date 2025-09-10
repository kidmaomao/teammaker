// public/scripts/form-handler.js

class FormHandler {
    constructor() {
        this.modal = null;
        this.form = document.getElementById('listingForm');
        this.submitBtn = document.getElementById('submitListing');
        this.bindEvents();
    }

    bindEvents() {
        // 表单提交事件
        if (this.form) {
            this.form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSubmit();
            });
        }

        // 模态框显示事件
        const postModal = document.getElementById('postModal');
        if (postModal) {
            postModal.addEventListener('show.bs.modal', () => {
                this.modal = new bootstrap.Modal(postModal);
                this.resetForm();
            });

            postModal.addEventListener('hidden.bs.modal', () => {
                this.resetForm();
            });
        }

        // 手动提交按钮事件
        if (this.submitBtn) {
            this.submitBtn.addEventListener('click', () => {
                this.handleSubmit();
            });
        }

        // 实时表单验证
        this.bindRealTimeValidation();
    }

    bindRealTimeValidation() {
        const inputs = this.form?.querySelectorAll('input, select, textarea');
        if (inputs) {
            inputs.forEach(input => {
                input.addEventListener('blur', () => {
                    this.validateField(input);
                });
                
                input.addEventListener('input', () => {
                    this.clearFieldError(input);
                });
            });
        }
    }

    validateField(field) {
        const value = field.value.trim();
        const fieldName = field.id;
        let isValid = true;
        let errorMessage = '';

        switch (fieldName) {
            case 'title':
                if (!value) {
                    errorMessage = '标题不能为空';
                    isValid = false;
                } else if (value.length < 2) {
                    errorMessage = '标题至少需要2个字符';
                    isValid = false;
                } else if (value.length > 100) {
                    errorMessage = '标题不能超过100个字符';
                    isValid = false;
                }
                break;

            case 'gameTime':
                if (!value) {
                    errorMessage = '游戏时间不能为空';
                    isValid = false;
                } else if (value.length > 50) {
                    errorMessage = '游戏时间不能超过50个字符';
                    isValid = false;
                }
                break;

            case 'contact':
                if (!value) {
                    errorMessage = '联系方式不能为空';
                    isValid = false;
                } else if (value.length > 100) {
                    errorMessage = '联系方式不能超过100个字符';
                    isValid = false;
                }
                break;

            case 'requirements':
                if (value.length > 500) {
                    errorMessage = '其他要求不能超过500个字符';
                    isValid = false;
                }
                break;

            case 'targetMembers':
                if (value) {
                    const members = parseInt(value);
                    if (isNaN(members) || members < 1 || members > 8) {
                        errorMessage = '目标人数必须是1-8之间的数字';
                        isValid = false;
                    }
                }
                break;
        }

        if (!isValid) {
            this.showFieldError(field, errorMessage);
        } else {
            this.clearFieldError(field);
        }

        return isValid;
    }

    showFieldError(field, message) {
        this.clearFieldError(field);
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'invalid-feedback';
        errorDiv.textContent = message;
        errorDiv.id = `${field.id}-error`;
        
        field.classList.add('is-invalid');
        
        const parent = field.parentElement;
        if (parent.querySelector('.invalid-feedback')) {
            parent.removeChild(parent.querySelector('.invalid-feedback'));
        }
        parent.appendChild(errorDiv);
    }

    clearFieldError(field) {
        field.classList.remove('is-invalid');
        const errorDiv = document.getElementById(`${field.id}-error`);
        if (errorDiv) {
            errorDiv.remove();
        }
    }

    validateForm() {
        let isValid = true;
        const requiredFields = this.form.querySelectorAll('[required]');
        
        // 验证必填字段
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                this.showFieldError(field, '此字段为必填项');
                isValid = false;
            } else {
                const fieldValid = this.validateField(field);
                if (!fieldValid) {
                    isValid = false;
                }
            }
        });

        // 验证选填字段
        const optionalFields = this.form.querySelectorAll('input:not([required]), select:not([required]), textarea:not([required])');
        optionalFields.forEach(field => {
            if (field.value.trim()) {
                const fieldValid = this.validateField(field);
                if (!fieldValid) {
                    isValid = false;
                }
            }
        });

        return isValid;
    }

    getFormData() {
        return {
            type: document.getElementById('listingType').value,
            server: document.getElementById('server').value,
            title: document.getElementById('title').value.trim(),
            dungeon: document.getElementById('dungeon').value,
            playerClass: document.getElementById('playerClass').value || '',
            damageRequirement: document.getElementById('damageRequirement').value.trim() || '',
            piercingRequirement: document.getElementById('piercingRequirement').value || '',
            targetMembers: document.getElementById('targetMembers').value || '',
            rewardMethod: document.getElementById('rewardMethod').value || '',
            gameTime: document.getElementById('gameTime').value.trim(),
            contact: document.getElementById('contact').value.trim(),
            requirements: document.getElementById('requirements').value.trim() || ''
        };
    }

    async handleSubmit() {
        try {
            // 验证表单
            if (!this.validateForm()) {
                this.showAlert('danger', '请检查表单中的错误');
                return;
            }

            // 获取表单数据
            const formData = this.getFormData();

            // 禁用提交按钮，防止重复提交
            this.setSubmitButtonState(true);

            // 提交数据
            const result = await window.dataManager.submitListing(formData);

            if (result.success) {
                // 显示成功消息
                this.showAlert('success', '招募信息发布成功！');

                // 关闭模态框
                if (this.modal) {
                    this.modal.hide();
                }

                // 重置表单
                this.resetForm();

                // 刷新列表
                if (typeof window.app !== 'undefined') {
                    window.app.refreshListings();
                }
            } else {
                this.showAlert('danger', `发布失败: ${result.message}`);
                if (result.errors) {
                    console.error('验证错误:', result.errors);
                }
            }
        } catch (error) {
            console.error('提交表单失败:', error);
            this.showAlert('danger', '发布失败，请检查网络连接后重试');
        } finally {
            // 恢复提交按钮
            this.setSubmitButtonState(false);
        }
    }

    setSubmitButtonState(loading) {
        if (this.submitBtn) {
            if (loading) {
                this.submitBtn.disabled = true;
                this.submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> 发布中...';
            } else {
                this.submitBtn.disabled = false;
                this.submitBtn.innerHTML = '发布招募';
            }
        }
    }

    resetForm() {
        if (this.form) {
            this.form.reset();
            
            // 清除所有错误提示
            const errorFields = this.form.querySelectorAll('.is-invalid');
            errorFields.forEach(field => {
                field.classList.remove('is-invalid');
            });
            
            const errorMessages = this.form.querySelectorAll('.invalid-feedback');
            errorMessages.forEach(msg => msg.remove());
        }

        // 恢复提交按钮状态
        this.setSubmitButtonState(false);
    }

    showAlert(type, message) {
        // 移除现有的警告
        const existingAlerts = document.querySelectorAll('.alert');
        existingAlerts.forEach(alert => alert.remove());

        // 创建新的警告
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
        alertDiv.style.cssText = 'position: fixed; top: 80px; right: 20px; z-index: 1050; min-width: 300px;';
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.appendChild(alertDiv);
        
        // 5秒后自动消失
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.remove();
            }
        }, 5000);
    }

    // 填充表单用于测试
    fillSampleData(type = 'recruitment') {
        const sampleData = {
            recruitment: {
                listingType: 'recruitment',
                server: '亚特服',
                title: '猫本速刷队招人',
                dungeon: '猫本',
                playerClass: '黑魔',
                damageRequirement: '魔剑大伤2000+',
                piercingRequirement: '8',
                targetMembers: '4',
                rewardMethod: '自roll',
                gameTime: '今晚8点开始',
                contact: '游戏ID: 风之骑士',
                requirements: '需要语音交流，熟悉猫本机制'
            },
            looking: {
                listingType: 'looking',
                server: '伊鲁夏服',
                title: '寻找猫本队伍',
                dungeon: '猫本',
                playerClass: '圣骑',
                damageRequirement: '大伤1800',
                piercingRequirement: '7',
                targetMembers: '',
                rewardMethod: '',
                gameTime: '周末全天',
                contact: 'QQ: 123456789',
                requirements: '有T经验，求稳定队伍'
            }
        };

        const data = sampleData[type] || sampleData.recruitment;

        document.getElementById('listingType').value = data.listingType;
        document.getElementById('server').value = data.server;
        document.getElementById('title').value = data.title;
        document.getElementById('dungeon').value = data.dungeon;
        document.getElementById('playerClass').value = data.playerClass;
        document.getElementById('damageRequirement').value = data.damageRequirement;
        document.getElementById('piercingRequirement').value = data.piercingRequirement;
        document.getElementById('targetMembers').value = data.targetMembers;
        document.getElementById('rewardMethod').value = data.rewardMethod;
        document.getElementById('gameTime').value = data.gameTime;
        document.getElementById('contact').value = data.contact;
        document.getElementById('requirements').value = data.requirements;
    }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    window.formHandler = new FormHandler();
    
    // 开发环境下添加测试按钮
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        addTestButtons();
    }
});

// 添加测试按钮（仅开发环境）
function addTestButtons() {
    const testDiv = document.createElement('div');
    testDiv.style.cssText = 'position: fixed; bottom: 20px; right: 20px; z-index: 1000;';
    testDiv.innerHTML = `
        <div class="btn-group-vertical">
            <button class="btn btn-sm btn-outline-primary" onclick="window.formHandler.fillSampleData('recruitment')">
                填充招募数据
            </button>
            <button class="btn btn-sm btn-outline-secondary" onclick="window.formHandler.fillSampleData('looking')">
                填充寻找数据
            </button>
            <button class="btn btn-sm btn-outline-info" onclick="window.formHandler.resetForm()">
                重置表单
            </button>
        </div>
    `;
    document.body.appendChild(testDiv);
}

// 导出供其他模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FormHandler;
}