import cron from 'node-cron';
import { reportService } from '../services/reportService';
import fs from 'fs';
import path from 'path';

export const initJobs = () => {
  // Scheduled export every day at midnight
  cron.schedule('0 0 * * *', async () => {
    console.log('⏰ Running scheduled export job...');
    try {
      const stats = await reportService.getDashboardStats();
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const logMessage = `${timestamp}: Total Employees: ${stats.totalEmployees}, Approved: ${stats.approvedSheets}\n`;
      
      const exportsDir = path.join(process.cwd(), 'exports');
      if (!fs.existsSync(exportsDir)) {
        fs.mkdirSync(exportsDir);
      }
      
      fs.appendFileSync(path.join(exportsDir, 'daily-summary.log'), logMessage);
      console.log('✅ Daily summary exported.');
    } catch (error) {
      console.error('❌ Scheduled export failed:', error);
    }
  });
};
