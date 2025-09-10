// 数据管理类 - 使用Vercel Serverless API
class DataManager {
    constructor() {
        this.apiBase = '/api';
    }

    // 获取招募信息
    async getListings(filters = {}, page = 1, limit = 12) {
        try {
            // 构建查询参数
            const params = new URLSearchParams();
            
            if (filters.type) params.append('type', filters.type);
            if (filters.server) params.append('server', filters.server);
            if (filters.dungeon) params.append('dungeon', filters.dungeon);
            if (filters.class) params.append('class', filters.class);
            
            params.append('page', page);
            params.append('limit', limit);
            
            const response = await fetch(`${this.apiBase}/listings?${params}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('获取招募信息失败:', error);
            throw error;
        }
    }

    // 提交招募信息
    async submitListing(listingData) {
        try {
            const response = await fetch(`${this.apiBase}/submissions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(listingData)
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('提交招募信息失败:', error);
            throw error;
        }
    }
}

// 创建全局实例
window.dataManager = new DataManager();