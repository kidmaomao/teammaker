class MabinogiPartyFinder {
    constructor() {
        this.dataManager = window.dataManager;
        this.currentFilters = {
            type: 'teams',
            server: '',
            dungeon: 'all',
            class: ''
        };
        this.currentPage = 1;
        this.limit = 12;
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadListings();
    }

    bindEvents() {
        // 选项卡切换
        document.getElementById('teamsTab').addEventListener('click', (e) => {
            e.preventDefault();
            this.currentFilters.type = 'teams';
            this.currentPage = 1;
            this.loadListings();
        });
        
        document.getElementById('playersTab').addEventListener('click', (e) => {
            e.preventDefault();
            this.currentFilters.type = 'players';
            this.currentPage = 1;
            this.loadListings();
        });

        // 筛选表单提交
        document.getElementById('applyFilters').addEventListener('click', () => {
            this.applyFilters();
        });

        // 重置筛选
        document.getElementById('resetFilters').addEventListener('click', () => {
            this.resetFilters();
        });

        // 表单提交
        document.getElementById('submitListing').addEventListener('click', () => {
            this.handleFormSubmit();
        });
    }

    applyFilters() {
        this.currentFilters.server = document.getElementById('serverFilter').value;
        this.currentFilters.dungeon = document.getElementById('dungeonFilter').value;
        this.currentFilters.class = document.getElementById('classFilter').value;
        this.currentPage = 1;
        
        this.loadListings();
    }

    resetFilters() {
        document.getElementById('serverFilter').value = '';
        document.getElementById('dungeonFilter').value = 'all';
        document.getElementById('classFilter').value = '';
        document.getElementById('sortFilter').value = 'newest';
        
        this.currentFilters = {
            type: this.currentFilters.type,
            server: '',
            dungeon: 'all',
            class: ''
        };
        this.currentPage = 1;
        
        this.loadListings();
    }

    async loadListings() {
        try {
            // 显示加载指示器
            document.getElementById('loadingIndicator').style.display = 'block';
            document.getElementById('listingsContainer').innerHTML = '';
            document.getElementById('emptyState').style.display = 'none';
            document.getElementById('paginationContainer').style.display = 'none';
            
            const result = await this.dataManager.getListings(
                this.currentFilters, 
                this.currentPage, 
                this.limit
            );
            
            // 隐藏加载指示器
            document.getElementById('loadingIndicator').style.display = 'none';
            
            if (result.success && result.data.length > 0) {
                this.renderListings(result.data);
                
                // 显示分页控件
                if (result.totalPages > 1) {
                    this.renderPagination(result.total, result.totalPages);
                    document.getElementById('paginationContainer').style.display = 'flex';
                }
            } else {
                // 显示空状态
                document.getElementById('emptyState').style.display = 'block';
            }
        } catch (error) {
            console.error('加载招募信息失败:', error);
            document.getElementById('loadingIndicator').style.display = 'none';
            document.getElementById('listingsContainer').innerHTML = `
                <div class="col-12 text-center my-5">
                    <div class="alert alert-danger">
                        <i class="bi bi-exclamation-triangle"></i> 加载数据失败，请刷新页面重试
                    </div>
                </div>
            `;
        }
    }

    renderListings(listings) {
        const container = document.getElementById('listingsContainer');
        container.innerHTML = listings.map(listing => {
            if (listing.type === 'recruitment') {
                return this.createTeamCard(listing);
            } else {
                return this.createPlayerCard(listing);
            }
        }).join('');
    }

    createTeamCard(team) {
        return `
            <div class="col-md-6 col-lg-4 mb-4">
                <div class="card h-100">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <h5 class="card-title mb-0">${team.title}</h5>
                            <span class="badge bg-secondary">${team.server}</span>
                        </div>
                        <div class="mb-3">
                            <span class="badge bg-primary requirement-badge">${team.dungeon}</span>
                            ${team.playerClass ? `<span class="badge bg-info text-dark requirement-badge">需要: ${team.playerClass}</span>` : ''}
                        </div>
                        <div class="mb-3">
                            ${team.damageRequirement ? `<p class="mb-1"><i class="bi bi-bar-chart"></i> 面板要求: ${team.damageRequirement}</p>` : ''}
                            ${team.piercingRequirement ? `<p class="mb-1"><i class="bi bi-lightning-charge"></i> 穿刺要求: ${team.piercingRequirement}+</p>` : ''}
                            ${team.targetMembers ? `<p class="mb-1"><i class="bi bi-people"></i> 目标人数: ${team.targetMembers}</p>` : ''}
                            <p class="mb-1"><i class="bi bi-clock"></i> 游戏时间: ${team.gameTime}</p>
                            <p class="mb-1"><i class="bi bi-award"></i> 奖励分配: ${team.rewardMethod || '未指定'}</p>
                        </div>
                        ${team.requirements ? `<p class="card-text"><i class="bi bi-chat-dots"></i> 其他要求: ${team.requirements}</p>` : ''}
                        <p class="card-text"><i class="bi bi-person-lines-fill"></i> 联系方式: ${team.contact}</p>
                        <div class="text-muted small">发布时间: ${new Date(team.createdAt).toLocaleString()}</div>
                    </div>
                </div>
            </div>
        `;
    }

    createPlayerCard(player) {
        return `
            <div class="col-md-6 col-lg-4 mb-4">
                <div class="card h-100">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <h5 class="card-title mb-0">寻找队伍</h5>
                            <span class="badge bg-secondary">${player.server}</span>
                        </div>
                        <div class="mb-3">
                            <span class="badge bg-primary requirement-badge">${player.dungeon}</span>
                            ${player.playerClass ? `<span class="badge bg-success requirement-badge">职业: ${player.playerClass}</span>` : ''}
                        </div>
                        <div class="mb-3">
                            ${player.damageRequirement ? `<p class="mb-1"><i class="bi bi-bar-chart"></i> 我的面板: ${player.damageRequirement}</p>` : ''}
                            ${player.piercingRequirement ? `<p class="mb-1"><i class="bi bi-lightning-charge"></i> 我的穿刺: ${player.piercingRequirement}</p>` : ''}
                            <p class="mb-1"><i class="bi bi-clock"></i> 游戏时间: ${player.gameTime}</p>
                        </div>
                        ${player.requirements ? `<p class="card-text"><i class="bi bi-chat-dots"></i> 自荐: ${player.requirements}</p>` : ''}
                        <p class="card-text"><i class="bi bi-person-lines-fill"></i> 联系方式: ${player.contact}</p>
                        <div class="text-muted small">发布时间: ${new Date(player.createdAt).toLocaleString()}</div>
                    </div>
                </div>
            </div>
        `;
    }

    renderPagination(totalItems, totalPages) {
        const paginationContainer = document.getElementById('paginationContainer');
        let paginationHTML = `
            <li class="page-item ${this.currentPage === 1 ? 'disabled' : ''}" id="prevPage">
                <a class="page-link" href="#" tabindex="-1">上一页</a>
            </li>
        `;
        
        // 显示页码
        for (let i = 1; i <= totalPages; i++) {
            paginationHTML += `
                <li class="page-item ${i === this.currentPage ? 'active' : ''}">
                    <a class="page-link" href="#" data-page="${i}">${i}</a>
                </li>
            `;
        }
        
        paginationHTML += `
            <li class="page-item ${this.currentPage === totalPages ? 'disabled' : ''}" id="nextPage">
                <a class="page-link" href="#">下一页</a>
            </li>
        `;
        
        paginationContainer.querySelector('.pagination').innerHTML = paginationHTML;
        
        // 添加分页事件监听
        paginationContainer.querySelectorAll('.page-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                
                if (link.parentElement.id === 'prevPage') {
                    if (this.currentPage > 1) {
                        this.currentPage--;
                        this.loadListings();
                    }
                } else if (link.parentElement.id === 'nextPage') {
                    if (this.currentPage < totalPages) {
                        this.currentPage++;
                        this.loadListings();
                    }
                } else if (link.dataset.page) {
                    this.currentPage = parseInt(link.dataset.page);
                    this.loadListings();
                }
            });
        });
    }

    async handleFormSubmit() {
        try {
            const form = document.getElementById('listingForm');
            
            // 基本表单验证
            if (!form.checkValidity()) {
                form.reportValidity();
                return;
            }
            
            const formData = {
                type: document.getElementById('listingType').value,
                server: document.getElementById('server').value,
                title: document.getElementById('title').value,
                dungeon: document.getElementById('dungeon').value,
                playerClass: document.getElementById('playerClass').value || '',
                damageRequirement: document.getElementById('damageRequirement').value || '',
                piercingRequirement: document.getElementById('piercingRequirement').value || '',
                targetMembers: document.getElementById('targetMembers').value || '',
                rewardMethod: document.getElementById('rewardMethod').value || '',
                gameTime: document.getElementById('gameTime').value,
                contact: document.getElementById('contact').value,
                requirements: document.getElementById('requirements').value || ''
            };
            
            // 禁用提交按钮，防止重复提交
            const submitBtn = document.getElementById('submitListing');
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> 发布中...';
            
            const result = await this.dataManager.submitListing(formData);
            
            if (result.success) {
                // 显示成功消息
                this.showAlert('success', '招募信息发布成功！');
                
                // 关闭模态框
                bootstrap.Modal.getInstance(document.getElementById('postModal')).hide();
                
                // 重置表单
                form.reset();
                
                // 刷新列表
                this.currentPage = 1;
                this.loadListings();
            } else {
                this.showAlert('danger', `发布失败: ${result.message}`);
            }
        } catch (error) {
            console.error('提交表单失败:', error);
            this.showAlert('danger', '发布失败，请稍后重试');
        } finally {
            // 恢复提交按钮
            const submitBtn = document.getElementById('submitListing');
            submitBtn.disabled = false;
            submitBtn.innerHTML = '发布招募';
        }
    }

    showAlert(type, message) {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.querySelector('.container').prepend(alertDiv);
        
        // 5秒后自动消失
        setTimeout(() => {
            if