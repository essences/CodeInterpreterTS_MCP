const XLSX = require('xlsx');
const fs = require('fs');

// Excelファイルを読み取り、統計計算を行う
const calculateExcelStatistics = (filePath) => {
    console.log('Excelファイルの統計計算を開始します...');
    console.time('Excel読み取り・計算時間');
    
    // Excelファイルを読み込み
    console.log('Excelファイルを読み込み中...');
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // JSONに変換（ヘッダー付き）
    console.log('データを変換中...');
    const jsonData = XLSX.utils.sheet_to_json(worksheet);
    
    console.log(`読み込み完了: ${jsonData.length} 行のデータ`);
    
    // 統計計算
    const columns = ['Value1', 'Value2', 'Value3', 'Sum', 'Product'];
    const stats = {};
    
    // 各列の統計用変数を初期化
    columns.forEach(col => {
        stats[col] = {
            sum: 0,
            count: 0,
            mean: 0,
            m2: 0  // 分散計算用
        };
    });
    
    // Welford のオンライン分散計算アルゴリズム
    const updateOnlineStats = (stat, value) => {
        stat.count++;
        const delta = value - stat.mean;
        stat.mean += delta / stat.count;
        const delta2 = value - stat.mean;
        stat.m2 += delta * delta2;
        stat.sum += value;
    };
    
    // データ処理
    console.log('統計計算中...');
    let processedRows = 0;
    
    jsonData.forEach((row, index) => {
        columns.forEach(col => {
            const value = parseFloat(row[col]);
            if (!isNaN(value)) {
                updateOnlineStats(stats[col], value);
            }
        });
        
        processedRows++;
        if (processedRows % 10000 === 0) {
            console.log(`進捗: ${processedRows}/${jsonData.length} 行処理完了`);
        }
    });
    
    console.log(`\n=== Excel統計計算結果 ===`);
    console.log(`処理行数: ${processedRows.toLocaleString()} 行`);
    
    // 結果を表示
    columns.forEach(col => {
        const stat = stats[col];
        const variance = stat.count > 1 ? stat.m2 / (stat.count - 1) : 0;
        const standardDeviation = Math.sqrt(variance);
        
        console.log(`\n${col.toUpperCase()}:`);
        console.log(`  合計: ${stat.sum.toLocaleString()}`);
        console.log(`  平均: ${stat.mean.toFixed(6)}`);
        console.log(`  標準偏差: ${standardDeviation.toFixed(6)}`);
        console.log(`  分散: ${variance.toFixed(6)}`);
    });
    
    console.timeEnd('Excel読み取り・計算時間');
    
    return {
        rowCount: processedRows,
        statistics: Object.fromEntries(
            columns.map(col => [
                col.toLowerCase(),
                {
                    sum: stats[col].sum,
                    mean: stats[col].mean,
                    standardDeviation: Math.sqrt(stats[col].count > 1 ? stats[col].m2 / (stats[col].count - 1) : 0),
                    variance: stats[col].count > 1 ? stats[col].m2 / (stats[col].count - 1) : 0
                }
            ])
        )
    };
};

// ファイルサイズを確認
const filePath = './large-test-data.xlsx';
if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    const fileSizeInMB = stats.size / (1024 * 1024);
    console.log(`Excelファイル: ${filePath}`);
    console.log(`ファイルサイズ: ${fileSizeInMB.toFixed(2)} MB`);
    
    // 統計計算を実行
    calculateExcelStatistics(filePath);
} else {
    console.error('Excelファイルが見つかりません:', filePath);
}
