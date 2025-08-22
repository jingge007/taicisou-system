// tool.js
class Browser {
  /**
   * 复制文本到剪贴板
   * @param {string} value - 要复制的内容
   * @returns {Promise<void>}
   */
  copyText(value) {
    return navigator.clipboard
      ? navigator.clipboard.writeText(value)
      : new Promise((resolve, reject) => {
        try {
          const input = document.createElement('input');
          input.value = value;
          document.body.appendChild(input);
          input.select();
          document.execCommand('copy');
          input.remove();
          resolve();
        } catch (err) {
          reject(err);
        }
      });
  }
  
  /**
   * 判断是否为 JSON 字符串
   * @param {string} str
   * @returns {boolean}
   */
  isJSON(str) {
    if (typeof str !== 'string') return false;
    try {
      const obj = JSON.parse(str);
      return obj && typeof obj === 'object';
    } catch {
      return false;
    }
  }
  
  /**
   * 格式化日期时间
   * @param {Date} date - 要格式化的日期对象
   * @returns {string} 格式化后的日期字符串 (YYYY-MM-DD HH:mm:ss)
   */
  formatDate(date) {
    if (!date) return '';
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }
}

export default new Browser();
