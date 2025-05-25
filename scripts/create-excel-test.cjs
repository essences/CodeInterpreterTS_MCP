const XLSX = require('xlsx');
const fs = require('fs');

// 大きなExcelファイル（10万行）を作成
const createLargeExcelFile = () => {
    console.log('大きなExcelファイルを作成しています...');
    console.time('Excel作成時間');
    
    // ワークブックを作成
    const wb = XLSX.utils.book_new();
      // データを生成（5万行のデータを作成）
    const numRows = 50000; // 5万行
    const data = [];
    
    // ヘッダー行
    data.push(['ID', 'Value1', 'Value2', 'Value3', 'Sum', 'Product']);
    
    // データ行を生成
    for (let i = 1; i <= numRows; i++) {
        const value1 = Math.random() * 1000;
        const value2 = Math.random() * 500;
        const value3 = Math.random() * 200;
        const sum = value1 + value2 + value3;
        const product = value1 * value2 * value3;
        
        data.push([i, value1, value2, value3, sum, product]);
          // 進捗を表示
        if (i % 5000 === 0) {
            console.log(`進捗: ${i}/${numRows} 行作成完了`);
        }
    }
    
    // ワークシートを作成
    const ws = XLSX.utils.aoa_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, 'LargeData');
    
    // ファイルパス
    const filePath = './large-test-data.xlsx';
    
    // Excelファイルを書き込み
    XLSX.writeFile(wb, filePath);
    
    console.log(`大きなExcelファイルが作成されました: ${filePath}`);
    console.log(`データ行数: ${numRows} 行`);
    
    // ファイルサイズを確認
    const stats = fs.statSync(filePath);
    const fileSizeInMB = stats.size / (1024 * 1024);
    console.log(`ファイルサイズ: ${fileSizeInMB.toFixed(2)} MB`);
    
    console.timeEnd('Excel作成時間');
    return filePath;
};

// ファイルを作成
const filePath = createLargeExcelFile();
console.log('Excel ファイル作成完了:', filePath);
