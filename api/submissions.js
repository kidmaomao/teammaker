import { getCollection } from '../../lib/mongodb';
import { Listing } from '../../models/Listing';
import { v4 as uuidv4 } from 'uuid';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    try {
      const listingData = req.body;
      
      const listing = new Listing(listingData);
      
      const errors = listing.validate();
      if (errors.length > 0) {
        return res.status(400).json({ 
          success: false, 
          message: '数据验证失败',
          errors 
        });
      }
      
      listing.id = uuidv4();
      
      const collection = await getCollection('listings');
      
      const result = await collection.insertOne(listing.toJSON());
      
      if (result.acknowledged) {
        return res.status(201).json({ 
          success: true, 
          message: '招募信息发布成功',
          id: listing.id
        });
      } else {
        return res.status(500).json({ 
          success: false, 
          message: '保存数据失败' 
        });
      }
      
    } catch (error) {
      console.error('处理提交时出错:', error);
      return res.status(500).json({ 
        success: false, 
        message: '服务器内部错误' 
      });
    }
  }

  return res.status(405).json({ success: false, message: '方法不允许' });
}