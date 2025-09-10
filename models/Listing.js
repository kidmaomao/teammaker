export class Listing {
  constructor(data) {
    this.type = data.type;
    this.server = data.server;
    this.title = data.title;
    this.dungeon = data.dungeon;
    this.playerClass = data.playerClass || '';
    this.damageRequirement = data.damageRequirement || '';
    this.piercingRequirement = data.piercingRequirement || '';
    this.targetMembers = data.targetMembers || '';
    this.rewardMethod = data.rewardMethod || '';
    this.gameTime = data.gameTime;
    this.contact = data.contact;
    this.requirements = data.requirements || '';
    this.id = data.id || this.generateId();
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = new Date();
    this.viewCount = data.viewCount || 0;
    this.status = data.status || 'active';
  }

  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  }

  validate() {
    const errors = [];
    
    if (!this.type || !['recruitment', 'looking'].includes(this.type)) {
      errors.push('类型必须为 recruitment（招募队伍）或 looking（寻找队伍）');
    }
    
    if (!this.server || !['亚特服', '伊鲁夏服'].includes(this.server)) {
      errors.push('服务器必须为 亚特服 或 伊鲁夏服');
    }
    
    if (!this.title || this.title.trim().length < 2) {
      errors.push('标题不能为空且至少2个字符');
    }
    
    if (this.title && this.title.length > 100) {
      errors.push('标题长度不能超过100个字符');
    }
    
    const validDungeons = ['猫本', '雪本', '布本', '活动地狱之门'];
    if (!this.dungeon || !validDungeons.includes(this.dungeon)) {
      errors.push(`副本必须为: ${validDungeons.join(', ')}`);
    }
    
    const validClasses = ['', '圣骑', '黑魔', '流星', '魔剑', '圣歌', '爆骑'];
    if (this.playerClass && !validClasses.includes(this.playerClass)) {
      errors.push(`职业必须为: ${validClasses.filter(c => c).join(', ')} 或不指定`);
    }
    
    if (this.piercingRequirement) {
      const piercing = parseInt(this.piercingRequirement);
      if (isNaN(piercing) || piercing < 0 || piercing > 11) {
        errors.push('穿刺要求必须是0-11之间的数字');
      }
    }
    
    if (this.targetMembers) {
      const members = parseInt(this.targetMembers);
      if (isNaN(members) || members < 1 || members > 8) {
        errors.push('目标人数必须是1-8之间的数字');
      }
    }
    
    if (!this.gameTime || this.gameTime.trim().length < 2) {
      errors.push('游戏时间不能为空');
    }
    
    if (this.gameTime && this.gameTime.length > 50) {
      errors.push('游戏时间长度不能超过50个字符');
    }
    
    if (!this.contact || this.contact.trim().length < 2) {
      errors.push('联系方式不能为空');
    }
    
    if (this.contact && this.contact.length > 100) {
      errors.push('联系方式长度不能超过100个字符');
    }
    
    if (this.requirements && this.requirements.length > 500) {
      errors.push('其他要求长度不能超过500个字符');
    }
    
    return errors;
  }

  toJSON() {
    return {
      id: this.id,
      type: this.type,
      server: this.server,
      title: this.title,
      dungeon: this.dungeon,
      playerClass: this.playerClass,
      damageRequirement: this.damageRequirement,
      piercingRequirement: this.piercingRequirement,
      targetMembers: this.targetMembers,
      rewardMethod: this.rewardMethod,
      gameTime: this.gameTime,
      contact: this.contact,
      requirements: this.requirements,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      viewCount: this.viewCount,
      status: this.status
    };
  }

  static fromJSON(jsonData) {
    return new Listing(jsonData);
  }

  isExpired() {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return this.createdAt < sevenDaysAgo;
  }

  incrementViewCount() {
    this.viewCount += 1;
    this.updatedAt = new Date();
    return this.viewCount;
  }

  getFormattedCreatedAt() {
    return this.createdAt.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getShortDescription() {
    const maxLength = 100;
    if (this.requirements && this.requirements.length > maxLength) {
      return this.requirements.substring(0, maxLength) + '...';
    }
    return this.requirements || '暂无详细描述';
  }

  getClassIcon() {
    const classIcons = {
      '圣骑': 'bi-shield',
      '黑魔': 'bi-magic',
      '流星': 'bi-stars',
      '魔剑': 'bi-sword',
      '圣歌': 'bi-music-note',
      '爆骑': 'bi-lightning'
    };
    return classIcons[this.playerClass] || 'bi-person';
  }

  getDungeonIcon() {
    const dungeonIcons = {
      '猫本': 'bi-tree',
      '雪本': 'bi-snow',
      '布本': 'bi-building',
      '活动地狱之门': 'bi-door-open'
    };
    return dungeonIcons[this.dungeon] || 'bi-question-circle';
  }

  getServerBadgeClass() {
    return this.server === '亚特服' ? 'bg-primary' : 'bg-info';
  }

  getTypeLabel() {
    return this.type === 'recruitment' ? '招募队伍' : '寻找队伍';
  }

  getTypeBadgeClass() {
    return this.type === 'recruitment' ? 'bg-success' : 'bg-warning text-dark';
  }
}

export default Listing;