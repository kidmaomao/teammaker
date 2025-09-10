// api/listings.js
const { getCollection } = require('../../lib/mongodb');
const { Listing } = require('../../models/Listing');

module.exports = async (req, res) => {
  // 设置CORS头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    try {
      const { type, server, dungeon, page = 1, limit = 12 } = req.query;
      
      const collection = await getCollection('listings');
      
      let query = { status: 'active' };
      
      if (type && type !== 'all') {
        query.type = type;
      }
      
      if (server && server !== 'all') {
        query.server = server;
      }
      
      if (dungeon && dungeon !== 'all') {
        query.dungeon = dungeon;
      }
      
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const skip = (pageNum - 1) * limitNum;
      
      const listings = await collection
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .toArray();
      
      const total = await collection.countDocuments(query);
      
      return res.status(200).json({
        success: true,
        data: listings,
        total,
        page: pageNum,
        totalPages: Math.ceil(total / limitNum)
      });
      
    } catch (error) {
      console.error('获取数据失败:', error);
      return res.status(500).json({ 
        success: false, 
        message: '服务器内部错误' 
      });
    }
  }

  return res.status(405).json({ success: false, message: '方法不允许' });
};
