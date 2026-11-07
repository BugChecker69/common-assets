/**
 * I-BO Common Utilities
 */
const IBO = {
  // 画面スリープ防止制御（Wake Lock API）
  wakeLock: {
    sentinel: null,
    async enable() {
      if ('wakeLock' in navigator) {
        try {
          this.sentinel = await navigator.wakeLock.request('screen');
          console.log('[IBO] WakeLock active');
        } catch (err) {
          console.error('[IBO] WakeLock error:', err);
        }
      }
    },
    disable() {
      if (this.sentinel) {
        this.sentinel.release().then(() => {
          this.sentinel = null;
          console.log('[IBO] WakeLock released');
        });
      }
    },
    // バックグラウンド復帰時の再取得ハンドラ
    autoReacquire() {
      document.addEventListener('visibilitychange', async () => {
        if (this.sentinel !== null && document.visibilityState === 'visible') {
          await this.enable();
        }
      });
    }
  },

  // ファイルダウンロード共通処理（Blob生成とトリガー）
  downloadBlob(content, fileName, mimeType = 'text/plain;charset=utf-8;') {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  // 日時文字列生成 (デフォルト: YYYYMMDD_HHMMSS)
  getTimestamp(format = 'datetime', date = new Date()) {
    const pad = (n) => String(n).padStart(2, '0');
    const yyyy = date.getFullYear();
    const mm = pad(date.getMonth() + 1);
    const dd = pad(date.getDate());
    const hh = pad(date.getHours());
    const min = pad(date.getMinutes());
    const ss = pad(date.getSeconds());

    if (format === 'date') return `${yyyy}${mm}${dd}`;
    if (format === 'time') return `${hh}${min}${ss}`;
    return `${yyyy}${mm}${dd}_${hh}${min}${ss}`;
  },

  // CSVユーティリティ
  csv: {
    // 1行のCSV文字列を配列に分割（ダブルクォート考慮）
    parseLine(line) {
      const match = line.match(/(?:^|,)("(?:[^"]|"")*"|[^,]*)/g);
      if (!match) return [];
      return match.map(val => {
        let v = val.replace(/^,/, '').trim();
        if (v.startsWith('"') && v.endsWith('"')) {
          v = v.substring(1, v.length - 1).replace(/""/g, '"');
        }
        return v;
      });
    },
    // 配列を行CSV文字列に変換（必要に応じてエスケープ）
    formatRow(array) {
      return array.map(val => {
        const str = String(val === undefined || val === null ? '' : val);
        return `"${str.replace(/"/g, '""')}"`;
      }).join(',');
    }
  }
};
